import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRoleId = parseInt(params.id);

    if (isNaN(userRoleId)) {
      return NextResponse.json(
        { error: "Invalid user role ID" },
        { status: 400 }
      );
    }

    // Check if user role exists
    const existingUserRole = await prisma.userrole.findUnique({
      where: { id: userRoleId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existingUserRole) {
      return NextResponse.json(
        { error: "User role assignment not found" },
        { status: 404 }
      );
    }

    // Delete the user role assignment
    await prisma.userrole.delete({
      where: { id: userRoleId },
    });

    return NextResponse.json({
      message: `Successfully removed role "${existingUserRole.role.name}" from user "${existingUserRole.user.name || existingUserRole.user.email}"`,
    });
  } catch (error) {
    console.error("Error removing user role:", error);
    return NextResponse.json(
      { error: "Failed to remove user role assignment" },
      { status: 500 }
    );
  }
}