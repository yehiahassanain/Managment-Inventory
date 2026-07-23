import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import LoginForm from "../../components/login/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — Inventory Management System",
  description: "Sign in to access the Inventory Management System dashboard.",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b0f1a] relative overflow-hidden p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 p-8 sm:p-10">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/30 mb-4">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Inventory System</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <LoginForm />

          <p className="text-center text-xs text-slate-600 mt-6">
            Enterprise Inventory Management System &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </main>
  );
}
