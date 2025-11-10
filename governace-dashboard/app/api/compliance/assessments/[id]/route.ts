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

// GET - Get single assessment
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
    const assessment = await prisma.assessment.findUnique({
      where: { id: parseInt(id) },
      include: {
        control: { select: { id: true, code: true, title: true } },
        assessor: { select: { id: true, name: true, email: true } },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

// PUT - Update assessment
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
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.controlId !== undefined) updateData.controlId = body.controlId || null;
    if (body.assessorId !== undefined) updateData.assessorId = body.assessorId || null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.result !== undefined) updateData.result = body.result || null;
    if (body.score !== undefined) updateData.score = body.score || null;
    if (body.scheduledDate !== undefined) updateData.scheduledDate = new Date(body.scheduledDate);
    if (body.completedDate !== undefined) updateData.completedDate = body.completedDate ? new Date(body.completedDate) : null;
    if (body.findings !== undefined) updateData.findings = body.findings || null;
    if (body.recommendations !== undefined) updateData.recommendations = body.recommendations || null;

    const assessment = await prisma.assessment.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        control: { select: { id: true, code: true, title: true } },
        assessor: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}

// DELETE - Delete assessment
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
    await prisma.assessment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { error: "Failed to delete assessment" },
      { status: 500 }
    );
  }
}
