import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

// GET /api/asset/[id] - Get single asset
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(id) },
      include: {
        department: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        maintenances: {
          orderBy: { createdAt: "desc" },
        },
        stockMovements: {
          orderBy: { movementDate: "desc" },
          take: 10,
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error: unknown) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

// PUT /api/asset/[id] - Update asset
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.serialNumber !== undefined)
      updateData.serialNumber = body.serialNumber;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.departmentId !== undefined)
      updateData.departmentId = body.departmentId
        ? parseInt(body.departmentId as string)
        : null;
    if (body.assignedToId !== undefined)
      updateData.assignedToId = body.assignedToId
        ? parseInt(body.assignedToId as string)
        : null;
    if (body.purchaseDate !== undefined)
      updateData.purchaseDate = body.purchaseDate
        ? new Date(body.purchaseDate as string)
        : null;
    if (body.purchaseCost !== undefined)
      updateData.purchaseCost = body.purchaseCost;
    if (body.warrantyExpiry !== undefined)
      updateData.warrantyExpiry = body.warrantyExpiry
        ? new Date(body.warrantyExpiry as string)
        : null;
    if (body.supplier !== undefined) updateData.supplier = body.supplier;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

    const asset = await prisma.asset.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        department: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(asset);
  } catch (error: unknown) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

// DELETE /api/asset/[id] - Delete asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.asset.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
