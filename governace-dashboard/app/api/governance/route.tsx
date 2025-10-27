import { NextRequest, NextResponse } from "next/server";
import {
  createGovernanceSchema,
  governanceQuerySchema,
  type CreateGovernanceData,
} from "../validationSchema";
import prisma from "../../../prisma/client";
import { Prisma } from "../../generated/prisma";

// GET - Fetch governance items with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validationResult = governanceQuerySchema.safeParse(query);

    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, status, departmentId, ownerId, search } =
      validationResult.data;

    // Build where clause
    const where: Prisma.GovernanceItemWhereInput = {};

    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;
    if (ownerId) where.ownerId = ownerId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch governance items
    const [items, total] = await Promise.all([
      prisma.governanceItem.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: {
              subtasks: true,
              comments: true,
              attachments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.governanceItem.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error("Error fetching governance items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new governance item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = createGovernanceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.issues },
        { status: 400 }
      );
    }

    const data: CreateGovernanceData = validation.data;

    // Convert dueDate string to Date if provided
    const createData: Prisma.GovernanceItemCreateInput = {
      title: data.title,
      description: data.description,
      status: data.status,
      progress: data.progress,
      tags: data.tags,
      visibility: data.visibility,
    };

    if (data.ownerId) {
      createData.owner = { connect: { id: data.ownerId } };
    }
    if (data.departmentId) {
      createData.department = { connect: { id: data.departmentId } };
    }
    if (data.dueDate) {
      createData.dueDate = new Date(data.dueDate);
    }

    // Create governance item
    const governanceItem = await prisma.governanceItem.create({
      data: createData,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json(governanceItem, { status: 201 });
  } catch (error) {
    console.error("Error creating governance item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
