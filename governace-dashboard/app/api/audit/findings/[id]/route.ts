import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/audit/findings/[id] - Get a single finding
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const finding = await prisma.audit_finding.findUnique({
      where: { id },
      include: {
        audit: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!finding) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    return NextResponse.json({ finding }, { status: 200 });
  } catch (error) {
    console.error("Error fetching finding:", error);
    return NextResponse.json(
      { error: "Failed to fetch finding" },
      { status: 500 }
    );
  }
}

// PUT /api/audit/findings/[id] - Update a finding
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const {
      auditId,
      title,
      description,
      severity,
      status,
      category,
      recommendation,
      responsibleId,
      dueDate,
      closedDate,
      evidenceUrl,
      remediationPlan,
    } = body;

    // Check if finding exists
    const existingFinding = await prisma.audit_finding.findUnique({
      where: { id },
    });

    if (!existingFinding) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    const finding = await prisma.audit_finding.update({
      where: { id },
      data: {
        ...(auditId && { auditId }),
        ...(title && { title }),
        ...(description && { description }),
        ...(severity && { severity }),
        ...(status && { status }),
        ...(category && { category }),
        ...(recommendation && { recommendation }),
        ...(responsibleId !== undefined && { responsibleId }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(closedDate !== undefined && {
          closedDate: closedDate ? new Date(closedDate) : null,
        }),
        ...(evidenceUrl !== undefined && { evidenceUrl }),
        ...(remediationPlan !== undefined && { remediationPlan }),
      },
      include: {
        audit: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ finding }, { status: 200 });
  } catch (error) {
    console.error("Error updating finding:", error);
    return NextResponse.json(
      { error: "Failed to update finding" },
      { status: 500 }
    );
  }
}

// DELETE /api/audit/findings/[id] - Delete a finding
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Check if finding exists
    const existingFinding = await prisma.audit_finding.findUnique({
      where: { id },
    });

    if (!existingFinding) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    await prisma.audit_finding.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Finding deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting finding:", error);
    return NextResponse.json(
      { error: "Failed to delete finding" },
      { status: 500 }
    );
  }
}
