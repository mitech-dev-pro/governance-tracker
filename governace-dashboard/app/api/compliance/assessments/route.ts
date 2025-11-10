import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// GET - List all assessments with optional filters
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const result = searchParams.get("result");
    const controlId = searchParams.get("controlId");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) where.status = status;
    if (result) where.result = result;
    if (controlId) where.controlId = parseInt(controlId);

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        control: {
          select: { id: true, code: true, title: true },
        },
        assessor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { scheduledDate: "desc" },
    });

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

// POST - Create new assessment
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      controlId,
      assessorId,
      status = "SCHEDULED",
      result,
      score,
      scheduledDate,
      completedDate,
      findings,
      recommendations,
    } = body;

    // Validate required fields
    if (!title || !description || !scheduledDate) {
      return NextResponse.json(
        { error: "Title, description, and scheduled date are required" },
        { status: 400 }
      );
    }

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        controlId: controlId || null,
        assessorId: assessorId || null,
        status,
        result: result || null,
        score: score || null,
        scheduledDate: new Date(scheduledDate),
        completedDate: completedDate ? new Date(completedDate) : null,
        findings: findings || null,
        recommendations: recommendations || null,
      },
      include: {
        control: { select: { id: true, code: true, title: true } },
        assessor: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}
