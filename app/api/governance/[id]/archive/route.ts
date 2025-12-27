import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);

    // Update the governance item to archived status
    await prisma.governanceItem.update({
      where: { id: id },
      data: {
        status: "DEFERRED", // Using DEFERRED as archived status
        updatedAt: new Date(),
      },
    });

    // Create an audit event
    await prisma.auditevent.create({
      data: {
        itemId: id,
        kind: "archived",
        message: "Governance item archived",
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Archive error:", error);
    return NextResponse.json(
      { error: "Failed to archive governance item" },
      { status: 500 }
    );
  }
}
