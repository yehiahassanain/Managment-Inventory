import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "../../../lib/jwt";

// ─── Route Segment Config ──────────────────────────────────────────────────────
export const maxDuration = 30;

// ─── GET /api/blob-image?url=<encoded-blob-url> ───────────────────────────────
// Proxies private Vercel Blob images so they can be displayed in <img> tags.

export async function GET(request: NextRequest) {
  // 1. Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = await decrypt(token);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Extract and validate the blob URL from query params
  const blobUrl = request.nextUrl.searchParams.get("url");

  if (!blobUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  // Only proxy Vercel Blob URLs for security
  const isVercelBlob =
    blobUrl.includes(".blob.vercel-storage.com") ||
    blobUrl.includes(".public.blob.vercel-storage.com");

  if (!isVercelBlob) {
    return new Response("Only Vercel Blob URLs are allowed", { status: 400 });
  }

  // 3. Fetch the blob server-side using the read-write token
  const blobToken = (process.env.BLOB_READ_WRITE_TOKEN ?? "")
    .trim()
    .replace(/^\"|\"$/g, "")
    .replace(/^'|'$/g, "");

  if (!blobToken) {
    return new Response("Server misconfiguration: BLOB_READ_WRITE_TOKEN not set", {
      status: 500,
    });
  }

  try {
    const upstream = await fetch(blobUrl, {
      headers: {
        Authorization: `Bearer ${blobToken}`,
      },
    });

    if (!upstream.ok) {
      return new Response(`Blob fetch failed: ${upstream.statusText}`, {
        status: upstream.status,
      });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = upstream.body;

    // Stream the response back to the client
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache for 1 hour in the browser, 24h on CDN edge
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("[/api/blob-image] Proxy failed:", err);
    return new Response("Failed to fetch image", { status: 500 });
  }
}
