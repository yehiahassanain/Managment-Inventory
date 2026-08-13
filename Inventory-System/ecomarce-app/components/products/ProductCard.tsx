"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";

interface ProductCardProps {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
  isAdmin?: boolean;
}

export default function ProductCard({ product, onEdit, onDelete, isAdmin = false }: ProductCardProps) {
  const quantity = product.inventory?.quantity ?? 0;
  const minStock = product.minimumStock ?? 0;
  const buyPrice = product.inventory?.buyPrice ?? 0;
  const sellPrice = product.inventory?.sellPrice ?? 0;

  return (
    <div className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/60 rounded-2xl p-5 transition-all shadow-lg flex flex-col justify-between min-h-[220px]">
      <div>
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{product.sku || "NO SKU"}</p>
            </div>
          </div>
          <StatusBadge quantity={quantity} minimumStock={minStock} />
        </div>

        <div className="flex justify-between text-xs border-b border-slate-800 pb-3 mb-3">
          <div>
            <span className="text-slate-500 block">Category</span>
            <span className="text-slate-350 font-medium">{product.category?.name}</span>
          </div>
          {isAdmin && (
            <div>
              <span className="text-slate-500 block text-right">Supplier</span>
              <span className="text-slate-350 font-medium block text-right max-w-[120px] truncate">
                {product.supplier?.name || "—"}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-sm">
          {isAdmin ? (
            <>
              <div>
                <span className="text-slate-500 text-xs block">Prices</span>
                <span className="text-slate-100 font-semibold">${sellPrice.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 ml-1">cost: ${buyPrice.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-xs block">Stock</span>
                <span className="text-slate-200 font-bold">{quantity}</span>
                <span className="text-[10px] text-slate-500 ml-1">min: {minStock}</span>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-between items-center">
              <span className="text-slate-500 text-xs font-medium">Available Quantity</span>
              <span className="text-slate-100 font-bold text-sm">
                {quantity} <span className="text-slate-500 font-normal text-xs">(min: {minStock})</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-4 pt-3 border-t border-slate-800">
        <Link
          href={`/dashboard/products/${product.id}`}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-850 hover:border-slate-700 rounded-lg text-xs transition-all active:scale-90 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Details
        </Link>
        <button
          onClick={() => onEdit(product)}
          className="p-1.5 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/35 rounded-lg text-xs transition-all active:scale-90 cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(product)}
          className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/35 rounded-lg text-xs transition-all active:scale-90 cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
