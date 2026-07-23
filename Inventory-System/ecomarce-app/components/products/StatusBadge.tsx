"use client";

interface StatusBadgeProps {
  quantity: number;
  minimumStock: number;
}

export default function StatusBadge({ quantity, minimumStock }: StatusBadgeProps) {
  let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
  let classes = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";

  if (quantity <= 0) {
    status = "Out of Stock";
    classes = "bg-red-500/10 text-red-400 border border-red-500/25";
  } else if (quantity <= minimumStock) {
    status = "Low Stock";
    classes = "bg-amber-500/10 text-amber-400 border border-amber-500/25";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide border ${classes}`}>
      {status}
    </span>
  );
}
