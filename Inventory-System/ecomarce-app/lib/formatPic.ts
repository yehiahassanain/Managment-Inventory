/**
 * Formats a user's pic field (which may be a Buffer, Uint8Array, base64 string, or null)
 * into a valid base64 data URL string for <img> tags.
 */
export function formatUserPic(pic: Buffer | Uint8Array | string | null | undefined): string | null {
  if (!pic) return null;

  if (typeof pic === "string") {
    if (pic.startsWith("data:") || pic.startsWith("http://") || pic.startsWith("https://") || pic.startsWith("/")) {
      return pic;
    }
    return `data:image/jpeg;base64,${pic}`;
  }

  try {
    const buffer = Buffer.isBuffer(pic) ? pic : Buffer.from(pic);
    if (buffer.length === 0) return null;

    // Detect MIME type from magic numbers
    let mime = "image/jpeg";
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      mime = "image/png";
    } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      mime = "image/gif";
    } else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      mime = "image/webp";
    } else if (buffer[0] === 0x3c) {
      mime = "image/svg+xml";
    }

    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error("formatUserPic error:", err);
    return null;
  }
}
