import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

// GET /api/asset - Get all assets with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const categories = searchParams.get("categories") || ""; // Support multiple categories
    const status = searchParams.get("status") || "";
    const departmentId = searchParams.get("departmentId") || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { assetTag: { contains: search } },
        { serialNumber: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    } else if (categories) {
      // Support filtering by multiple categories (comma-separated)
      const categoryList = categories.split(",").map(c => c.trim());
      where.category = { in: categoryList };
    }

    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = parseInt(departmentId);
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.asset.count({ where }),
    ]);

    return NextResponse.json({
      assets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/asset - Create a new asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const asset = await prisma.asset.create({
      data: {
        assetTag: body.assetTag,
        name: body.name,
        category: body.category,
        type: body.type,
        brand: body.brand,
        model: body.model,
        serialNumber: body.serialNumber,
        status: body.status || "AVAILABLE",
        condition: body.condition || "GOOD",
        location: body.location,
        departmentId: body.departmentId ? parseInt(body.departmentId) : null,
        assignedToId: body.assignedToId ? parseInt(body.assignedToId) : null,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        purchaseCost: body.purchaseCost,
        warrantyExpiry: body.warrantyExpiry
          ? new Date(body.warrantyExpiry)
          : null,
        supplier: body.supplier,
        description: body.description,
        notes: body.notes,
        imageUrl: body.imageUrl,
      },
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

    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset", details: error.message },
      { status: 500 }
    );
  }
}
