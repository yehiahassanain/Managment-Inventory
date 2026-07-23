import Image from "next/image";
import { TopProduct } from "../../app/dashboard/analytics/actions";

interface Props {
  products: TopProduct[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const rankColors = ["text-amber-400", "text-slate-400", "text-orange-700"];

export default function TopProductsTable({ products }: Props) {
  if (!products.length) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-600 text-sm">
        No sales data yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-slate-800/60">
            <th className="pb-3 pr-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest w-8">#</th>
            <th className="pb-3 pr-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Product</th>
            <th className="pb-3 pr-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest text-right">Sold</th>
            <th className="pb-3 pr-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest text-right">Revenue</th>
            <th className="pb-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest text-right">Profit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {products.map((p, i) => (
            <tr key={p.id} className="group hover:bg-slate-800/20 transition-colors">
              <td className="py-3 pr-4">
                <span className={`font-extrabold text-sm ${rankColors[i] ?? "text-slate-600"}`}>
                  {i + 1}
                </span>
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.name} width={36} height={36} className="object-cover w-full h-full" />
                    ) : (
                      <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm leading-tight truncate max-w-[160px]">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{p.categoryName}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 text-right">
                <span className="font-bold text-slate-200">{p.quantitySold.toLocaleString()}</span>
                <span className="text-slate-600 text-xs ml-1">units</span>
              </td>
              <td className="py-3 pr-4 text-right font-semibold text-indigo-400">{fmt(p.revenue)}</td>
              <td className="py-3 text-right font-semibold text-emerald-400">{fmt(p.profit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
