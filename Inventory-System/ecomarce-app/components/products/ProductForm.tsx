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
}

export default function ProductForm({
  categories,
  suppliers,
  initialProduct,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [currentQty, setCurrentQty] = useState<number>(initialProduct?.quantity ?? 0);

  const originalQty = initialProduct?.quantity ?? 0;
  const qtyDirection = currentQty > originalQty ? "increase" : currentQty < originalQty ? "decrease" : "same";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    // ─── Client-side Validation ──────────────────────────────────────────────
    const name = (formData.get("name") as string)?.trim();
    const barcode = (formData.get("barcode") as string)?.trim();
    const sku = (formData.get("sku") as string)?.trim();
    const categoryId = formData.get("categoryId") as string;
    const supplierId = formData.get("supplierId") as string;
    
    const buyPrice = parseFloat(formData.get("buyPrice") as string);
    const sellPrice = parseFloat(formData.get("sellPrice") as string);
    const quantity = parseInt(formData.get("quantity") as string, 10);
    const minimumStock = parseInt(formData.get("minimumStock") as string, 10);
    const transactionType = formData.get("transactionType") as string;

    if (initialProduct && !transactionType) {
      setError("Please select a Transaction Type for this edit.");
      return;
    }

    if (!name) {
      setError("Product Name is required.");
      return;
    }
    if (!barcode) {
      setError("Barcode is required.");
      return;
    }
    if (!categoryId) {
      setError("Please select a Category.");
      return;
    }
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
    if (isNaN(quantity) || quantity < 0) {
      setError("Initial/Current Quantity must be 0 or a positive integer.");
      return;
    }
    if (isNaN(minimumStock) || minimumStock < 0) {
      setError("Minimum Stock must be 0 or a positive integer.");
      return;
    }

    // Alphanumeric checks for SKU and Barcode
    if (sku && !/^[a-zA-Z0-9_-]+$/.test(sku)) {
      setError("SKU can only contain alphanumeric characters, hyphens, and underscores.");
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(barcode)) {
      setError("Barcode can only contain alphanumeric characters.");
      return;
    }

    try {
      setIsPending(true);
      const res = await onSubmit(formData);
      if (!res.success) {
        setError(res.error || "An error occurred during submission.");
      }
    } catch (err: any) {
      console.error(err);
      setError("An unexpected network error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Hidden field for product ID if editing */}
      {initialProduct && (
        <input type="hidden" name="productId" value={initialProduct.id} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Product Name *
          </label>
          <input
            name="name"
            type="text"
            required
            defaultValue={initialProduct?.name || ""}
            placeholder="e.g. Wireless Mouse M330"
            className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>

        {/* Barcode */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Barcode / UPC *
          </label>
          <input
            name="barcode"
            type="text"
            required
            defaultValue={initialProduct?.barcode || ""}
            placeholder="e.g. 697018320491"
            className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SKU */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            SKU / Product Code
          </label>
          <input
            name="sku"
            type="text"
            defaultValue={initialProduct?.sku || ""}
            placeholder="e.g. TECH-MSE-330"
            className="w-full px-3.5 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>

        {/* Category */}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supplier */}
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

        {/* Image Uploader */}
        <div>
          <ProductImageUploader initialImageUrl={initialProduct?.imageUrl} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Purchase Price */}
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

        {/* Selling Price */}
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

        {/* Initial Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Quantity *
          </label>
          <input
            name="quantity"
            type="number"
            required
            min="0"
            defaultValue={initialProduct?.quantity ?? ""}
            placeholder="0"
            onChange={(e) => {
              if (!initialProduct) return;
              const newQty = parseInt(e.target.value, 10);
              if (!isNaN(newQty)) {
                const newDir = newQty > originalQty ? "increase" : newQty < originalQty ? "decrease" : "same";
                const oldDir = currentQty > originalQty ? "increase" : currentQty < originalQty ? "decrease" : "same";
                if (newDir !== oldDir) setSelectedType(null);
                setCurrentQty(newQty);
              }
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
            Transaction Type *
          </label>
          <p className="text-xs text-slate-500 mb-3">
            {qtyDirection === "increase"
              ? "Quantity increased — why was stock added?"
              : "Quantity decreased — why was stock reduced?"}
          </p>
          <div className={`grid gap-3 ${qtyDirection === "increase" ? "grid-cols-3" : "grid-cols-1 max-w-[9rem]"}`}>
            {([
              {
                value: "Restock",
                label: "Restock",
                description: "Add stock",
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
                description: "Write-off",
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
                description: "Item sold",
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
                const isSelected = selectedType === value;
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
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-350 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-850 hover:border-slate-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
