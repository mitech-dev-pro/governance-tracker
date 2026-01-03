import { NextResponse } from "next/server";
import prisma from "../../../prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: { name?: { contains: string; mode: string } } = {};
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
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
        orderBy: {
          name: 'asc'
        },
        skip,
        take: limit,
      }),
      prisma.role.count({ where })
    ]);

    // Transform the data
    const transformedRoles = roles.map(role => ({
      ...role,
      permissions: role.rolepermission.map(rp => rp.permission),
      userCount: role._count.userrole,
      rolepermission: undefined,
      _count: undefined,
    }));

    return NextResponse.json({
      roles: transformedRoles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, permissionIds } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Check if role with this name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: name.trim() }
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 400 }
      );
    }

    // Create role with permissions
    const role = await prisma.role.create({
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

    const transformedRole = {
      ...role,
      permissions: role.rolepermission.map(rp => rp.permission),
      userCount: role._count.userrole,
      rolepermission: undefined,
      _count: undefined,
    };

    return NextResponse.json(transformedRole, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}