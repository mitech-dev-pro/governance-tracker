// app/api/auth/2fa/toggle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jwtVerify } from "jose";
import { updateUserTwoFactorSettings } from "@/lib/auth/twofa.service";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
);

const ToggleSchema = z.object({
  enabled: z.boolean(),
  method: z.enum(["EMAIL"]).default("EMAIL"),
});

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: number; email: string; name: string };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { enabled, method } = ToggleSchema.parse(body);

    const updated = await updateUserTwoFactorSettings({
      userId: user.userId,
      enabled,
      method,
    });

    return NextResponse.json({
      message: "2FA settings updated successfully",
      user: updated,
    });
  } catch (err: any) {
    console.error("2FA toggle error:", err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input" } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update 2FA settings",
        },
      },
      { status: 500 }
    );
  }
}
