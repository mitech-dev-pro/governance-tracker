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

// GET - Get single control
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const control = await prisma.control.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
        policy: { select: { id: true, code: true, title: true } },
        risk: { select: { id: true, title: true, rating: true } },
      },
    });

    if (!control) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 });
    }

    return NextResponse.json({ control });
  } catch (error) {
    console.error("Error fetching control:", error);
    return NextResponse.json(
      { error: "Failed to fetch control" },
      { status: 500 }
    );
  }
}

// PUT - Update control
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    // Only update fields that are provided
    if (body.code !== undefined) updateData.code = body.code;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.ownerId !== undefined) updateData.ownerId = body.ownerId || null;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId || null;
    if (body.policyId !== undefined) updateData.policyId = body.policyId || null;
    if (body.riskId !== undefined) updateData.riskId = body.riskId || null;
    if (body.effectiveness !== undefined) updateData.effectiveness = body.effectiveness || null;
    if (body.lastReviewed !== undefined) updateData.lastReviewed = body.lastReviewed ? new Date(body.lastReviewed) : null;
    if (body.nextReview !== undefined) updateData.nextReview = body.nextReview ? new Date(body.nextReview) : null;

    const control = await prisma.control.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
        policy: { select: { id: true, code: true, title: true } },
        risk: { select: { id: true, title: true, rating: true } },
      },
    });

    return NextResponse.json({ control });
  } catch (error) {
    console.error("Error updating control:", error);
    return NextResponse.json(
      { error: "Failed to update control" },
      { status: 500 }
    );
  }
}

// DELETE - Delete control
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.control.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting control:", error);
    return NextResponse.json(
      { error: "Failed to delete control" },
      { status: 500 }
    );
  }
}
