import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../prisma/client";
import { z } from "zod";

// Validation schemas
const createDepartmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  code: z.string().min(2, "Code must be at least 2 characters").max(64, "Code is too long").optional(),
});

const querySchema = z.object({
  page: z.string().nullish().transform(val => val ? parseInt(val) : 1),
  limit: z.string().nullish().transform(val => val ? parseInt(val) : 10),
  search: z.string().nullish(),
});

// GET /api/departments - Get departments with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
    });

    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: { OR?: Array<{ name?: { contains: string } } | { code?: { contains: string } }> } = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }

    // Get departments with counts and pagination
    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { name: "asc" }
        ],
        include: {
          _count: {
            select: {
              userdepartment: true,
              governanceitem: true,
              risk: true,
            }
          }
        }
      }),
      prisma.department.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      departments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });

  } catch (error) {
    console.error("Error fetching departments:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid query parameters",
          errors: error.issues.map(issue => ({
            code: issue.code,
            message: issue.message,
            path: issue.path,
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/departments - Create a new department
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createDepartmentSchema.parse(body);

    // Check for existing department with same name or code
    const existingDepartment = await prisma.department.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          ...(validatedData.code ? [{ code: validatedData.code }] : [])
        ]
      }
    });

    if (existingDepartment) {
      const field = existingDepartment.name === validatedData.name ? "name" : "code";
      return NextResponse.json(
        { error: `Department with this ${field} already exists` },
        { status: 409 }
      );
    }

    // Create the department
    const department = await prisma.department.create({
      data: {
        name: validatedData.name,
        code: validatedData.code || null,
      },
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

    return NextResponse.json(
      { 
        message: "Department created successfully",
        department 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating department:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid input data",
          errors: error.issues.map(issue => ({
            code: issue.code,
            message: issue.message,
            path: issue.path,
          }))
        },
        { status: 400 }
      );
    }

    // Check for Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Department with this name or code already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}