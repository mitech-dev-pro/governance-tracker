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

// GET - Get single policy
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
    const policy = await prisma.policy.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
    });

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json({ policy });
  } catch (error) {
    console.error("Error fetching policy:", error);
    return NextResponse.json(
      { error: "Failed to fetch policy" },
      { status: 500 }
    );
  }
}

// PUT - Update policy
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
    if (body.version !== undefined) updateData.version = body.version;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.ownerId !== undefined) updateData.ownerId = body.ownerId || null;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId || null;
    if (body.approvedBy !== undefined) updateData.approvedBy = body.approvedBy || null;
    if (body.approvedDate !== undefined) updateData.approvedDate = body.approvedDate ? new Date(body.approvedDate) : null;
    if (body.effectiveDate !== undefined) updateData.effectiveDate = body.effectiveDate ? new Date(body.effectiveDate) : null;
    if (body.reviewDate !== undefined) updateData.reviewDate = body.reviewDate ? new Date(body.reviewDate) : null;
    if (body.attachmentUrl !== undefined) updateData.attachmentUrl = body.attachmentUrl || null;

    const policy = await prisma.policy.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ policy });
  } catch (error) {
    console.error("Error updating policy:", error);
    return NextResponse.json(
      { error: "Failed to update policy" },
      { status: 500 }
    );
  }
}

// DELETE - Delete policy
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
    await prisma.policy.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting policy:", error);
    return NextResponse.json(
      { error: "Failed to delete policy" },
      { status: 500 }
    );
  }
}
