"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type ChartMetric = "revenue" | "profit" | "unitsSold";

const METRICS: { label: string; value: ChartMetric; color: string }[] = [
  { label: "Revenue", value: "revenue", color: "text-indigo-400" },
  { label: "Profit", value: "profit", color: "text-emerald-400" },
  { label: "Units", value: "unitsSold", color: "text-amber-400" },
];

interface Props {
  current: ChartMetric;
}

export default function ChartMetricSwitcher({ current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(value: ChartMetric) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("chartMetric", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1 border border-slate-700/40">
      {METRICS.map((m) => (
        <button
          key={m.value}
          onClick={() => navigate(m.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            current === m.value
              ? `bg-slate-700 ${m.color} shadow-sm`
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
