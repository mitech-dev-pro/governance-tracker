import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/departments/[id] - Get single department
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const departmentId = parseInt(id);

    if (isNaN(departmentId)) {
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        _count: {
          select: {
            userdepartment: true,
            governanceitem: true,
            risk: true,
          }
        }
      }
    });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ department });

  } catch (error) {
    console.error("Error fetching department:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/departments/[id] - Delete department
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const departmentId = parseInt(id);

    if (isNaN(departmentId)) {
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        _count: {
          select: {
            userdepartment: true,
            governanceitem: true,
            risk: true,
          }
        }
      }
    });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    // Check for dependencies
    if (department._count.userdepartment > 0 || 
        department._count.governanceitem > 0 || 
        department._count.risk > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete department with associated users, governance items, or risks. Please reassign them first.",
          details: {
            users: department._count.userdepartment,
            governanceItems: department._count.governanceitem,
            risks: department._count.risk
          }
        },
        { status: 409 }
      );
    }

    // Delete the department
    await prisma.department.delete({
      where: { id: departmentId }
    });

    return NextResponse.json({
      message: "Department deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}