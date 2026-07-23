import { RecentTransaction } from "../../app/dashboard/analytics/actions";

interface Props {
  transactions: RecentTransaction[];
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; dot: string; badge: string }> = {
  Sold: {
    label: "Sale",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  Restock: {
    label: "Restock",
    icon: "M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4",
    dot: "bg-indigo-400",
    badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  Return: {
    label: "Return",
    icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  Damaged: {
    label: "Damaged",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    dot: "bg-rose-400",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecentActivity({ transactions }: Props) {
  if (!transactions.length) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-600 text-sm">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {transactions.map((tx, i) => {
        const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.Restock;
        return (
          <div key={tx.id} className={`flex items-start gap-4 py-3.5 ${i < transactions.length - 1 ? "border-b border-slate-800/40" : ""}`}>
            {/* Timeline dot */}
            <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
              <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ring-2 ring-slate-900`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cfg.icon} />
                  </svg>
                  {cfg.label}
                </span>
                <span className="text-xs font-semibold text-white truncate">{tx.itemName}</span>
              </div>
              <p className="text-xs text-slate-500">
                <span className="text-slate-400 font-medium">{tx.quantity} units</span>
                {" · "}by {tx.createdBy}
              </p>
            </div>

            {/* Time */}
            <span className="text-[10px] text-slate-600 shrink-0 pt-0.5">{timeAgo(tx.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}
