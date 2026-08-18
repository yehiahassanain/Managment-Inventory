"use server";

import { db } from "../../lib/db";
import { createSession, deleteSession } from "../../lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

// ─── Auth Actions ────────────────────────────────────────────────────────────

export interface LoginState {
  error: string | null;
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return { error: "Invalid email or password." };
    }

    // Support both bcrypt-hashed passwords and legacy plain-text passwords
    const isHashed = user.password.startsWith("$2a$") || user.password.startsWith("$2b$");
    const passwordMatch = isHashed
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!passwordMatch) {
      return { error: "Invalid email or password." };
    }

    await createSession(user.id, user.email, user.role);
  } catch (err: unknown) {
    console.error("Login error:", err);
    return { error: "An unexpected error occurred. Please try again." };
  }

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

// ─── User Management Actions ─────────────────────────────────────────────────

export interface FormState {
  success: boolean;
  error: string | null;
}

export async function createUser(prevState: FormState, formData: FormData): Promise<FormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "USER" | "ADMIN";
  const picFile = formData.get("pic") as File | null;

  if (!name || !email || !password) {
    return { success: false, error: "Name, email, and password are required." };
  }

  let picBuffer: Buffer | null = null;
  if (picFile && picFile.size > 0) {
    try {
      const arrayBuffer = await picFile.arrayBuffer();
      picBuffer = Buffer.from(arrayBuffer);
    } catch (e) {
      console.error("Failed to read user pic file:", e);
    }
  }

  try {
    // Hash the password with a cost factor of 12 before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        pic: picBuffer || undefined,
      },
    });
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch (err: unknown) {
    console.error("Create user error:", err);
    if ((err as { code?: string }).code === "P2002") {
      return { success: false, error: "A user with this email already exists." };
    }
    return { success: false, error: (err as Error).message || "An unexpected database error occurred." };
  }
}

export async function deleteUser(userId: string) {
  try {
    await db.user.delete({ where: { id: userId } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("Delete user error:", err);
    return { error: "Could not delete user." };
  }
}
