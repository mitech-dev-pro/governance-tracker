import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const departmentId = searchParams.get("departmentId");
    const roleId = searchParams.get("roleId");
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (departmentId) {
      where.userdepartment = {
        some: {
          departmentId: parseInt(departmentId),
        },
      };
    }

    if (roleId) {
      where.userrole = {
        some: {
          roleId: parseInt(roleId),
        },
      };
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: [
          { name: "asc" },
          { email: "asc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    // Transform the data to match our interface
    const transformedUsers = users.map((user) => ({
      ...user,
      departments: user.userdepartment,
      roles: user.userrole,
      userdepartment: undefined,
      userrole: undefined,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, image, departmentIds, roleIds } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // For now, we'll store the password as plain text (in production, use bcrypt)
    // TODO: Add bcrypt hashing in production
    const userData: any = {
      name,
      email,
      password,
      image,
    };

    // Create user with relationships
    const user = await prisma.user.create({
      data: {
        ...userData,
        userdepartment: departmentIds?.length
          ? {
              create: departmentIds.map((deptId: number) => ({
                departmentId: deptId,
              })),
            }
          : undefined,
        userrole: roleIds?.length
          ? {
              create: roleIds.map((roleId: number) => ({
                roleId: roleId,
              })),
            }
          : undefined,
      },
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

    // Transform the response
    const transformedUser = {
      ...user,
      departments: user.userdepartment,
      roles: user.userrole,
      password: undefined, // Don't return password
      userdepartment: undefined,
      userrole: undefined,
    };

    return NextResponse.json(transformedUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}