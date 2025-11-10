import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// GET - List all risks with optional filters
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");
    const minRating = searchParams.get("minRating");
    const maxRating = searchParams.get("maxRating");
    const search = searchParams.get("search");

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = parseInt(departmentId);
    }

    if (minRating || maxRating) {
      where.rating = {};
      if (minRating) where.rating.gte = parseInt(minRating);
      if (maxRating) where.rating.lte = parseInt(maxRating);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const risks = await prisma.risk.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        governanceitem: {
          select: {
            id: true,
            title: true,
            number: true,
          },
        },
      },
      orderBy: {
        rating: "desc", // Show highest risks first
      },
    });

    return NextResponse.json({ risks });
  } catch (error) {
    console.error("Error fetching risks:", error);
    return NextResponse.json(
      { error: "Failed to fetch risks" },
      { status: 500 }
    );
  }
}

// POST - Create new risk
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      ownerId,
      impact,
      likelihood,
      status = "IN_PROGRESS",
      notes,
      relatedItemId,
      departmentId,
    } = body;

    // Validate required fields
    if (!title || !impact || !likelihood) {
      return NextResponse.json(
        { error: "Title, impact, and likelihood are required" },
        { status: 400 }
      );
    }

    // Validate impact and likelihood ranges (1-5)
    if (
      impact < 1 ||
      impact > 5 ||
      likelihood < 1 ||
      likelihood > 5
    ) {
      return NextResponse.json(
        { error: "Impact and likelihood must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Calculate rating
    const rating = impact * likelihood;

    const risk = await prisma.risk.create({
      data: {
        title,
        ownerId: ownerId || null,
        impact,
        likelihood,
        rating,
        status,
        notes: notes || null,
        relatedItemId: relatedItemId || null,
        departmentId: departmentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        governanceitem: {
          select: {
            id: true,
            title: true,
            number: true,
          },
        },
      },
    });

    return NextResponse.json({ risk }, { status: 201 });
  } catch (error) {
    console.error("Error creating risk:", error);
    return NextResponse.json(
      { error: "Failed to create risk" },
      { status: 500 }
    );
  }
}
