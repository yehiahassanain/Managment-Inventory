"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

export default function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  function apply() {
    if (!from || !to) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("profitPeriod", "all");
    params.set("salesPeriod", "all");
    params.set("from", from);
    params.set("to", to);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clear() {
    setFrom("");
    setTo("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    params.set("profitPeriod", "month");
    params.set("salesPeriod", "month");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
      />
      <span className="text-slate-600 text-xs">to</span>
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
      />
      <button
        onClick={apply}
        disabled={!from || !to}
        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
      >
        Apply
      </button>
      {(from || to) && (
        <button
          onClick={clear}
          className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Clear
        </button>
      )}
    </div>
  );
}
