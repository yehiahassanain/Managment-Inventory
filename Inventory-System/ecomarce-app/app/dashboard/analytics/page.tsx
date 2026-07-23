import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../../../lib/session";
import {
  getAnalyticsSummary,
  getProfitReport,
  getTopSellingProducts,
  getInventoryOverview,
  getSalesByCategory,
  getSalesTrend,
  getRecentTransactions,
} from "./actions";
import KPICard from "../../../components/analytics/KPICard";
import PeriodTabs, { Period } from "../../../components/analytics/PeriodTabs";
import DateRangeFilter from "../../../components/analytics/DateRangeFilter";
import TopProductsTable from "../../../components/analytics/TopProductsTable";
import CategoryBreakdown from "../../../components/analytics/CategoryBreakdown";
import RecentActivity from "../../../components/analytics/RecentActivity";
import SalesTrendChart from "../../../components/analytics/SalesTrendChart";
import ChartMetricSwitcher, { ChartMetric } from "../../../components/analytics/ChartMetricSwitcher";

export const metadata: Metadata = {
  title: "Analytics — Inventory Management System",
  description: "Admin analytics dashboard — revenue, profit, sales, inventory overview.",
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

interface PageProps {
  searchParams: Promise<{
    profitPeriod?: string;
    salesPeriod?: string;
    from?: string;
    to?: string;
    chartMetric?: string;
  }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const sp = await searchParams;

  const profitPeriod = (sp.profitPeriod as Period) ?? "month";
  const salesPeriod = (sp.salesPeriod as Period) ?? "month";
  const chartMetric = (sp.chartMetric as ChartMetric) ?? "revenue";
  const customFrom = sp.from;
  const customTo = sp.to;

  const [summary, profitReport, salesReport, topProducts, inventoryOverview, categoryData, trendData, recentTx] =
    await Promise.all([
      getAnalyticsSummary(),
      getProfitReport(profitPeriod, customFrom, customTo),
      getProfitReport(salesPeriod, customFrom, customTo),
      getTopSellingProducts(10),
      getInventoryOverview(),
      getSalesByCategory(),
      getSalesTrend(30),
      getRecentTransactions(15),
    ]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">

      {/* ── Page Header ─────────────────────────────────────────── */}
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

      {/* ── KPI Cards ────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <KPICard
            title="Total Revenue"
            value={fmt(summary.totalRevenue)}
            subtitle="All-time from sales"
            color="indigo"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <KPICard
            title="Total Profit"
            value={fmt(summary.totalProfit)}
            subtitle="Revenue minus cost"
            color="emerald"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <KPICard
            title="Units Sold"
            value={fmtNum(summary.totalSales)}
            subtitle="Total quantity sold"
            color="violet"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          />
          <KPICard
            title="Total Orders"
            value={fmtNum(summary.totalOrders)}
            subtitle="Sales transactions"
            color="amber"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <KPICard
            title="Inventory Value"
            value={fmt(summary.inventoryValue)}
            subtitle="Stock at cost price"
            color="cyan"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ── Sales Trend Chart ─────────────────────────────────────── */}
      <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Sales Trends</h2>
            <p className="text-slate-500 text-xs mt-0.5">Last 30 days of activity</p>
          </div>
          <ChartMetricSwitcher current={chartMetric} />
        </div>
        <SalesTrendChart data={trendData} activeMetric={chartMetric} />
      </section>

      {/* ── Profit + Sales Reports ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Profit Report */}
        <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Profit Report</h2>
              <p className="text-slate-500 text-xs mt-0.5">Revenue minus cost of goods</p>
            </div>
            <PeriodTabs paramKey="profitPeriod" current={profitPeriod} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Profit</p>
              <p className="text-2xl font-extrabold text-emerald-400">{fmt(profitReport.profit)}</p>
            </div>
            <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Revenue</p>
              <p className="text-2xl font-extrabold text-indigo-400">{fmt(profitReport.revenue)}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-slate-600 text-xs">Orders</p>
              <p className="font-bold text-slate-200">{fmtNum(profitReport.orders)}</p>
            </div>
            <div>
              <p className="text-slate-600 text-xs">Units Sold</p>
              <p className="font-bold text-slate-200">{fmtNum(profitReport.unitsSold)}</p>
            </div>
            <div>
              <p className="text-slate-600 text-xs">Margin</p>
              <p className="font-bold text-slate-200">
                {profitReport.revenue > 0
                  ? `${((profitReport.profit / profitReport.revenue) * 100).toFixed(1)}%`
                  : "—"}
              </p>
            </div>
          </div>
        </section>

        {/* Sales Report */}
        <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Sales Report</h2>
              <p className="text-slate-500 text-xs mt-0.5">Units moved and order volume</p>
            </div>
            <PeriodTabs paramKey="salesPeriod" current={salesPeriod} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4">
              <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-1">Units Sold</p>
              <p className="text-2xl font-extrabold text-violet-400">{fmtNum(salesReport.unitsSold)}</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Orders</p>
              <p className="text-2xl font-extrabold text-amber-400">{fmtNum(salesReport.orders)}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-slate-600 text-xs">Total Revenue</p>
              <p className="font-bold text-slate-200">{fmt(salesReport.revenue)}</p>
            </div>
            <div>
              <p className="text-slate-600 text-xs">Avg. Order Size</p>
              <p className="font-bold text-slate-200">
                {salesReport.orders > 0 ? fmtNum(Math.round(salesReport.unitsSold / salesReport.orders)) : "—"} units
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Custom Date Range */}
      <section className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="shrink-0">
            <p className="text-sm font-semibold text-slate-300">Custom Date Range</p>
            <p className="text-xs text-slate-600 mt-0.5">Filter profit &amp; sales reports by date</p>
          </div>
          <DateRangeFilter />
        </div>
      </section>

      {/* ── Top Selling Products ──────────────────────────────────── */}
      <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Top Selling Products</h2>
            <p className="text-slate-500 text-xs mt-0.5">Ranked by total units sold</p>
          </div>
          <span className="text-xs text-slate-600 bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-1.5">
            Top 10
          </span>
        </div>
        <TopProductsTable products={topProducts} />
      </section>

      {/* ── Inventory Overview + Stock Alerts ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory stats */}
        <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-5">Inventory Overview</h2>
          <div className="space-y-3">
            {[
              { label: "Total Products", value: fmtNum(inventoryOverview.totalProducts), color: "text-indigo-400" },
              { label: "Categories", value: fmtNum(inventoryOverview.totalCategories), color: "text-violet-400" },
              { label: "Suppliers", value: fmtNum(inventoryOverview.totalSuppliers), color: "text-cyan-400" },
              { label: "Inventory Value", value: fmt(inventoryOverview.inventoryValue), color: "text-emerald-400" },
              { label: "Low Stock Items", value: fmtNum(inventoryOverview.lowStockProducts.length), color: "text-amber-400" },
              { label: "Out of Stock", value: fmtNum(inventoryOverview.outOfStockProducts.length), color: "text-rose-400" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-800/40 last:border-0">
                <span className="text-xs text-slate-500">{row.label}</span>
                <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Low Stock */}
        <section className="bg-slate-900/50 backdrop-blur-md border border-amber-500/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-base font-bold text-white">Low Stock</h2>
            <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              {inventoryOverview.lowStockProducts.length}
            </span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {inventoryOverview.lowStockProducts.length === 0 ? (
              <p className="text-slate-600 text-xs text-center py-6">All products are well-stocked</p>
            ) : (
              inventoryOverview.lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-800/40 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">{p.name}</p>
                    <p className="text-[10px] text-slate-600">{p.categoryName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-amber-400">{p.quantity} left</p>
                    <p className="text-[10px] text-slate-600">min {p.minimumStock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Out of Stock */}
        <section className="bg-slate-900/50 backdrop-blur-md border border-rose-500/15 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <h2 className="text-base font-bold text-white">Out of Stock</h2>
            <span className="ml-auto text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
              {inventoryOverview.outOfStockProducts.length}
            </span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {inventoryOverview.outOfStockProducts.length === 0 ? (
              <p className="text-slate-600 text-xs text-center py-6">No out-of-stock products</p>
            ) : (
              inventoryOverview.outOfStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-800/40 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">{p.name}</p>
                    <p className="text-[10px] text-slate-600">{p.categoryName}</p>
                  </div>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                    Empty
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Sales by Category + Recent Activity ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="mb-5">
            <h2 className="text-base font-bold text-white">Revenue by Category</h2>
            <p className="text-slate-500 text-xs mt-0.5">Share of total revenue per category</p>
          </div>
          <CategoryBreakdown data={categoryData} />
        </section>

        {/* Recent activity */}
        <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="mb-5">
            <h2 className="text-base font-bold text-white">Recent Activity</h2>
            <p className="text-slate-500 text-xs mt-0.5">Latest inventory transactions</p>
          </div>
          <RecentActivity transactions={recentTx} />
        </section>
      </div>

    </div>
  );
}
