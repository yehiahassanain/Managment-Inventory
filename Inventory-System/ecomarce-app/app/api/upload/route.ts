import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "../../../lib/jwt";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

// ─── POST /api/upload ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Auth — read and verify session cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = await decrypt(token);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse multipart form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File) || file.size === 0) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  // 3. Validate MIME type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return Response.json(
      { error: "Invalid file type. Only JPEG, PNG, WEBP, GIF, and SVG are allowed." },
      { status: 422 }
    );
  }

  // 4. Validate file size
  if (file.size > MAX_SIZE_BYTES) {
    return Response.json(
      { error: "File is too large. Maximum allowed size is 5 MB." },
      { status: 422 }
    );
  }

  // 5. Save to public/uploads/
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Build a unique, sanitised filename
    const sanitisedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${Date.now()}_${sanitisedName}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const url = `/uploads/${uniqueFileName}`;
    return Response.json({ url }, { status: 200 });
  } catch (err) {
    console.error("[/api/upload] Failed to save file:", err);
    return Response.json(
      { error: "Failed to save the file. Please try again." },
      { status: 500 }
    );
  }
}
