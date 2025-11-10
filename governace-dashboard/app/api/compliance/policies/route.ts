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

// GET - List all policies with optional filters
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

    const policies = await prisma.policy.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ policies });
  } catch (error) {
    console.error("Error fetching policies:", error);
    return NextResponse.json(
      { error: "Failed to fetch policies" },
      { status: 500 }
    );
  }
}

// POST - Create new policy
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
      version,
      status = "DRAFT",
      ownerId,
      departmentId,
      approvedBy,
      approvedDate,
      effectiveDate,
      reviewDate,
      attachmentUrl,
    } = body;

    // Validate required fields
    if (!code || !title || !description || !category || !version) {
      return NextResponse.json(
        { error: "Code, title, description, category, and version are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.policy.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Policy code already exists" },
        { status: 400 }
      );
    }

    const policy = await prisma.policy.create({
      data: {
        code,
        title,
        description,
        category,
        version,
        status,
        ownerId: ownerId || null,
        departmentId: departmentId || null,
        approvedBy: approvedBy || null,
        approvedDate: approvedDate ? new Date(approvedDate) : null,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        reviewDate: reviewDate ? new Date(reviewDate) : null,
        attachmentUrl: attachmentUrl || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ policy }, { status: 201 });
  } catch (error) {
    console.error("Error creating policy:", error);
    return NextResponse.json(
      { error: "Failed to create policy" },
      { status: 500 }
    );
  }
}
