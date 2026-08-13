import Link from "next/link";
import { redirect } from "next/navigation";
import { getProductById } from "../actions";
import StatusBadge from "../../../../components/products/StatusBadge";
import { getSession } from "../../../../lib/session";

export const metadata = {
  title: "Product Details — Inventory Management System",
  description: "View complete product details, pricing, inventory levels, and supplier data.",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    redirect("/dashboard/products");
  }

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.role === "ADMIN";

  const quantity = product.inventory?.quantity ?? 0;
  const minStock = product.minimumStock ?? 0;
  const buyPrice = product.inventory?.buyPrice ?? 0;
  const sellPrice = product.inventory?.sellPrice ?? 0;
  const profit = sellPrice - buyPrice;
  const totalValue = quantity * sellPrice;
  const potentialProfit = profit * quantity;
  const inventoryCost = quantity * buyPrice;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with Back button */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products"
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/85 border border-slate-850 hover:border-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Back to Catalog"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Product Details
            </h1>
            <p className="text-slate-500 text-xs mt-0.5 font-mono">
              ID: {product.id}
            </p>
          </div>
        </div>

        <StatusBadge quantity={quantity} minimumStock={minStock} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Image and quick stats */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center">
            <div className="w-full aspect-square rounded-xl bg-slate-850/50 border border-slate-800 flex items-center justify-center overflow-hidden mb-4">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-16 h-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )}
            </div>

            <div className="w-full text-center">
              <h2 className="font-bold text-slate-100 text-lg leading-tight">{product.name}</h2>
              <p className="text-xs text-slate-500 font-mono mt-1">SKU: {product.sku || "N/A"}</p>
            </div>
          </div>

          {/* Quick Metrics / Financial Valuation (Only visible to Admin) */}
          {isAdmin && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                Financial Valuation
              </h3>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Inventory Cost</span>
                <span className="font-semibold text-slate-200">${inventoryCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Total Expected Revenue</span>
                <span className="font-semibold text-slate-200">${totalValue.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Total Expected Profit</span>
                <span className={`font-semibold ${potentialProfit >= 0 ? "text-emerald-450" : "text-red-450"}`}>
                  ${potentialProfit.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm border-t border-slate-800/60 pt-3">
                <span className="text-slate-450 font-medium">Total Inventory Value</span>
                <span className="font-bold text-slate-100">${totalValue.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Detailed info sections */}
        <div className="md:col-span-8 space-y-6">
          {/* General Information Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800/60 pb-2">
              General Info
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <span className="text-slate-500 block text-xs">Product Name</span>
                <span className="text-slate-200 font-medium">{product.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">SKU / Product Code</span>
                <span className="text-slate-200 font-mono font-medium">{product.sku || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Barcode / UPC</span>
                <span className="text-slate-200 font-mono font-medium">{product.barcode}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Category</span>
                <span className="inline-block text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg mt-0.5">
                  {product.category?.name}
                </span>
              </div>
              {isAdmin && (
                <div>
                  <span className="text-slate-500 block text-xs">Created Date</span>
                  <span className="text-slate-300 font-medium">
                    {product.createdOn.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Stock Details Card */}
          {isAdmin ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800/60 pb-2">
                Pricing &amp; Inventory
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-slate-550 block text-xs">Purchase Price</span>
                  <span className="text-slate-200 font-semibold text-base">${buyPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-550 block text-xs">Selling Price</span>
                  <span className="text-slate-100 font-semibold text-base">${sellPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-550 block text-xs">Profit per Unit</span>
                  <span className={`font-semibold text-base block ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    ${profit.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-550 block text-xs">Current Quantity</span>
                  <span className="text-slate-200 font-bold text-base">{quantity} units</span>
                </div>
                <div>
                  <span className="text-slate-550 block text-xs">Minimum Stock Quantity</span>
                  <span className="text-slate-350 font-medium text-base">{minStock} units</span>
                </div>
                <div>
                  <span className="text-slate-550 block text-xs">Inventory Status</span>
                  <div className="mt-1">
                    <StatusBadge quantity={quantity} minimumStock={minStock} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800/60 pb-2">
                Stock &amp; Inventory Status
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-slate-550 block text-xs">Current Available Quantity</span>
                  <span className="text-slate-200 font-bold text-base">{quantity} units</span>
                </div>
                <div>
                  <span className="text-slate-550 block text-xs">Minimum Stock Threshold</span>
                  <span className="text-slate-350 font-medium text-base">{minStock} units</span>
                </div>
                <div>
                  <span className="text-slate-550 block text-xs">Inventory Status</span>
                  <div className="mt-1">
                    <StatusBadge quantity={quantity} minimumStock={minStock} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Supplier details Card (Only visible to Admin) */}
          {isAdmin && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800/60 pb-2">
                Supplier Details
              </h3>
              
              {product.supplier ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="text-slate-550 block text-xs">Supplier Name</span>
                    <span className="text-slate-200 font-medium">{product.supplier.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-550 block text-xs">Contact Information</span>
                    <span className="text-slate-200 font-medium">{product.supplier.contactName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-555 block text-xs">Email</span>
                    {product.supplier.email ? (
                      <a href={`mailto:${product.supplier.email}`} className="text-indigo-400 hover:underline">
                        {product.supplier.email}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-555 block text-xs">Phone Number</span>
                    <span className="text-slate-300 font-medium">{product.supplier.phone || "—"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-555 block text-xs">Address</span>
                    <span className="text-slate-300 font-medium">{product.supplier.address || "—"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No supplier associated with this product.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 border-b border-slate-800/60 pb-2">
          Product Description
        </h3>
        <p className="text-slate-350 text-sm leading-relaxed whitespace-pre-line">
          {product.description || "No description provided for this product."}
        </p>
      </div>
    </div>
  );
}
