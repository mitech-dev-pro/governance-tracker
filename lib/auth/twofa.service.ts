// lib/auth/twofa.service.ts
import crypto from "crypto";
import prisma from "@/prisma/client";
import { SignJWT } from "jose";
import { env } from "process";
import nodemailer from "nodemailer";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
);

const TWO_FACTOR_CODE_EXPIRY_MINUTES = 1;
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

const fetchFn: any = (globalThis as any).fetch;

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendDevEmail(params: SendEmailParams) {
  console.log("[DEV EMAIL]", {
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

async function sendResendEmail(params: SendEmailParams) {
  if (!env.RESEND_API_KEY) {
    throw Object.assign(new Error("RESEND_API_KEY is not configured"), {
      code: "EMAIL_PROVIDER_MISCONFIGURED",
    });
  }

  if (!fetchFn) {
    throw Object.assign(new Error("fetch is not available in this runtime"), {
      code: "EMAIL_PROVIDER_UNAVAILABLE",
    });
  }

  const res = await fetchFn("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_ADDRESS}>`,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Resend email error:", body);
    throw Object.assign(new Error("Failed to send email via Resend"), {
      code: "EMAIL_SEND_FAILED",
    });
  }
}

async function sendSmtpEmail(params: SendEmailParams) {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    throw Object.assign(new Error("SMTP is not fully configured"), {
      code: "EMAIL_PROVIDER_MISCONFIGURED",
    });
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: env.SMTP_SECURE === "true",
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_ADDRESS}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

/**
 * Low-level email sender which dispatches based on EMAIL_PROVIDER.
 */
export async function sendEmail(params: SendEmailParams) {
  switch (env.EMAIL_PROVIDER) {
    case "DEV":
      return sendDevEmail(params);
    case "RESEND":
      return sendResendEmail(params);
    case "SMTP":
      return sendSmtpEmail(params);
    default:
      console.warn(
        `Unknown EMAIL_PROVIDER=${env.EMAIL_PROVIDER}, falling back to DEV`
      );
      return sendDevEmail(params);
  }
}

export interface TwoFactorEmailParams {
  to: string;
  code: string;
  magicLinkUrl?: string;
  userName?: string | null;
}

export async function sendTwoFactorCodeEmail({
  to,
  code,
  magicLinkUrl,
  userName,
}: TwoFactorEmailParams) {
  const appName = env.SWAGGER_TITLE ?? "Approvals";
  const safeName = userName || "there";

  const subject = `Your ${appName} login code`;

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:24px;box-shadow:0 10px 25px rgba(15,23,42,0.08);">
            <tr>
              <td style="text-align:center;padding-bottom:16px;">
                <div style="font-size:20px;font-weight:600;color:#111827;">${appName}</div>
                <div style="font-size:13px;color:#6b7280;margin-top:4px;">Secure sign-in</div>
              </td>
            </tr>
            <tr>
              <td style="font-size:14px;color:#111827;padding-bottom:12px;">
                Hi ${safeName},
              </td>
            </tr>
            <tr>
              <td style="font-size:14px;color:#374151;padding-bottom:16px;line-height:1.5;">
                Use the following verification code to finish signing in:
              </td>
            </tr>
            <tr>
              <td style="text-align:center;padding-bottom:16px;">
                <div style="display:inline-block;font-size:28px;letter-spacing:0.3em;font-weight:700;color:#111827;background:#f3f4f6;border-radius:999px;padding:12px 24px;">
                  ${code.split("").join(" ")}
                </div>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#6b7280;padding-bottom:20px;text-align:center;">
                This code will expire in <strong>1 minute</strong> and can only be used once.
              </td>
            </tr>
            ${
              magicLinkUrl
                ? `
            <tr>
              <td style="text-align:center;padding-bottom:20px;">
                <a href="${magicLinkUrl}"
                  style="display:inline-block;background:#16a34a;color:#ffffff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:999px;text-decoration:none;">
                  Or click here to sign in
                </a>
              </td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="font-size:12px;color:#9ca3af;padding-top:12px;border-top:1px solid #e5e7eb;">
                If you didn’t request this code, you can safely ignore this email.
              </td>
            </tr>
          </table>
          <div style="font-size:11px;color:#9ca3af;margin-top:12px;">
            &copy; ${new Date().getFullYear()} ${
    env.EMAIL_FROM_NAME
  }. All rights reserved.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();

  await sendEmail({ to, subject, html });
}
// SMS sending function (implement with your SMS service)
export async function sendTwoFactorCodeSms({
  phoneNumber,
  code,
  name,
}: {
  phoneNumber: string;
  code: string;
  name: string;
}): Promise<void> {
  if (!env.SMS_ENABLED) return;

  try {
    console.log(
      `[SMS 2FA] Sending code ${code} to ${phoneNumber} (user: ${name})`
    );

    const params = new URLSearchParams({
      username: env.DEYWURO_USERNAME || "",
      password: env.DEYWURO_PASSWORD || "",
      destination: phoneNumber,
      source: env.DEYWURO_SOURCE || "Approvals Authentication",
      message: `Hello ${name}, your login verification code is ${code}. This code will expire in 1 minute.`,
    });

    await fetch(`https://deywuro.com/api/sms?${params.toString()}`, {
      method: "POST",
    });
  } catch (err) {
    console.warn("Failed to send SMS 2FA code via Deywuro:", err);
  }
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
