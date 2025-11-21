import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/audit/schedules/[id] - Get a single schedule
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const id = idParam ? parseInt(idParam) : undefined;
  if (!id) {
    return NextResponse.json({ error: "Missing or invalid schedule id" }, { status: 400 });
  }
  try {

    const schedule = await prisma.audit_schedule.findUnique({
      where: { id },
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

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ schedule }, { status: 200 });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

// PUT /api/audit/schedules/[id] - Update a schedule
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const id = idParam ? parseInt(idParam) : undefined;
  if (!id) {
    return NextResponse.json({ error: "Missing or invalid schedule id" }, { status: 400 });
  }
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

    // Check if schedule exists
    const existingSchedule = await prisma.audit_schedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    const schedule = await prisma.audit_schedule.update({
      where: { id },
      data: {
        ...(auditId && { auditId }),
        ...(title && { title }),
        ...(description && { description }),
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        ...(duration !== undefined && { duration }),
        ...(location !== undefined && { location }),
        ...(attendees !== undefined && { attendees }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
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

    return NextResponse.json({ schedule }, { status: 200 });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

// DELETE /api/audit/schedules/[id] - Delete a schedule
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const id = idParam ? parseInt(idParam) : undefined;
  if (!id) {
    return NextResponse.json({ error: "Missing or invalid schedule id" }, { status: 400 });
  }
  try {

    // Check if schedule exists
    const existingSchedule = await prisma.audit_schedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    await prisma.audit_schedule.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Schedule deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
