import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  expiresAt: Date;
}

const secretKey = process.env.SESSION_SECRET || "s3cur3-inv3ntory-s3ss10n-k3y-32chars!!";
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = ""): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
