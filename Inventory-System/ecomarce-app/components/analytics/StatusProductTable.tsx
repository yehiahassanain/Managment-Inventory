"use client";

import Image from "next/image";
import Link from "next/link";
import { StatusTransactionItem } from "../../app/dashboard/analytics/status/actions";

interface StatusProductTableProps {
  title: string;
  description: string;
  items: StatusTransactionItem[];
  statusType: "Sold" | "Return" | "Damaged" | "Restock";
}

function fmtCurrency(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

function fmtNumber(val: number) {
  return new Intl.NumberFormat("en-US").format(val);
}

const statusConfig = {
  Sold: {
    label: "Sold",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotBg: "bg-emerald-400",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    headerBg: "from-emerald-500/10 to-transparent",
    accentBorder: "border-emerald-500/30",
    textAccent: "text-emerald-400",
  },
  Return: {
    label: "Returned",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dotBg: "bg-amber-400",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
    headerBg: "from-amber-500/10 to-transparent",
    accentBorder: "border-amber-500/30",
    textAccent: "text-amber-400",
  },
  Damaged: {
    label: "Damaged",
    badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dotBg: "bg-rose-400",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    headerBg: "from-rose-500/10 to-transparent",
    accentBorder: "border-rose-500/30",
    textAccent: "text-rose-400",
  },
  Restock: {
    label: "Restocked",
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    dotBg: "bg-indigo-400",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    headerBg: "from-indigo-500/10 to-transparent",
    accentBorder: "border-indigo-500/30",
    textAccent: "text-indigo-400",
  },
};

export default function StatusProductTable({
  title,
  description,
  items,
  statusType,
}: StatusProductTableProps) {
  const config = statusConfig[statusType];
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl transition-all">
      {/* ── Table Header Banner ── */}
      <div className={`px-6 py-5 border-b border-slate-800/80 bg-gradient-to-r ${config.headerBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${config.badgeBg} ${config.accentBorder}`}>
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.badgeBg}`}>
                {items.length} {items.length === 1 ? "record" : "records"}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">{description}</p>
          </div>
        </div>

        {/* Aggregate Stats Pill */}
        <div className="flex items-center gap-4 bg-slate-950/40 border border-slate-800/60 rounded-xl px-4 py-2 self-start sm:self-auto">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Units</span>
            <span className="text-sm font-bold text-white">{fmtNumber(totalUnits)}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Value</span>
            <span className={`text-sm font-bold ${config.textAccent}`}>{fmtCurrency(totalValue)}</span>
          </div>
        </div>
      </div>

      {/* ── Table Content ── */}
      {items.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-400">No {title.toLowerCase()} recorded</p>
          <p className="text-xs text-slate-600 mt-1">No transaction activity matches the current filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/40 border-b border-slate-800/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold select-none">
              <tr>
                <th scope="col" className="px-6 py-3.5">Product</th>
                <th scope="col" className="px-4 py-3.5">Category</th>
                <th scope="col" className="px-4 py-3.5 text-center">Quantity</th>
                <th scope="col" className="px-4 py-3.5">Unit Price</th>
                <th scope="col" className="px-4 py-3.5">Total Value</th>
                <th scope="col" className="px-4 py-3.5">Date & Time</th>
                <th scope="col" className="px-4 py-3.5">Logged By</th>
                <th scope="col" className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/30 transition-colors duration-150 group"
                >
                  {/* Product Cell */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 max-w-[200px]">
                        <Link
                          href={`/dashboard/products/${item.productId}`}
                          className="font-semibold text-white hover:text-indigo-400 transition-colors block truncate"
                          title={item.productName}
                        >
                          {item.productName}
                        </Link>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          {item.sku && item.barcode && <span>•</span>}
                          <span>BC: {item.barcode}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category Cell */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                      {item.categoryName}
                    </span>
                  </td>

                  {/* Quantity Cell */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-center">
                    <span className="inline-block font-bold text-sm text-white px-2.5 py-0.5 bg-slate-800/50 rounded-lg border border-slate-700/40">
                      {fmtNumber(item.quantity)}
                    </span>
                  </td>

                  {/* Unit Price Cell */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="text-slate-300 font-medium">
                      {statusType === "Sold" || statusType === "Return"
                        ? fmtCurrency(item.unitSellPrice)
                        : fmtCurrency(item.unitBuyPrice)}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {statusType === "Sold" || statusType === "Return" ? "Sell Price" : "Cost Price"}
                    </span>
                  </td>

                  {/* Total Value Cell */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-bold">
                    <span className={config.textAccent}>
                      {fmtCurrency(item.totalValue)}
                    </span>
                  </td>

                  {/* Date & Time Cell */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                    {item.formattedDate}
                  </td>

                  {/* Logged By Cell */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                        {item.loggedBy.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[100px]" title={item.loggedBy}>
                        {item.loggedBy}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge Cell */}
                  <td className="px-6 py-3.5 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${config.badgeBg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dotBg}`} />
                      {config.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
