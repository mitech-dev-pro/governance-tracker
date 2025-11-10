import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/audit/[id] - Get a single audit
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const audit = await prisma.audit.findUnique({
      where: { id },
      include: {
        leadAuditor: {
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
        findings: {
          include: {
            responsible: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        schedules: true,
      },
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    return NextResponse.json({ audit }, { status: 200 });
  } catch (error) {
    console.error("Error fetching audit:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit" },
      { status: 500 }
    );
  }
}

// PUT /api/audit/[id] - Update an audit
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const {
      code,
      title,
      description,
      type,
      status,
      scope,
      leadAuditorId,
      departmentId,
      startDate,
      endDate,
      reportDate,
      conclusion,
    } = body;

    // Check if audit exists
    const existingAudit = await prisma.audit.findUnique({
      where: { id },
    });

    if (!existingAudit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // If code is being changed, check for duplicates
    if (code && code !== existingAudit.code) {
      const duplicateAudit = await prisma.audit.findUnique({
        where: { code },
      });

      if (duplicateAudit) {
        return NextResponse.json(
          { error: "Audit code already exists" },
          { status: 400 }
        );
      }
    }

    const audit = await prisma.audit.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(title && { title }),
        ...(description && { description }),
        ...(type && { type }),
        ...(status && { status }),
        ...(scope && { scope }),
        ...(leadAuditorId !== undefined && { leadAuditorId }),
        ...(departmentId !== undefined && { departmentId }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(reportDate !== undefined && {
          reportDate: reportDate ? new Date(reportDate) : null,
        }),
        ...(conclusion !== undefined && { conclusion }),
      },
      include: {
        leadAuditor: {
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
      },
    });

    return NextResponse.json({ audit }, { status: 200 });
  } catch (error) {
    console.error("Error updating audit:", error);
    return NextResponse.json(
      { error: "Failed to update audit" },
      { status: 500 }
    );
  }
}

// DELETE /api/audit/[id] - Delete an audit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Check if audit exists
    const existingAudit = await prisma.audit.findUnique({
      where: { id },
    });

    if (!existingAudit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    await prisma.audit.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Audit deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting audit:", error);
    return NextResponse.json(
      { error: "Failed to delete audit" },
      { status: 500 }
    );
  }
}
