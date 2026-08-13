import type { Metadata } from "next";
import {
  getAnalyticsSummary,
  getProfitReport,
  getSalesByCategory,
  getSalesTrend,
} from "./actions";
import KPICard from "../../../components/analytics/KPICard";
import PeriodTabs, { Period } from "../../../components/analytics/PeriodTabs";
import DateRangeFilter from "../../../components/analytics/DateRangeFilter";
import CategoryBreakdown from "../../../components/analytics/CategoryBreakdown";
import SalesTrendChart from "../../../components/analytics/SalesTrendChart";
import ChartMetricSwitcher, { ChartMetric } from "../../../components/analytics/ChartMetricSwitcher";

export const metadata: Metadata = {
  title: "Financial Overview — Analytics",
  description: "Revenue, profit, and sales trend analysis for administrators.",
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
  const sp = await searchParams;

  const profitPeriod = (sp.profitPeriod as Period) ?? "month";
  const salesPeriod = (sp.salesPeriod as Period) ?? "month";
  const chartMetric = (sp.chartMetric as ChartMetric) ?? "revenue";
  const customFrom = sp.from;
  const customTo = sp.to;

  const [summary, profitReport, salesReport, categoryData, trendData] =
    await Promise.all([
      getAnalyticsSummary(),
      getProfitReport(profitPeriod, customFrom, customTo),
      getProfitReport(salesPeriod, customFrom, customTo),
      getSalesByCategory(),
      getSalesTrend(30),
    ]);

  return (
    <div className="space-y-8">

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

      {/* ── Profit + Sales Reports (Separate Lines) ──────────────── */}
      <div className="space-y-6">

        {/* Profit Report */}
        <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
          {/* Header: Title & Period Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Profit Report
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">Revenue minus cost of goods</p>
            </div>
            <PeriodTabs paramKey="profitPeriod" current={profitPeriod} />
          </div>

          {/* Main Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Profit</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{fmt(profitReport.profit)}</span>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Revenue</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400">{fmt(profitReport.revenue)}</span>
            </div>
          </div>

          {/* Secondary Metrics on a New Line */}
          <div className="flex items-center flex-wrap gap-6 sm:gap-12 pt-4 border-t border-slate-800/60">
            <div>
              <p className="text-slate-500 text-xs font-medium">Orders</p>
              <p className="text-base font-bold text-slate-100 mt-0.5">{fmtNum(profitReport.orders)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">Units Sold</p>
              <p className="text-base font-bold text-slate-100 mt-0.5">{fmtNum(profitReport.unitsSold)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">Margin</p>
              <p className="text-base font-bold text-emerald-400 mt-0.5">
                {profitReport.revenue > 0
                  ? `${((profitReport.profit / profitReport.revenue) * 100).toFixed(1)}%`
                  : "—"}
              </p>
            </div>
          </div>
        </section>

        {/* Sales Report */}
        <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
          {/* Header: Title & Period Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" />
                Sales Report
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">Units moved and order volume</p>
            </div>
            <PeriodTabs paramKey="salesPeriod" current={salesPeriod} />
          </div>

          {/* Main Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block mb-1">Units Sold</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-violet-400">{fmtNum(salesReport.unitsSold)}</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Orders</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">{fmtNum(salesReport.orders)}</span>
            </div>
          </div>

          {/* Secondary Metrics on a New Line */}
          <div className="flex items-center flex-wrap gap-6 sm:gap-12 pt-4 border-t border-slate-800/60">
            <div>
              <p className="text-slate-500 text-xs font-medium">Total Revenue</p>
              <p className="text-base font-bold text-slate-100 mt-0.5">{fmt(salesReport.revenue)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">Avg. Order Size</p>
              <p className="text-base font-bold text-slate-100 mt-0.5">
                {salesReport.orders > 0 ? fmtNum(Math.round(salesReport.unitsSold / salesReport.orders)) : "—"} units
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* ── Custom Date Range ─────────────────────────────────────── */}
      <section className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="shrink-0">
            <p className="text-sm font-semibold text-slate-300">Custom Date Range</p>
            <p className="text-xs text-slate-600 mt-0.5">Filter profit &amp; sales reports by date</p>
          </div>
          <DateRangeFilter />
        </div>
      </section>

      {/* ── Revenue by Category ───────────────────────────────────── */}
      <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="mb-5">
          <h2 className="text-base font-bold text-white">Revenue by Category</h2>
          <p className="text-slate-500 text-xs mt-0.5">Share of total revenue per category</p>
        </div>
        <CategoryBreakdown data={categoryData} />
      </section>

    </div>
  );
}
