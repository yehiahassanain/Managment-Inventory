import type { Metadata } from "next";
import { getInventoryOverview, getSalesByCategory } from "../actions";
import CategoryBreakdown from "../../../../components/analytics/CategoryBreakdown";

export const metadata: Metadata = {
  title: "Inventory Insights — Analytics",
  description: "Stock levels, low-stock alerts, and inventory value overview.",
};

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtNum(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function InventoryInsightsPage() {
  const [inventoryOverview, categoryData] = await Promise.all([
    getInventoryOverview(),
    getSalesByCategory(),
  ]);

  const stockHealthPct =
    inventoryOverview.totalProducts > 0
      ? Math.round(
          ((inventoryOverview.totalProducts -
            inventoryOverview.outOfStockProducts.length -
            inventoryOverview.lowStockProducts.length) /
            inventoryOverview.totalProducts) *
            100
        )
      : 100;

  return (
    <div className="space-y-8">

      {/* ── Inventory KPI Strip ───────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Inventory Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Total Products", value: fmtNum(inventoryOverview.totalProducts), color: "indigo", icon: "📦" },
            { label: "Categories", value: fmtNum(inventoryOverview.totalCategories), color: "violet", icon: "🗂️" },
            { label: "Suppliers", value: fmtNum(inventoryOverview.totalSuppliers), color: "cyan", icon: "🏭" },
            { label: "Inventory Value", value: fmt(inventoryOverview.inventoryValue), color: "emerald", icon: "💰" },
            { label: "Low Stock Items", value: fmtNum(inventoryOverview.lowStockProducts.length), color: "amber", icon: "⚠️" },
            { label: "Out of Stock", value: fmtNum(inventoryOverview.outOfStockProducts.length), color: "rose", icon: "🚫" },
          ].map((card) => (
            <div
              key={card.label}
              className={`bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col gap-2`}
            >
              <div className="text-2xl">{card.icon}</div>
              <p className="text-xs text-slate-500 font-medium">{card.label}</p>
              <p className={`text-xl font-extrabold ${
                card.color === "indigo" ? "text-indigo-400" :
                card.color === "violet" ? "text-violet-400" :
                card.color === "cyan" ? "text-cyan-400" :
                card.color === "emerald" ? "text-emerald-400" :
                card.color === "amber" ? "text-amber-400" :
                "text-rose-400"
              }`}>{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stock Health Bar ─────────────────────────────────────── */}
      <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Stock Health</h2>
            <p className="text-slate-500 text-xs mt-0.5">Proportion of products with healthy stock levels</p>
          </div>
          <span className={`text-2xl font-extrabold ${stockHealthPct >= 80 ? "text-emerald-400" : stockHealthPct >= 50 ? "text-amber-400" : "text-rose-400"}`}>
            {stockHealthPct}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              stockHealthPct >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
              stockHealthPct >= 50 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
              "bg-gradient-to-r from-rose-500 to-pink-500"
            }`}
            style={{ width: `${stockHealthPct}%` }}
          />
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Healthy stock</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Low stock ({inventoryOverview.lowStockProducts.length})</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Out of stock ({inventoryOverview.outOfStockProducts.length})</span>
        </div>
      </section>

      {/* ── Alerts Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Low Stock */}
        <section className="bg-slate-900/50 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-base font-bold text-white">Low Stock Alerts</h2>
            <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              {inventoryOverview.lowStockProducts.length}
            </span>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {inventoryOverview.lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <span className="text-3xl">✅</span>
                <p className="text-slate-500 text-sm font-medium">All products are well-stocked</p>
              </div>
            ) : (
              inventoryOverview.lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/25 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-slate-200 truncate max-w-[160px]">{p.name}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{p.categoryName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-amber-400">{p.quantity} left</p>
                    <p className="text-[10px] text-slate-600">min {p.minimumStock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Out of Stock */}
        <section className="bg-slate-900/50 backdrop-blur-md border border-rose-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <h2 className="text-base font-bold text-white">Out of Stock</h2>
            <span className="ml-auto text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
              {inventoryOverview.outOfStockProducts.length}
            </span>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {inventoryOverview.outOfStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <span className="text-3xl">🎉</span>
                <p className="text-slate-500 text-sm font-medium">No out-of-stock products</p>
              </div>
            ) : (
              inventoryOverview.outOfStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/25 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-slate-200 truncate max-w-[160px]">{p.name}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{p.categoryName}</p>
                  </div>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                    Empty
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Revenue by Category ───────────────────────────────────── */}
      <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="mb-5">
          <h2 className="text-base font-bold text-white">Revenue by Category</h2>
          <p className="text-slate-500 text-xs mt-0.5">Category performance breakdown — revenue share and units sold</p>
        </div>
        <CategoryBreakdown data={categoryData} />
      </section>

    </div>
  );
}
