import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "../../../lib/jwt";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ─── Route Segment Config ──────────────────────────────────────────────────────
export const maxDuration = 30;

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

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
      { error: "File is too large. Maximum allowed size is 4 MB." },
      { status: 422 }
    );
  }

  // 5. Save to public/uploads/products/
  try {
    const sanitisedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${Date.now()}_${sanitisedName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

    await mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(path.join(uploadDir, uniqueFileName), Buffer.from(arrayBuffer));

    return Response.json(
      { url: `/uploads/products/${uniqueFileName}` },
      { status: 200 }
    );
  } catch (err) {
    console.error("[/api/upload] Failed to save file:", err);
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `Failed to save the file: ${message}` },
      { status: 500 }
    );
  }
}
