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

// GET - Get single risk by ID
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
    const riskId = parseInt(id);

    const risk = await prisma.risk.findUnique({
      where: { id: riskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        governanceitem: {
          select: {
            id: true,
            title: true,
            number: true,
          },
        },
      },
    });

    if (!risk) {
      return NextResponse.json({ error: "Risk not found" }, { status: 404 });
    }

    return NextResponse.json({ risk });
  } catch (error) {
    console.error("Error fetching risk:", error);
    return NextResponse.json(
      { error: "Failed to fetch risk" },
      { status: 500 }
    );
  }
}

// PUT - Update risk
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
    const riskId = parseInt(id);

    const body = await request.json();
    const {
      title,
      ownerId,
      impact,
      likelihood,
      status,
      notes,
      relatedItemId,
      departmentId,
    } = body;

    // Validate impact and likelihood if provided
    if (impact && (impact < 1 || impact > 5)) {
      return NextResponse.json(
        { error: "Impact must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (likelihood && (likelihood < 1 || likelihood > 5)) {
      return NextResponse.json(
        { error: "Likelihood must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get current risk to calculate new rating if impact or likelihood changes
    const currentRisk = await prisma.risk.findUnique({
      where: { id: riskId },
    });

    if (!currentRisk) {
      return NextResponse.json({ error: "Risk not found" }, { status: 404 });
    }

    const newImpact = impact ?? currentRisk.impact;
    const newLikelihood = likelihood ?? currentRisk.likelihood;
    const rating = newImpact * newLikelihood;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      rating,
    };

    if (title !== undefined) updateData.title = title;
    if (ownerId !== undefined) updateData.ownerId = ownerId || null;
    if (impact !== undefined) updateData.impact = impact;
    if (likelihood !== undefined) updateData.likelihood = likelihood;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes || null;
    if (relatedItemId !== undefined)
      updateData.relatedItemId = relatedItemId || null;
    if (departmentId !== undefined)
      updateData.departmentId = departmentId || null;

    const risk = await prisma.risk.update({
      where: { id: riskId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        governanceitem: {
          select: {
            id: true,
            title: true,
            number: true,
          },
        },
      },
    });

    return NextResponse.json({ risk });
  } catch (error) {
    console.error("Error updating risk:", error);
    return NextResponse.json(
      { error: "Failed to update risk" },
      { status: 500 }
    );
  }
}

// DELETE - Delete risk
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
    const riskId = parseInt(id);

    await prisma.risk.delete({
      where: { id: riskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting risk:", error);
    return NextResponse.json(
      { error: "Failed to delete risk" },
      { status: 500 }
    );
  }
}
