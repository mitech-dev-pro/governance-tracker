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

// GET - List all controls with optional filters
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const departmentId = searchParams.get("departmentId");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (departmentId) where.departmentId = parseInt(departmentId);

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { code: { contains: search } },
      ];
    }

    const controls = await prisma.control.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
        policy: {
          select: { id: true, code: true, title: true },
        },
        risk: {
          select: { id: true, title: true, rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ controls });
  } catch (error) {
    console.error("Error fetching controls:", error);
    return NextResponse.json(
      { error: "Failed to fetch controls" },
      { status: 500 }
    );
  }
}

// POST - Create new control
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      title,
      description,
      category,
      status = "ACTIVE",
      frequency = "MONTHLY",
      ownerId,
      departmentId,
      policyId,
      riskId,
      effectiveness,
      lastReviewed,
      nextReview,
    } = body;

    // Validate required fields
    if (!code || !title || !description || !category) {
      return NextResponse.json(
        { error: "Code, title, description, and category are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.control.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Control code already exists" },
        { status: 400 }
      );
    }

    const control = await prisma.control.create({
      data: {
        code,
        title,
        description,
        category,
        status,
        frequency,
        ownerId: ownerId || null,
        departmentId: departmentId || null,
        policyId: policyId || null,
        riskId: riskId || null,
        effectiveness: effectiveness || null,
        lastReviewed: lastReviewed ? new Date(lastReviewed) : null,
        nextReview: nextReview ? new Date(nextReview) : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
        policy: { select: { id: true, code: true, title: true } },
        risk: { select: { id: true, title: true, rating: true } },
      },
    });

    return NextResponse.json({ control }, { status: 201 });
  } catch (error) {
    console.error("Error creating control:", error);
    return NextResponse.json(
      { error: "Failed to create control" },
      { status: 500 }
    );
  }
}
