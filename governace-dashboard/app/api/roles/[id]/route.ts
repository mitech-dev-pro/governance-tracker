import { NextResponse } from "next/server";
import prisma from "../../../../prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roleId = parseInt(id);

    if (!roleId || isNaN(roleId)) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      );
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        rolepermission: {
          select: {
            permission: {
              select: {
                id: true,
                key: true,
                label: true,
              },
            },
          },
        },
        userrole: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                userdepartment: {
                  select: {
                    department: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            userrole: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    const transformedRole = {
      ...role,
      permissions: role.rolepermission.map(rp => rp.permission),
      users: role.userrole.map(ur => ({
        ...ur.user,
        departments: ur.user.userdepartment.map(ud => ud.department),
        userdepartment: undefined,
      })),
      userCount: role._count.userrole,
      rolepermission: undefined,
      userrole: undefined,
      _count: undefined,
    };

    return NextResponse.json(transformedRole);
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roleId = parseInt(id);
    const { name, permissionIds } = await request.json();

    if (!roleId || isNaN(roleId)) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Check if another role with this name exists (excluding current role)
    const duplicateRole = await prisma.role.findFirst({
      where: {
        name: name.trim(),
        id: { not: roleId }
      }
    });

    if (duplicateRole) {
      return NextResponse.json(
        { error: 'Another role with this name already exists' },
        { status: 400 }
      );
    }

    // Update role and permissions in a transaction
    const updatedRole = await prisma.$transaction(async (tx) => {
      // Delete existing permissions
      await tx.rolepermission.deleteMany({
        where: { roleId }
      });

      // Update role and add new permissions
      return await tx.role.update({
        where: { id: roleId },
        data: {
          name: name.trim(),
          rolepermission: permissionIds && permissionIds.length > 0 ? {
            create: permissionIds.map((permissionId: number) => ({
              permissionId
            }))
          } : undefined
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          rolepermission: {
            select: {
              permission: {
                select: {
                  id: true,
                  key: true,
                  label: true,
                },
              },
            },
          },
          _count: {
            select: {
              userrole: true,
            },
          },
        },
      });
    });

    const transformedRole = {
      ...updatedRole,
      permissions: updatedRole.rolepermission.map(rp => rp.permission),
      userCount: updatedRole._count.userrole,
      rolepermission: undefined,
      _count: undefined,
    };

    return NextResponse.json(transformedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roleId = parseInt(id);

    if (!roleId || isNaN(roleId)) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: {
            userrole: true,
          },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Check if role is being used by users
    if (existingRole._count.userrole > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete role. It is assigned to ${existingRole._count.userrole} user(s). Please remove all user assignments before deleting.` 
        },
        { status: 400 }
      );
    }

    // Delete role (permissions will be deleted automatically due to foreign key constraints)
    await prisma.role.delete({
      where: { id: roleId }
    });

    return NextResponse.json(
      { message: 'Role deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}