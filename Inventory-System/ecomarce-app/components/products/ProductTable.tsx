"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";

interface ProductTableProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-800/60 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <th className="pb-3 pr-4">Product Info</th>
            <th className="pb-3 px-4 hidden md:table-cell">Barcode</th>
            <th className="pb-3 px-4">Category</th>
            <th className="pb-3 px-4 hidden lg:table-cell">Supplier</th>
            <th className="pb-3 px-4 text-right">Prices (Buy / Sell)</th>
            <th className="pb-3 px-4 text-center">Stock</th>
            <th className="pb-3 px-4">Status</th>
            <th className="pb-3 pl-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {products.map((product) => {
            const quantity = product.inventory?.quantity ?? 0;
            const minStock = product.minimumStock ?? 0;
            const buyPrice = product.inventory?.buyPrice ?? 0;
            const sellPrice = product.inventory?.sellPrice ?? 0;

            return (
              <tr key={product.id} className="group hover:bg-slate-800/20 transition-colors">
                {/* Product Info */}
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {product.sku || "NO SKU"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Barcode */}
                <td className="py-4 px-4 hidden md:table-cell align-middle text-slate-400 font-mono text-xs">
                  {product.barcode}
                </td>

                {/* Category */}
                <td className="py-4 px-4 align-middle">
                  <span className="text-xs font-medium text-slate-350 bg-slate-800/60 border border-slate-750 px-2 py-0.5 rounded-lg">
                    {product.category?.name}
                  </span>
                </td>

                {/* Supplier */}
                <td className="py-4 px-4 hidden lg:table-cell align-middle text-slate-400">
                  {product.supplier?.name || <span className="text-slate-600 text-xs">—</span>}
                </td>

                {/* Prices */}
                <td className="py-4 px-4 align-middle text-right font-medium">
                  <div className="text-slate-100">${sellPrice.toFixed(2)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">cost: ${buyPrice.toFixed(2)}</div>
                </td>

                {/* Stock */}
                <td className="py-4 px-4 align-middle text-center">
                  <div className="text-slate-200 font-semibold">{quantity}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">min: {minStock}</div>
                </td>

                {/* Status */}
                <td className="py-4 px-4 align-middle">
                  <StatusBadge quantity={quantity} minimumStock={minStock} />
                </td>

                {/* Actions */}
                <td className="py-4 pl-4 text-right align-middle">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Details */}
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-850 hover:border-slate-700 rounded-xl transition-all active:scale-90"
                      title="View Details"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>

                    {/* Edit Product */}
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/35 rounded-xl transition-all active:scale-90 cursor-pointer"
                      title="Edit Product"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Delete Product */}
                    <button
                      onClick={() => onDelete(product)}
                      className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/35 rounded-xl transition-all active:scale-90 cursor-pointer"
                      title="Delete Product"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
