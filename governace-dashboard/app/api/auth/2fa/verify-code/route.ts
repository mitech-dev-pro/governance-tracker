// app/api/auth/2fa/verify-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCodeAndIssueTokens } from "@/lib/auth/twofa.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { error: { message: "User ID and code are required" } },
        { status: 400 }
      );
    }

    const result = await verifyCodeAndIssueTokens({
      userId: parseInt(userId),
      code: code.toString(),
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: result.user,
    });

    response.cookies.set("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("❌ 2FA verification error:", error);

    if (error.code === "TWO_FACTOR_INVALID_CODE") {
      return NextResponse.json(
        { error: { message: "Invalid or expired verification code" } },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: { message: "Verification failed" } },
      { status: 500 }
    );
  }
}
