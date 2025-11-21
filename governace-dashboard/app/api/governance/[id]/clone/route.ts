import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/client';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const id = idParam ? parseInt(idParam) : undefined;
  if (!id) {
    return NextResponse.json({ error: "Missing or invalid governance id" }, { status: 400 });
  }
  try {
    
    // Fetch the original item
    const originalItem = await prisma.governanceItem.findUnique({
      where: { id },
    });

    if (!originalItem) {
      return NextResponse.json(
        { error: 'Governance item not found' },
        { status: 404 }
      );
    }

    // Create a clone with modified title and reset status
    const clonedItem = await prisma.governanceItem.create({
      data: {
        title: `${originalItem.title} (Copy)`,
        description: originalItem.description,
        status: 'NOT_STARTED',
        progress: 0,
        visibility: originalItem.visibility,
        actionitemType: originalItem.actionitemType,
        tags: originalItem.tags as import('@prisma/client').Prisma.InputJsonValue ?? undefined,
        clauseRefs: originalItem.clauseRefs === null ? undefined : originalItem.clauseRefs,
        ownerId: originalItem.ownerId,
        departmentId: originalItem.departmentId,
        dueDate: null, // Reset due date
        updatedAt: new Date(), // Add updatedAt property
      },
    });

    return NextResponse.json(clonedItem);
  } catch (error) {
    console.error('Clone error:', error);
    return NextResponse.json(
      { error: 'Failed to clone governance item' },
      { status: 500 }
    );
  }
}