import type { Metadata } from "next";
import { getTopSellingProducts, getRecentTransactions } from "../actions";
import TopProductsTable from "../../../../components/analytics/TopProductsTable";
import RecentActivity from "../../../../components/analytics/RecentActivity";

export const metadata: Metadata = {
  title: "Products & Audit Log — Analytics",
  description: "Top-selling products and recent inventory transaction history.",
};

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtNum(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function ProductsAuditPage() {
  const [topProducts, recentTx] = await Promise.all([
    getTopSellingProducts(10),
    getRecentTransactions(20),
  ]);

  const totalProductRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);
  const totalProductProfit = topProducts.reduce((sum, p) => sum + p.profit, 0);
  const totalUnitsSold = topProducts.reduce((sum, p) => sum + p.quantitySold, 0);

  return (
    <div className="space-y-8">

      {/* ── Product Performance KPI strip ────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Product Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <p className="text-xs text-slate-500 font-medium mb-1">Top 10 Revenue</p>
            <p className="text-2xl font-extrabold text-indigo-400">{fmt(totalProductRevenue)}</p>
            <p className="text-[10px] text-slate-600 mt-1">Combined revenue from top 10 products</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <p className="text-xs text-slate-500 font-medium mb-1">Top 10 Profit</p>
            <p className="text-2xl font-extrabold text-emerald-400">{fmt(totalProductProfit)}</p>
            <p className="text-[10px] text-slate-600 mt-1">Combined profit from top 10 products</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <p className="text-xs text-slate-500 font-medium mb-1">Top 10 Units Sold</p>
            <p className="text-2xl font-extrabold text-violet-400">{fmtNum(totalUnitsSold)}</p>
            <p className="text-[10px] text-slate-600 mt-1">Total units moved by top 10 products</p>
          </div>
        </div>
      </section>

      {/* ── Top Selling Products Table ────────────────────────────── */}
      <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Top Selling Products</h2>
            <p className="text-slate-500 text-xs mt-0.5">Ranked by total units sold — all time</p>
          </div>
          <span className="text-xs text-slate-600 bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-1.5">
            Top 10
          </span>
        </div>
        <TopProductsTable products={topProducts} />
      </section>

      {/* ── Recent Activity / Audit Log ───────────────────────────── */}
      <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white">Audit Log</h2>
            <p className="text-slate-500 text-xs mt-0.5">Latest 20 inventory transactions — all types</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-800 border border-slate-700/50 rounded-lg px-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Sold
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-800 border border-slate-700/50 rounded-lg px-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />Restocked
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-800 border border-slate-700/50 rounded-lg px-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Return
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-800 border border-slate-700/50 rounded-lg px-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />Damaged
            </span>
          </div>
        </div>
        <RecentActivity transactions={recentTx} />
      </section>

    </div>
  );
}
