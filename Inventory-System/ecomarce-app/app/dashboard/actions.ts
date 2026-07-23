"use server";

import { db } from "../../lib/db";
import { createSession, deleteSession } from "../../lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

    if (!user || user.password !== password) {
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

  if (!name || !email || !password) {
    return { success: false, error: "Name, email, and password are required." };
  }

  try {
    await db.user.create({
      data: { name, email, password, role: role || "USER" },
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
