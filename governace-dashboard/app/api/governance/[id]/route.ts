import { NextRequest, NextResponse } from "next/server";
import { updateGovernanceSchema } from "../../validationSchema";
import prisma from "../../../../prisma/client";
import { Prisma } from "../../../generated/prisma";

// GET - Fetch single governance item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const governanceItem = await prisma.governanceItem.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        department: {
          select: { id: true, name: true, code: true }
        },
        subtasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        raci: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        attachments: {
          include: {
            addedBy: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            subtasks: true,
            comments: true,
            attachments: true
          }
        }
      }
    });

    if (!governanceItem) {
      return NextResponse.json(
        { error: "Governance item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(governanceItem);

  } catch (error) {
    console.error('Error fetching governance item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update governance item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validation = updateGovernanceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if item exists
    const existingItem = await prisma.governanceItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Governance item not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Prisma.GovernanceItemUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    // Handle owner assignment
    if (data.ownerId !== undefined) {
      if (data.ownerId === null) {
        updateData.owner = { disconnect: true };
      } else {
        updateData.owner = { connect: { id: data.ownerId } };
      }
    }

    // Handle department assignment
    if (data.departmentId !== undefined) {
      if (data.departmentId === null) {
        updateData.department = { disconnect: true };
      } else {
        updateData.department = { connect: { id: data.departmentId } };
      }
    }

    // Update governance item
    const updatedItem = await prisma.governanceItem.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        department: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    return NextResponse.json(updatedItem);

  } catch (error) {
    console.error('Error updating governance item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete governance item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Check if item exists
    const existingItem = await prisma.governanceItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Governance item not found" },
        { status: 404 }
      );
    }

    // Delete governance item (cascade delete will handle related records)
    await prisma.governanceItem.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Governance item deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting governance item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}