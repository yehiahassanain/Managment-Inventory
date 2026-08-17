import { redirect } from "next/navigation";
import { getSession } from "../../../lib/session";
import AnalyticsNav from "../../../components/analytics/AnalyticsNav";

export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard/products");
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Analytics Dashboard</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Business intelligence — revenue, profit, and inventory insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 bg-violet-500/10 border border-violet-500/20 text-violet-400 px-3 py-1.5 rounded-full">
            Admin View
          </span>
        </div>
      </div>

      {/* ── Sub-Navigation ───────────────────────────────────────── */}
      <AnalyticsNav />

      {/* ── Page Content ─────────────────────────────────────────── */}
      {children}
    </div>
  );
}
