import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        userdepartment: {
          select: {
            id: true,
            departmentId: true,
            createdAt: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        userrole: {
          select: {
            id: true,
            roleId: true,
            createdAt: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            governanceitem: true,
            actionitem: true,
            assignment: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Transform the response
    const transformedUser = {
      ...user,
      departments: user.userdepartment,
      roles: user.userrole,
      userdepartment: undefined,
      userrole: undefined,
    };

    return NextResponse.json({ user: transformedUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();
    const { name, email, password, image, departmentIds, roleIds } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      image?: string;
      updatedAt: Date;
    } = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password; // TODO: Hash in production
    if (image !== undefined) updateData.image = image;

    // Update user in transaction to handle relationships
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update basic user info
      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      // Update departments if provided
      if (departmentIds !== undefined) {
        // Delete existing department relationships
        await tx.userdepartment.deleteMany({
          where: { userId },
        });

        // Create new department relationships
        if (departmentIds.length > 0) {
          await tx.userdepartment.createMany({
            data: departmentIds.map((deptId: number) => ({
              userId,
              departmentId: deptId,
            })),
          });
        }
      }

      // Update roles if provided
      if (roleIds !== undefined) {
        // Delete existing role relationships
        await tx.userrole.deleteMany({
          where: { userId },
        });

        // Create new role relationships
        if (roleIds.length > 0) {
          await tx.userrole.createMany({
            data: roleIds.map((roleId: number) => ({
              userId,
              roleId,
            })),
          });
        }
      }

      // Fetch updated user with relationships
      return await tx.user.findUnique({
        where: { id: userId },
        include: {
          userdepartment: {
            include: {
              department: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          userrole: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              governanceitem: true,
              actionitem: true,
              assignment: true,
            },
          },
        },
      });
    });

    // Transform the response
    const transformedUser = {
      ...updatedUser,
      departments: updatedUser?.userdepartment,
      roles: updatedUser?.userrole,
      password: undefined, // Don't return password
      userdepartment: undefined,
      userrole: undefined,
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            governanceitem: true,
            actionitem: true,
            assignment: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has associated records
    const hasRecords = 
      existingUser._count.governanceitem > 0 ||
      existingUser._count.actionitem > 0 ||
      existingUser._count.assignment > 0;

    if (hasRecords) {
      return NextResponse.json(
        { 
          error: "Cannot delete user with associated governance items, action items, or assignments. Please reassign or delete these records first." 
        },
        { status: 409 }
      );
    }

    // Delete user and all related records in transaction
    await prisma.$transaction(async (tx) => {
      // Delete user department relationships
      await tx.userdepartment.deleteMany({
        where: { userId },
      });

      // Delete user role relationships
      await tx.userrole.deleteMany({
        where: { userId },
      });

      // Delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}