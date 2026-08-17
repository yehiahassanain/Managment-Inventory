"use client";

import { useState } from "react";
import ProductImageUploader from "./ProductImageUploader";

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  suppliers: Supplier[];
  initialProduct?: {
    id: string;
    name: string;
    sku: string | null;
    barcode: string;
    imageUrl: string | null;
    description: string;
    minimumStock: number;
    categoryId: string;
    supplierId: string | null;
    buyPrice: number;
    sellPrice: number;
    quantity: number;
  } | null;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error: string | null }>;
  onCancel: () => void;
  isAdmin?: boolean;
}

export default function ProductForm({
  categories,
  suppliers,
  initialProduct,
  onSubmit,
  onCancel,
  isAdmin = true,
}: ProductFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [currentQty, setCurrentQty] = useState<number>(initialProduct?.quantity ?? 0);

  const originalQty = initialProduct?.quantity ?? 0;
  const qtyDirection = currentQty > originalQty ? "increase" : currentQty < originalQty ? "decrease" : "same";
  const effectiveSelectedType = qtyDirection === "decrease" ? "Sold" : selectedType;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = (formData.get("name") as string)?.trim();
    const categoryId = formData.get("categoryId") as string;
    
    const rawBuyPrice = formData.get("buyPrice") as string;
    const rawSellPrice = formData.get("sellPrice") as string;
    const buyPrice = parseFloat(rawBuyPrice);
    const sellPrice = parseFloat(rawSellPrice);
    const rawQuantity = formData.get("quantity") as string;
    const parsedQty = parseInt(rawQuantity, 10);
    const quantity = (rawQuantity !== null && rawQuantity !== "" && !isNaN(parsedQty))
      ? parsedQty
      : (initialProduct?.quantity ?? 0);
    const minimumStock = parseInt(formData.get("minimumStock") as string, 10);
    const submittedTransactionType = formData.get("transactionType") as string;
    const transactionType = qtyDirection === "decrease" ? "Sold" : submittedTransactionType;
    if (qtyDirection === "decrease") {
      formData.set("transactionType", "Sold");
    }

    if (initialProduct && qtyDirection === "increase" && !transactionType) {
      setError("Please select a Reason for adding stock.");
      return;
    }

    if (!name) {
      setError("Product Name is required.");
      return;
    }
    if (!categoryId) {
      setError("Please select a Category.");
      return;
    }
    if (isAdmin) {
      if (isNaN(buyPrice) || buyPrice < 0) {
        setError("Purchase Price must be 0 or a positive number.");
        return;
      }
      if (isNaN(sellPrice) || sellPrice < 0) {
        setError("Selling Price must be 0 or a positive number.");
        return;
      }
      if (sellPrice < buyPrice) {
        setError("Selling Price cannot be less than Purchase Price.");
        return;
      }
    }
    if (isNaN(minimumStock) || minimumStock < 0) {
      setError("Minimum Stock must be 0 or greater.");
      return;
    }
    if (!initialProduct && (isNaN(quantity) || quantity < 0)) {
      setError("Initial Quantity must be 0 or greater.");
      return;
    }

    setIsPending(true);
    try {
      const res = await onSubmit(formData);
      if (!res.success) {
        setError(res.error || "Something went wrong.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit product.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
          {error}
        </div>
      )}

      {initialProduct && (
        <input type="hidden" name="productId" value={initialProduct.id} />
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Product Name *
          </label>
          <input
            name="name"
            required
            defaultValue={initialProduct?.name || ""}
            placeholder="e.g. Wireless Ergonomic Mouse"
            className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            SKU (Stock Keeping Unit)
          </label>
          <input
            name="sku"
            defaultValue={initialProduct?.sku || ""}
            placeholder="e.g. ELEC-MOU-001"
            className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all uppercase"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Barcode / UPC
          </label>
          <input
            name="barcode"
            defaultValue={initialProduct?.barcode || ""}
            placeholder="Auto-generated if left blank"
            className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Description
          </label>
          <input
            name="description"
            defaultValue={initialProduct?.description || ""}
            placeholder="Brief item summary"
            className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Category & Supplier */}
      <div className={`grid grid-cols-1 ${isAdmin ? "sm:grid-cols-2" : ""} gap-4`}>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Category *
          </label>
          <select
            name="categoryId"
            defaultValue={initialProduct?.categoryId || ""}
            className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Supplier — only visible to admin */}
        {isAdmin ? (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Supplier
            </label>
            <select
              name="supplierId"
              defaultValue={initialProduct?.supplierId || ""}
              className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            >
              <option value="">Select a supplier</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="supplierId" value={initialProduct?.supplierId || ""} />
        )}
      </div>

      <div>
        <ProductImageUploader initialImageUrl={initialProduct?.imageUrl} />
      </div>

      <div className={`grid ${isAdmin ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"} gap-4`}>
        {/* Purchase & Sell Price (Admin Only) */}
        {isAdmin ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Buy Price ($) *
              </label>
              <input
                name="buyPrice"
                type="number"
                required
                step="0.01"
                min="0"
                defaultValue={initialProduct?.buyPrice ?? ""}
                placeholder="0.00"
                className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Sell Price ($) *
              </label>
              <input
                name="sellPrice"
                type="number"
                required
                step="0.01"
                min="0"
                defaultValue={initialProduct?.sellPrice ?? ""}
                placeholder="0.00"
                className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>
          </>
        ) : (
          <>
            <input type="hidden" name="buyPrice" value={initialProduct?.buyPrice ?? 0} />
            <input type="hidden" name="sellPrice" value={initialProduct?.sellPrice ?? 0} />
          </>
        )}

        {/* Initial Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Quantity {initialProduct ? "" : "*"}
          </label>
          <input
            name="quantity"
            type="number"
            required={!initialProduct}
            min="0"
            defaultValue={initialProduct?.quantity ?? ""}
            placeholder="0"
            onChange={(e) => {
              if (!initialProduct) return;
              const val = e.target.value;
              const newQty = val !== "" && !isNaN(parseInt(val, 10)) ? parseInt(val, 10) : originalQty;
              const newDir = newQty > originalQty ? "increase" : newQty < originalQty ? "decrease" : "same";
              const oldDir = currentQty > originalQty ? "increase" : currentQty < originalQty ? "decrease" : "same";
              if (newDir !== oldDir) setSelectedType(null);
              setCurrentQty(newQty);
            }}
            className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>

        {/* Minimum Stock */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Min Stock *
          </label>
          <input
            name="minimumStock"
            type="number"
            required
            min="0"
            defaultValue={initialProduct?.minimumStock ?? ""}
            placeholder="5"
            className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Transaction Type — only shown when editing and quantity changed */}
      {initialProduct && qtyDirection !== "same" && (
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            {qtyDirection === "increase" ? "Reason for Stock Increase *" : "Reason for Stock Reduction"}
          </label>
          <p className="text-xs text-slate-500 mb-3">
            {qtyDirection === "increase"
              ? "Quantity increased — select the reason for adding stock:"
              : "Quantity decreased — item was sold to a customer:"}
          </p>
          <div className={`grid gap-3 ${qtyDirection === "increase" ? "grid-cols-3" : "grid-cols-1 max-w-xs"}`}>
            {([
              {
                value: "Restock",
                label: "Restock",
                description: "Add to available stock",
                showFor: "increase",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                ),
                selectedBg: "rgba(16,185,129,0.12)",
                selectedBorder: "rgba(16,185,129,0.5)",
                selectedText: "#10b981",
              },
              {
                value: "Return",
                label: "Return",
                description: "Customer return",
                showFor: "increase",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                ),
                selectedBg: "rgba(245,158,11,0.12)",
                selectedBorder: "rgba(245,158,11,0.5)",
                selectedText: "#f59e0b",
              },
              {
                value: "Damaged",
                label: "Damaged",
                description: "Unusable (no stock added)",
                showFor: "increase",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                ),
                selectedBg: "rgba(239,68,68,0.12)",
                selectedBorder: "rgba(239,68,68,0.5)",
                selectedText: "#ef4444",
              },
              {
                value: "Sold",
                label: "Sold",
                description: "Customer sale (logs revenue & profit)",
                showFor: "decrease",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                ),
                selectedBg: "rgba(59,130,246,0.12)",
                selectedBorder: "rgba(59,130,246,0.5)",
                selectedText: "#3b82f6",
              },
            ] as const)
              .filter(({ showFor }) => showFor === qtyDirection)
              .map(({ value, label, description, icon, selectedBg, selectedBorder, selectedText }) => {
                const isSelected = effectiveSelectedType === value;
                return (
                  <label
                    key={value}
                    onClick={() => setSelectedType(value)}
                    style={isSelected
                      ? { background: selectedBg, borderColor: selectedBorder, color: selectedText }
                      : {}}
                    className="relative flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-700/30 cursor-pointer transition-all select-none"
                  >
                    <input
                      type="radio"
                      name="transactionType"
                      value={value}
                      checked={isSelected}
                      onChange={() => setSelectedType(value)}
                      className="sr-only"
                    />
                    <span style={isSelected ? { color: selectedText } : { color: "#94a3b8" }} className="transition-colors">
                      {icon}
                    </span>
                    <span className="text-xs font-bold" style={isSelected ? { color: selectedText } : { color: "#cbd5e1" }}>
                      {label}
                    </span>
                    <span className="text-[10px]" style={{ color: "#64748b" }}>
                      {description}
                    </span>
                  </label>
                );
              })}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initialProduct?.description || ""}
          placeholder="Detailed description of the product..."
          className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            <>{initialProduct ? "Update Product" : "Add Product"}</>
          )}
        </button>
      </div>
    </form>
  );
}
