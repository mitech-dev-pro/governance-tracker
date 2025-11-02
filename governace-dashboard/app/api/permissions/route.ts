import { NextResponse } from "next/server";
import prisma from "../../../prisma/client";

export async function GET() {
  try {
    const permissions = await prisma.permission.findMany({
      select: {
        id: true,
        key: true,
        label: true,
        createdAt: true,
        _count: {
          select: {
            rolepermission: true,
          },
        },
      },
      orderBy: {
        label: 'asc'
      }
    });

    // Transform the data
    const transformedPermissions = permissions.map(permission => ({
      ...permission,
      roleCount: permission._count.rolepermission,
      _count: undefined,
    }));

    return NextResponse.json(transformedPermissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { key, label } = await request.json();

    // Validate required fields
    if (!key || !label) {
      return NextResponse.json(
        { error: 'Key and label are required' },
        { status: 400 }
      );
    }

    // Check if permission with this key already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { key }
    });

    if (existingPermission) {
      return NextResponse.json(
        { error: 'Permission with this key already exists' },
        { status: 400 }
      );
    }

    const permission = await prisma.permission.create({
      data: {
        key: key.trim(),
        label: label.trim(),
      },
      select: {
        id: true,
        key: true,
        label: true,
        createdAt: true,
        _count: {
          select: {
            rolepermission: true,
          },
        },
      },
    });

    const transformedPermission = {
      ...permission,
      roleCount: permission._count.rolepermission,
      _count: undefined,
    };

    return NextResponse.json(transformedPermission, { status: 201 });
  } catch (error) {
    console.error('Error creating permission:', error);
    return NextResponse.json(
      { error: 'Failed to create permission' },
      { status: 500 }
    );
  }
}