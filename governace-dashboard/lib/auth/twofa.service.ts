// lib/auth/twofa.service.ts
import crypto from "crypto";
import prisma from "@/prisma/client";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
);

const TWO_FACTOR_CODE_EXPIRY_MINUTES = 10;
const TWO_FACTOR_CODE_EXPIRY_MS = TWO_FACTOR_CODE_EXPIRY_MINUTES * 60 * 1000;
const TWO_FACTOR_MAX_CODES_PER_HOUR = 50;
const TWO_FACTOR_CLEANUP_DAYS = 7;

export interface TwoFactorCodeContext {
  userId: number;
  email: string;
  phoneNumber?: string;
  name: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface TwoFactorAuthResult {
  user: {
    id: number;
    email: string;
    name: string;
    // Add other user fields as needed
  };
  token: string;
}

function generateNumericCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return n.toString().padStart(6, "0");
}

function generateMagicToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function assertRateLimit(userId: number) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.twofactorcode.count({
    where: {
      userId,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  });

  if (count >= TWO_FACTOR_MAX_CODES_PER_HOUR) {
    throw Object.assign(
      new Error(
        "Too many verification codes requested. Please try again later."
      ),
      { code: "TWO_FACTOR_RATE_LIMIT" }
    );
  }
}

async function cleanupOldCodes(userId: number) {
  const cutoff = new Date(
    Date.now() - TWO_FACTOR_CLEANUP_DAYS * 24 * 60 * 60 * 1000
  );
  await prisma.twofactorcode.deleteMany({
    where: {
      userId,
      OR: [{ expiresAt: { lt: cutoff } }, { usedAt: { lt: cutoff } }],
    },
  });
}

async function sendTwoFactorCodeEmail(params: {
  to: string;
  code: string;
  userName: string;
  magicLinkUrl?: string;
}) {
  // TODO: Implement with your email service (Resend, SendGrid, etc.)
  console.log(`Sending 2FA code ${params.code} to ${params.to}`);
  console.log(`Magic link: ${params.magicLinkUrl}`);

  // Example with Resend:
  // const { Resend } = require('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'noreply@yourdomain.com',
  //   to: params.to,
  //   subject: 'Your 2FA Code',
  //   html: `<p>Your code is: <strong>${params.code}</strong></p>`
  // });
}

// SMS sending function (implement with your SMS service)
async function sendTwoFactorCodeSms(params: {
  phoneNumber: string;
  code: string;
  name: string;
}) {
  // TODO: Implement with your SMS service (Twilio, etc.)
  console.log(
    `Sending 2FA code ${params.code} via SMS to ${params.phoneNumber}`
  );
}

export async function generateAndSendTwoFactorCode(
  ctx: TwoFactorCodeContext
): Promise<void> {
  console.log("Generating 2 factor  code");
  await cleanupOldCodes(ctx.userId);
  await assertRateLimit(ctx.userId);

  const code = generateNumericCode();
  const magicToken = generateMagicToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TWO_FACTOR_CODE_EXPIRY_MS);

  const record = await prisma.twofactorcode.create({
    data: {
      userId: ctx.userId,
      code,
      magicToken,
      expiresAt,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    },
  });

  const frontendUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLinkUrl = record.magicToken
    ? `${frontendUrl}/login?mode=magic&userId=${ctx.userId}&token=${record.magicToken}`
    : undefined;

  await sendTwoFactorCodeEmail({
    to: ctx.email,
    code,
    userName: ctx.name,
    ...(magicLinkUrl ? { magicLinkUrl } : {}),
  });

  if (ctx.phoneNumber) {
    await sendTwoFactorCodeSms({
      phoneNumber: ctx.phoneNumber,
      code,
      name: ctx.name,
    });
  }
}

async function buildAuthResultForUser(
  userId: number
): Promise<TwoFactorAuthResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userrole: {
        include: {
          role: {
            include: {
              rolepermission: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
      userdepartment: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), {
      code: "USER_NOT_FOUND",
    });
  }

  // Create JWT token
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword as any,
    token,
  };
}

export async function verifyCodeAndIssueTokens(params: {
  userId: number;
  code: string;
}): Promise<TwoFactorAuthResult> {
  const cleanedCode = params.code.replace(/\D/g, "");
  if (!cleanedCode) {
    throw Object.assign(new Error("Invalid verification code"), {
      code: "TWO_FACTOR_INVALID_CODE",
    });
  }

  const now = new Date();
  const record = await prisma.twofactorcode.findFirst({
    where: {
      userId: params.userId,
      code: cleanedCode,
      expiresAt: { gt: now },
      usedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw Object.assign(new Error("Code is invalid or has expired"), {
      code: "TWO_FACTOR_INVALID_CODE",
    });
  }

  await prisma.twofactorcode.update({
    where: { id: record.id },
    data: { usedAt: now },
  });

  return buildAuthResultForUser(params.userId);
}

export async function verifyMagicTokenAndIssueTokens(params: {
  userId: number;
  token: string;
}): Promise<TwoFactorAuthResult> {
  const now = new Date();
  const record = await prisma.twofactorcode.findFirst({
    where: {
      userId: params.userId,
      magicToken: params.token,
      expiresAt: { gt: now },
      usedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw Object.assign(new Error("Magic link is invalid or has expired"), {
      code: "TWO_FACTOR_INVALID_TOKEN",
    });
  }

  await prisma.twofactorcode.update({
    where: { id: record.id },
    data: { usedAt: now },
  });

  return buildAuthResultForUser(params.userId);
}

export async function updateUserTwoFactorSettings(params: {
  userId: number;
  enabled: boolean;
  method: "EMAIL";
}) {
  return prisma.user.update({
    where: { id: params.userId },
    data: {
      twoFactorEnabled: params.enabled,
      twoFactorMethod: params.method,
    },
    select: {
      id: true,
      email: true,
      name: true,
      twoFactorEnabled: true,
      twoFactorMethod: true,
    },
  });
}
