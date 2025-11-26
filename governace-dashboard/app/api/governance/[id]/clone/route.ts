import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { Prisma } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);

    const originalItem = await prisma.governanceItem.findUnique({
      where: { id },
    });

    if (!originalItem) {
      return NextResponse.json(
        { error: "Governance item not found" },
        { status: 404 }
      );
    }

    const clonedItem = await prisma.governanceItem.create({
      data: {
        title: `${originalItem.title} (Copy)`,
        description: originalItem.description,
        status: "NOT_STARTED",
        progress: 0,
        visibility: originalItem.visibility,
        actionitemType: originalItem.actionitemType,
        tags: originalItem.tags ?? Prisma.JsonNull,
        clauseRefs: originalItem.clauseRefs ?? Prisma.JsonNull,
        ownerId: originalItem.ownerId,
        departmentId: originalItem.departmentId,
        dueDate: null,
        updatedAt: originalItem.updatedAt,
      },
    });

    return NextResponse.json(clonedItem);
  } catch (error) {
    console.error("Clone error:", error);
    return NextResponse.json(
      { error: "Failed to clone governance item" },
      { status: 500 }
    );
  }
}
