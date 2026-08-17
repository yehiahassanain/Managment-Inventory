"use client";

import { useState, useTransition } from "react";
import StatusProductTable from "./StatusProductTable";
import {
  StatusAnalysisResponse,
  StatusFilterParams,
  getStatusAnalysis,
} from "../../app/dashboard/analytics/status/actions";

interface StatusAnalysisClientProps {
  initialData: StatusAnalysisResponse;
}

function fmtCurrency(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

function fmtNumber(val: number) {
  return new Intl.NumberFormat("en-US").format(val);
}

type TabType = "all" | "Sold" | "Return" | "Damaged" | "Restock";

export default function StatusAnalysisClient({ initialData }: StatusAnalysisClientProps) {
  const [data, setData] = useState<StatusAnalysisResponse>(initialData);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year" | "all">("all");
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (updates: Partial<StatusFilterParams>) => {
    const nextSearch = updates.search !== undefined ? updates.search : search;
    const nextCategory = updates.categoryId !== undefined ? updates.categoryId : categoryId;
    const nextPeriod = updates.period !== undefined ? updates.period : period;

    if (updates.search !== undefined) setSearch(nextSearch);
    if (updates.categoryId !== undefined) setCategoryId(nextCategory);
    if (updates.period !== undefined) setPeriod(nextPeriod);

    startTransition(async () => {
      try {
        const res = await getStatusAnalysis({
          search: nextSearch,
          categoryId: nextCategory,
          period: nextPeriod,
        });
        setData(res);
      } catch (err) {
        console.error("Failed to refresh status analysis:", err);
      }
    });
  };

  const periodOptions: { label: string; value: "today" | "week" | "month" | "year" | "all" }[] = [
    { label: "All Time", value: "all" },
    { label: "Today", value: "today" },
    { label: "7 Days", value: "week" },
    { label: "30 Days", value: "month" },
    { label: "1 Year", value: "year" },
  ];

  return (
    <div className="space-y-8">
      {/* ── Top Status KPI Metric Cards ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sold KPI */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "Sold" ? "all" : "Sold")}
          className={`p-5 rounded-2xl border text-left transition-all backdrop-blur-md cursor-pointer ${
            activeTab === "Sold"
              ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
              : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Sold Products</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {fmtNumber(data.summary.totalSoldUnits)} <span className="text-xs text-slate-500 font-normal">units</span>
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1">
            Revenue: <span className="text-emerald-400">{fmtCurrency(data.summary.totalSoldRevenue)}</span>
          </div>
        </button>

        {/* Returned KPI */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "Return" ? "all" : "Return")}
          className={`p-5 rounded-2xl border text-left transition-all backdrop-blur-md cursor-pointer ${
            activeTab === "Return"
              ? "bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10"
              : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Returned Products</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {fmtNumber(data.summary.totalReturnedUnits)} <span className="text-xs text-slate-500 font-normal">units</span>
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1">
            Value: <span className="text-amber-400">{fmtCurrency(data.summary.totalReturnedValue)}</span>
          </div>
        </button>

        {/* Damaged KPI */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "Damaged" ? "all" : "Damaged")}
          className={`p-5 rounded-2xl border text-left transition-all backdrop-blur-md cursor-pointer ${
            activeTab === "Damaged"
              ? "bg-rose-500/10 border-rose-500/40 shadow-lg shadow-rose-500/10"
              : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Damaged Products</span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-400">
            {fmtNumber(data.summary.totalDamagedUnits)} <span className="text-xs text-slate-500 font-normal">units</span>
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1">
            Loss: <span className="text-rose-400">{fmtCurrency(data.summary.totalDamagedLoss)}</span>
          </div>
        </button>

        {/* Restocked KPI */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "Restock" ? "all" : "Restock")}
          className={`p-5 rounded-2xl border text-left transition-all backdrop-blur-md cursor-pointer ${
            activeTab === "Restock"
              ? "bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/10"
              : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Restocked Products</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-extrabold text-indigo-400">
            {fmtNumber(data.summary.totalRestockedUnits)} <span className="text-xs text-slate-500 font-normal">units</span>
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1">
            Cost: <span className="text-indigo-400">{fmtCurrency(data.summary.totalRestockedValue)}</span>
          </div>
        </button>
      </section>

      {/* ── Filter Bar ── */}
      <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by product name, SKU, barcode, user..."
              value={search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="w-full sm:w-64">
            <select
              value={categoryId}
              onChange={(e) => handleFilterChange({ categoryId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            >
              <option value="">All Categories ({data.categories.length})</option>
              {data.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800/80 p-1 rounded-xl shrink-0 overflow-x-auto">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleFilterChange({ period: opt.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  period === opt.value
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table View Tabs ── */}
        <div className="flex items-center gap-2 border-t border-slate-800/60 pt-4 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 mr-1 uppercase tracking-wider shrink-0">
            View Table:
          </span>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "all"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            All Tables ({data.sold.length + data.returned.length + data.damaged.length + data.restocked.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("Sold")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "Sold"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Sold Products ({data.sold.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("Return")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "Return"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:text-amber-400 hover:bg-slate-800/50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Returned Products ({data.returned.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("Damaged")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "Damaged"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "text-slate-400 hover:text-rose-400 hover:bg-slate-800/50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Damaged Products ({data.damaged.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("Restock")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "Restock"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Restocked Products ({data.restocked.length})
          </button>
        </div>
      </section>

      {/* ── Tables Display Area ── */}
      <div className={`space-y-8 transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
        {(activeTab === "all" || activeTab === "Sold") && (
          <StatusProductTable
            title="Sold Products"
            description="All products that have been sold to customers."
            items={data.sold}
            statusType="Sold"
          />
        )}

        {(activeTab === "all" || activeTab === "Return") && (
          <StatusProductTable
            title="Returned Products"
            description="All products returned by customers back to inventory."
            items={data.returned}
            statusType="Return"
          />
        )}

        {(activeTab === "all" || activeTab === "Damaged") && (
          <StatusProductTable
            title="Damaged Products"
            description="All products recorded as broken or damaged."
            items={data.damaged}
            statusType="Damaged"
          />
        )}

        {(activeTab === "all" || activeTab === "Restock") && (
          <StatusProductTable
            title="Restocked Products"
            description="All inventory shipments and restocked batches."
            items={data.restocked}
            statusType="Restock"
          />
        )}
      </div>
    </div>
  );
}
