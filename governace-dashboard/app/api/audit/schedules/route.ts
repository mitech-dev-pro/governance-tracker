import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/audit/schedules - List all schedules with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const auditId = searchParams.get("auditId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (auditId) {
      where.auditId = parseInt(auditId);
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const schedules = await prisma.audit_schedule.findMany({
      where,
      include: {
        audit: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });

    return NextResponse.json({ schedules }, { status: 200 });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

// POST /api/audit/schedules - Create a new schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      auditId,
      title,
      description,
      scheduledDate,
      duration,
      location,
      attendees,
      status,
      notes,
    } = body;

    // Validate required fields
    if (!auditId || !title || !description || !scheduledDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const schedule = await prisma.audit_schedule.create({
      data: {
        auditId,
        title,
        description,
        scheduledDate: new Date(scheduledDate),
        duration: duration || 1,
        location,
        attendees: attendees || null,
        status: status || "SCHEDULED",
        notes,
      },
      include: {
        audit: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
