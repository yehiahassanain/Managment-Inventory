import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "../../../lib/jwt";
import { put } from "@vercel/blob";

// ─── Route Segment Config ──────────────────────────────────────────────────────
// Give the upload route 30 s on Vercel (default is 10 s on Hobby plan)
export const maxDuration = 30;

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

  // Strip surrounding quotes/whitespace — a common paste mistake in Vercel dashboard
  const blobToken = (process.env.BLOB_READ_WRITE_TOKEN ?? "").trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
  const hasRealBlobToken =
    blobToken &&
    blobToken.startsWith("vercel_blob_rw_") &&
    !blobToken.includes("REPLACE_WITH");

  // Log token status so it's visible in Vercel Function Logs
  console.log(
    "[/api/upload] BLOB token present:",
    blobToken ? `yes (starts: ${blobToken.slice(0, 25)}...)` : "NO TOKEN"
  );

  // On Vercel the filesystem is read-only — if there's no real token, fail clearly
  if (!hasRealBlobToken) {
    const hint = blobToken
      ? `Token found but invalid format. Got: "${blobToken.slice(0, 30)}..." — must start with vercel_blob_rw_`
      : "No token found — add BLOB_READ_WRITE_TOKEN in Vercel → Settings → Environment Variables";
    return Response.json(
      { error: `Server misconfiguration: ${hint}` },
      { status: 500 }
    );
  }

  try {
    {
      // ── Production: Vercel Blob ────────────────────────────────────────────
      const sanitisedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uniqueFileName = `products/${Date.now()}_${sanitisedName}`;

      // Convert File → Buffer so @vercel/blob receives a reliable stream
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const blob = await put(uniqueFileName, buffer, {
        access: "public",
        contentType: file.type,
        token: blobToken,
      });

      return Response.json({ url: blob.url }, { status: 200 });
    }
  } catch (err) {
    console.error("[/api/upload] Failed to save file:", err);
    // Include actual error message so it surfaces in the browser console
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `Failed to save the file: ${message}` },
      { status: 500 }
    );
  }
}
