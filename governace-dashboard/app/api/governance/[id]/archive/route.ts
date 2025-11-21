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
    
    // Update the governance item to archived status
    await prisma.governanceItem.update({
      where: { id },
      data: {
        status: 'DEFERRED', // Using DEFERRED as archived status
        updatedAt: new Date(),
      },
    });

    // Create an audit event
    await prisma.auditevent.create({
      data: {
        itemId: id,
        kind: 'archived',
        message: 'Governance item archived',
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Archive error:', error);
    return NextResponse.json(
      { error: 'Failed to archive governance item' },
      { status: 500 }
    );
  }
}