import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "../../lib/db";
import { getSession } from "../../lib/session";
import { User } from "../../prisma/generated/main/client";
import UserForm from "../../components/dashboard/UserForm";
import UserTable from "../../components/dashboard/UserTable";

export const metadata: Metadata = {
  title: "Users — Inventory Management System",
  description: "Manage users in the Enterprise Inventory Management System.",
};

export const revalidate = 0;

const OWNER_EMAIL = "yehiahassanain@gmail.com";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard/products");
  }

  let users: User[] = [];
  let errorMsg: string | null = null;

  try {
    users = await db.user.findMany({ orderBy: { email: "asc" } });
  } catch (err: unknown) {
    console.error("Failed to query users:", err);
    errorMsg = (err as Error).message || "Failed to load users from the database.";
  }

  const isOwner = session?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Users Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            All user accounts registered in the database, updated in real-time.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-sm font-semibold text-slate-300">
          {users.length} {users.length === 1 ? "User" : "Users"}
        </div>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form panel — only visible to owner */}
        {isOwner ? (
          <section className="lg:col-span-5 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <h2 className="text-lg font-bold text-white">Create New User</h2>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Insert a new user record directly into the database.
              </p>
            </div>
            <UserForm />
          </section>
        ) : (
          <section className="lg:col-span-5 bg-slate-900/10 border border-slate-800/60 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col items-center justify-center min-h-[200px] text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-800/30 flex items-center justify-center mb-4 text-slate-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm font-medium">Access Restricted</p>
            <p className="text-slate-500 text-xs mt-1">Only the system owner can add new users.</p>
          </section>
        )}

        {/* Users table */}
        <section className="lg:col-span-7 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col min-h-[400px]">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-lg font-bold text-white">User Records</h2>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              All user records queried in real-time via React Server Components.
            </p>
          </div>
          <UserTable users={users} errorMsg={errorMsg} />
        </section>
      </main>
    </div>
  );
}
