"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type Period = "today" | "week" | "month" | "year" | "all";

const TABS: { label: string; value: Period }[] = [
  { label: "Today", value: "today" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All Time", value: "all" },
];

interface Props {
  paramKey: string;
  current: Period;
}

export default function PeriodTabs({ paramKey, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(value: Period) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKey, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1 border border-slate-700/40">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => navigate(tab.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            current === tab.value
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
