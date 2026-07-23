import { CategorySales } from "../../app/dashboard/analytics/actions";

interface Props {
  data: CategorySales[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const BAR_COLORS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
];

export default function CategoryBreakdown({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-600 text-sm">
        No category sales data yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((cat, i) => (
        <div key={cat.categoryId}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${BAR_COLORS[i % BAR_COLORS.length]}`} />
              <span className="text-sm font-semibold text-slate-200">{cat.categoryName}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">{cat.unitsSold} units</span>
              <span className="text-sm font-bold text-indigo-400">{fmt(cat.revenue)}</span>
              <span className="text-xs font-semibold text-slate-500 w-12 text-right">{cat.share.toFixed(1)}%</span>
            </div>
          </div>
          <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${BAR_COLORS[i % BAR_COLORS.length]} transition-all duration-700`}
              style={{ width: `${cat.share}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
