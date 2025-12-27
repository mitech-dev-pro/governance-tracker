import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/gif",
  "image/webp"
];

// Helper function to generate unique filename
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  return `${timestamp}-${randomString}${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "avatar";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
          allowedTypes: ALLOWED_TYPES
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
          maxSize: MAX_FILE_SIZE
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine upload directory based on type
    let uploadDir = "";
    switch (type) {
      case "avatar":
        uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
        break;
      default:
        uploadDir = path.join(process.cwd(), "public", "uploads", "misc");
    }

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const filepath = path.join(uploadDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/${type === "avatar" ? "avatars" : "misc"}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// GET endpoint to list uploaded files (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "avatar";
    
    // This is a basic implementation - you might want to add more sophisticated file management
    return NextResponse.json({
      message: "File listing not implemented yet",
      type
    });

  } catch (error) {
    console.error("List files error:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}