import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "../../../lib/jwt";
import { put } from "@vercel/blob";

// ─── Constants ────────────────────────────────────────────────────────────────

// Vercel server-side uploads are limited to 4.5 MB — keep well under that
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

  // 5. Choose storage backend based on environment:
  //    - Real BLOB_READ_WRITE_TOKEN present → Vercel Blob (production)
  //    - No token / placeholder            → local public/uploads/ (dev)
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const hasRealBlobToken =
    blobToken &&
    blobToken.startsWith("vercel_blob_rw_") &&
    !blobToken.includes("REPLACE_WITH");

  try {
    if (hasRealBlobToken) {
      // ── Production: Vercel Blob ────────────────────────────────────────────
      const sanitisedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uniqueFileName = `products/${Date.now()}_${sanitisedName}`;

      const blob = await put(uniqueFileName, file, {
        access: "public",
        contentType: file.type,
        token: blobToken,
      });

      return Response.json({ url: blob.url }, { status: 200 });
    } else {
      // ── Development fallback: local public/uploads/ ────────────────────────
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");

      const sanitisedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uniqueFileName = `${Date.now()}_${sanitisedName}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      await mkdir(uploadDir, { recursive: true });

      const arrayBuffer = await file.arrayBuffer();
      await writeFile(path.join(uploadDir, uniqueFileName), Buffer.from(arrayBuffer));

      return Response.json({ url: `/uploads/${uniqueFileName}` }, { status: 200 });
    }
  } catch (err) {
    console.error("[/api/upload] Failed to save file:", err);
    return Response.json(
      { error: "Failed to save the file. Please try again." },
      { status: 500 }
    );
  }
}
