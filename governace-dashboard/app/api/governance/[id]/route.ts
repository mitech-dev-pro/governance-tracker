import { NextRequest, NextResponse } from "next/server";
import { updateGovernanceSchema } from "../../validationSchema";
import prisma from "../../../../prisma/client";


// GET - Fetch single governance item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const governanceItem = await prisma.governanceItem.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        department: {
          select: { id: true, name: true, code: true }
        },
        subtask: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { id: 'asc' }
        },
        raci: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { role: 'asc' }
        },
        attachment: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        comment: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        actionitem: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            meeting: {
              select: { id: true, date: true, type: true }
            }
          },
          orderBy: { id: 'asc' }
        },
        assignment: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { kind: 'asc' }
        },
        auditevent: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        auditplan: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { id: 'asc' }
        },
        risk: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            department: {
              select: { id: true, name: true, code: true }
            }
          },
          orderBy: { rating: 'desc' }
        },
        _count: {
          select: {
            subtask: true,
            comment: true,
            attachment: true,
            actionitem: true,
            assignment: true,
            auditevent: true,
            auditplan: true,
            raci: true,
            risk: true
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

    // Map field names to match expected interface
    const responseItem = {
      ...governanceItem,
      subtasks: governanceItem.subtask?.map(subtask => ({
        ...subtask,
        assignee: subtask.user
      })),
      attachments: governanceItem.attachment?.map(attachment => ({
        ...attachment,
        addedBy: attachment.user
      })),
      comments: governanceItem.comment?.map(comment => ({
        ...comment,
        author: comment.user
      })),
      actionItems: governanceItem.actionitem?.map(actionItem => ({
        ...actionItem,
        owner: actionItem.user
      })),
      assignments: governanceItem.assignment?.map(assignment => ({
        ...assignment,
        assignedUser: assignment.user
      })),
      auditEvents: governanceItem.auditevent?.map(event => ({
        ...event,
        actor: event.user
      })),
      auditPlans: governanceItem.auditplan?.map(plan => ({
        ...plan,
        owner: plan.user
      })),
      risks: governanceItem.risk?.map(risk => ({
        ...risk,
        owner: risk.user
      })),
      owner: governanceItem.user, // Map user to owner for consistency
    };

    // Remove the original fields to avoid confusion
    delete (responseItem as Record<string, unknown>).subtask;
    delete (responseItem as Record<string, unknown>).attachment;
    delete (responseItem as Record<string, unknown>).comment;
    delete (responseItem as Record<string, unknown>).actionitem;
    delete (responseItem as Record<string, unknown>).assignment;
    delete (responseItem as Record<string, unknown>).auditevent;
    delete (responseItem as Record<string, unknown>).auditplan;
    delete (responseItem as Record<string, unknown>).risk;

    return NextResponse.json(responseItem);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId, 10);
    
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

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
        updateData.user = { disconnect: true };
      } else {
        updateData.user = { connect: { id: data.ownerId } };
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
        user: {
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId, 10);
    
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