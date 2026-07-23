import { logout } from "../../app/dashboard/actions";

interface DashboardHeaderProps {
  userCount: number;
  sessionEmail: string;
  sessionRole: string;
}

export default function DashboardHeader({ userCount, sessionEmail, sessionRole }: DashboardHeaderProps) {
  return (
    <header className="w-full max-w-6xl mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-slate-800 pb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Inventory Management
          </h1>
        </div>
        <p className="text-slate-500 text-sm">
          Signed in as{" "}
          <span className="text-slate-300 font-medium">{sessionEmail}</span>
          {" · "}
          <span
            className={`font-semibold ${sessionRole === "ADMIN" ? "text-violet-400" : "text-indigo-400"}`}
          >
            {sessionRole}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-sm font-semibold text-slate-300">
          {userCount} {userCount === 1 ? "User" : "Users"}
        </div>
        <form action={logout}>
          <button
            id="logout-btn"
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-600 transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
