import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/audit/findings - List all findings with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const auditId = searchParams.get("auditId");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (auditId) {
      where.auditId = parseInt(auditId);
    }

    if (severity) {
      where.severity = severity;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const findings = await prisma.audit_finding.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ findings }, { status: 200 });
  } catch (error) {
    console.error("Error fetching findings:", error);
    return NextResponse.json(
      { error: "Failed to fetch findings" },
      { status: 500 }
    );
  }
}

// POST /api/audit/findings - Create a new finding
export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!auditId || !title || !description || !severity || !category || !recommendation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const finding = await prisma.audit_finding.create({
      data: {
        auditId,
        title,
        description,
        severity,
        status: status || "OPEN",
        category,
        recommendation,
        responsibleId,
        dueDate: dueDate ? new Date(dueDate) : null,
        closedDate: closedDate ? new Date(closedDate) : null,
        evidenceUrl,
        remediationPlan,
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

    return NextResponse.json({ finding }, { status: 201 });
  } catch (error) {
    console.error("Error creating finding:", error);
    return NextResponse.json(
      { error: "Failed to create finding" },
      { status: 500 }
    );
  }
}
