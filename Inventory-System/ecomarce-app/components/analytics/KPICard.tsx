interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: "indigo" | "emerald" | "violet" | "amber" | "rose" | "cyan";
  trend?: { value: number; label: string };
}

const colorMap = {
  indigo: {
    glow: "shadow-indigo-500/20",
    icon: "from-indigo-500 to-indigo-600",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
    trendPos: "text-emerald-400",
    trendNeg: "text-rose-400",
  },
  emerald: {
    glow: "shadow-emerald-500/20",
    icon: "from-emerald-500 to-emerald-600",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    trendPos: "text-emerald-400",
    trendNeg: "text-rose-400",
  },
  violet: {
    glow: "shadow-violet-500/20",
    icon: "from-violet-500 to-violet-600",
    border: "border-violet-500/20",
    text: "text-violet-400",
    trendPos: "text-emerald-400",
    trendNeg: "text-rose-400",
  },
  amber: {
    glow: "shadow-amber-500/20",
    icon: "from-amber-500 to-amber-600",
    border: "border-amber-500/20",
    text: "text-amber-400",
    trendPos: "text-emerald-400",
    trendNeg: "text-rose-400",
  },
  rose: {
    glow: "shadow-rose-500/20",
    icon: "from-rose-500 to-rose-600",
    border: "border-rose-500/20",
    text: "text-rose-400",
    trendPos: "text-emerald-400",
    trendNeg: "text-rose-400",
  },
  cyan: {
    glow: "shadow-cyan-500/20",
    icon: "from-cyan-500 to-cyan-600",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    trendPos: "text-emerald-400",
    trendNeg: "text-rose-400",
  },
};

export default function KPICard({ title, value, subtitle, icon, color, trend }: KPICardProps) {
  const c = colorMap[color];
  return (
    <div
      className={`relative bg-slate-900/50 backdrop-blur-md border ${c.border} rounded-2xl p-5 shadow-lg ${c.glow} hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.icon} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trend.value >= 0 ? c.trendPos : c.trendNeg
            } bg-slate-800/60 px-2 py-1 rounded-lg`}
          >
            {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{title}</p>
        <p className={`text-2xl font-extrabold tracking-tight ${c.text}`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
