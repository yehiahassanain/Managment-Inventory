import { type NextRequest } from "next/server";

// Temporary debug endpoint — DELETE this file after confirming the token is set correctly
export async function GET(_request: NextRequest) {
  const raw = process.env.BLOB_READ_WRITE_TOKEN ?? "";
  const stripped = raw.trim().replace(/^\"|\"$/g, "").replace(/^'|'$/g, "");

  return Response.json({
    envVarExists: raw.length > 0,
    strippedLength: stripped.length,
    startsWithExpectedPrefix: stripped.startsWith("vercel_blob_rw_"),
    first25Chars: stripped.slice(0, 25) || "(empty)",
    hasPlaceholder: stripped.includes("REPLACE_WITH"),
  });
}
