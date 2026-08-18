import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../../lib/session";
import LoginForm from "../../components/login/LoginForm";

export const metadata: Metadata = {
  title: "Power Fitness",
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
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-white/95 border border-slate-700/50 shadow-xl shadow-indigo-500/10 mb-4">
              <img
                src="/uploads/Logo.png"
                alt="Power Fitness"
                className="h-10 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Power Fitness</h1>
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
