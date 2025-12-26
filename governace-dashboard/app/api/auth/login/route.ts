// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/prisma/client";
import { generateAndSendTwoFactorCode } from "@/lib/auth/twofa.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password: userPassword } = body;

    // Validate input
    if (!email || !userPassword) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(userPassword, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      await generateAndSendTwoFactorCode({
        userId: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber || undefined,
        name: user.name,
        ipAddress: request.headers.get("x-forwarded-for") || null,
        userAgent: request.headers.get("user-agent") || null,
      });

      // Return response indicating 2FA is required
      return NextResponse.json(
        {
          requiresTwoFactor: true,
          userId: user.id,
          message: "Verification code sent to your email",
        },
        { status: 200 }
      );
    }

    // If 2FA is not enabled, proceed with normal login
    const { SignJWT } = await import("jose");
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
    );

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

    const response = NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
