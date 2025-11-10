import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/audit - List all audits with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const departmentId = searchParams.get("departmentId");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (departmentId) {
      where.departmentId = parseInt(departmentId);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const audits = await prisma.audit.findMany({
      where,
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
        findings: true,
        schedules: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ audits }, { status: 200 });
  } catch (error) {
    console.error("Error fetching audits:", error);
    return NextResponse.json(
      { error: "Failed to fetch audits" },
      { status: 500 }
    );
  }
}

// POST /api/audit - Create a new audit
export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!code || !title || !description || !type || !scope || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingAudit = await prisma.audit.findUnique({
      where: { code },
    });

    if (existingAudit) {
      return NextResponse.json(
        { error: "Audit code already exists" },
        { status: 400 }
      );
    }

    const audit = await prisma.audit.create({
      data: {
        code,
        title,
        description,
        type,
        status: status || "PLANNED",
        scope,
        leadAuditorId,
        departmentId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reportDate: reportDate ? new Date(reportDate) : null,
        conclusion,
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

    return NextResponse.json({ audit }, { status: 201 });
  } catch (error) {
    console.error("Error creating audit:", error);
    return NextResponse.json(
      { error: "Failed to create audit" },
      { status: 500 }
    );
  }
}
