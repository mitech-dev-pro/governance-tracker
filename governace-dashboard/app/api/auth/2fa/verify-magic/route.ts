// app/api/auth/2fa/verify-magic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyMagicTokenAndIssueTokens } from "@/lib/auth/twofa.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, token } = body;

    if (!userId || !token) {
      return NextResponse.json(
        { error: { message: "User ID and token are required" } },
        { status: 400 }
      );
    }

    const result = await verifyMagicTokenAndIssueTokens({
      userId: parseInt(userId),
      token: token,
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
    console.error("❌ Magic link verification error:", error);

    if (error.code === "TWO_FACTOR_INVALID_TOKEN") {
      return NextResponse.json(
        { error: { message: "Invalid or expired magic link" } },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: { message: "Verification failed" } },
      { status: 500 }
    );
  }
}
