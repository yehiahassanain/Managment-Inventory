"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "../ui/SearchBar";
import FilterPanel from "./FilterPanel";
import ProductTable from "./ProductTable";
import ProductCard from "./ProductCard";
import Pagination from "../ui/Pagination";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import EmptyState from "../ui/EmptyState";
import ProductForm from "./ProductForm";
import { createProduct, updateProduct, deleteProduct, StockAlertItem } from "../../app/dashboard/products/actions";

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface ProductsClientPageProps {
  initialProducts: any[];
  categories: Category[];
  suppliers: Supplier[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  isAdmin: boolean;
  stockAlerts?: {
    lowStockProducts: StockAlertItem[];
    outOfStockProducts: StockAlertItem[];
  };
}

export default function ProductsClientPage({
  initialProducts,
  categories,
  suppliers,
  totalPages,
  totalItems,
  currentPage,
  itemsPerPage,
  isAdmin,
  stockAlerts = { lowStockProducts: [], outOfStockProducts: [] },
}: ProductsClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search input state (with local state for fast typing, then synced to URL)
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false);

  const updateUrlParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(newParams)) {
      if (value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    // If not explicitly setting a page, reset to page 1 on filter changes
    if (!newParams.page && params.get("page")) {
      params.set("page", "1");
    }
    router.push(`/dashboard/products?${params.toString()}`);
  };

  // Debounce search URL update
  useEffect(() => {
    const handler = setTimeout(() => {
      updateUrlParams({ q: searchValue, page: "1" });
    }, 450);

    return () => clearTimeout(handler);
  }, [searchValue]);

  const handleClearFilters = () => {
    setSearchValue("");
    router.push("/dashboard/products");
  };

  const handleCreateSubmit = async (formData: FormData) => {
    const res = await createProduct(formData);
    if (res.success) {
      setIsAddOpen(false);
    }
    return res;
  };

  const handleUpdateSubmit = async (formData: FormData) => {
    const res = await updateProduct(formData);
    if (res.success) {
      setEditingProduct(null);
    }
    return res;
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeletePending(true);
    const res = await deleteProduct(deletingProduct.id);
    setIsDeletePending(false);
    if (res.success) {
      setDeletingProduct(null);
    } else {
      alert(res.error || "Failed to delete product");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Products Catalog
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Display, filter, search, and manage products and inventory values.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        )}
      </div>

      {/* ── Low Stock & Out of Stock Alert Sections ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Alerts */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-amber-500/25 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h2 className="text-sm font-bold text-white tracking-tight">Low Stock Alerts</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  {stockAlerts.lowStockProducts.length} items
                </span>
                {stockAlerts.lowStockProducts.length > 0 && (
                  <button
                    onClick={() => updateUrlParams({ status: "low_stock" })}
                    className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Filter list
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {stockAlerts.lowStockProducts.length === 0 ? (
                <div className="flex items-center justify-center py-6 gap-2 text-center text-xs text-slate-500 font-medium">
                  <span className="text-lg">✅</span> All products are well-stocked above minimum thresholds
                </div>
              ) : (
                stockAlerts.lowStockProducts.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/25 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">{p.name}</p>
                        <p className="text-[10px] text-slate-500">{p.categoryName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-amber-400">{p.quantity} left</p>
                      <p className="text-[10px] text-slate-500 font-mono">min: {p.minimumStock}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {stockAlerts.lowStockProducts.length > 5 && (
            <button
              onClick={() => updateUrlParams({ status: "low_stock" })}
              className="mt-3 text-[11px] font-semibold text-center text-amber-400/90 hover:text-amber-300 transition-colors w-full pt-2 border-t border-amber-500/10 cursor-pointer"
            >
              + {stockAlerts.lowStockProducts.length - 5} more low stock items — Click to view all
            </button>
          )}
        </div>

        {/* Out of Stock */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-rose-500/25 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                <h2 className="text-sm font-bold text-white tracking-tight">Out of Stock</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                  {stockAlerts.outOfStockProducts.length} items
                </span>
                {stockAlerts.outOfStockProducts.length > 0 && (
                  <button
                    onClick={() => updateUrlParams({ status: "out_of_stock" })}
                    className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Filter list
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {stockAlerts.outOfStockProducts.length === 0 ? (
                <div className="flex items-center justify-center py-6 gap-2 text-center text-xs text-slate-500 font-medium">
                  <span className="text-lg">🎉</span> No out-of-stock items in inventory
                </div>
              ) : (
                stockAlerts.outOfStockProducts.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/25 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">{p.name}</p>
                        <p className="text-[10px] text-slate-500">{p.categoryName}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full shrink-0">
                      0 left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          {stockAlerts.outOfStockProducts.length > 5 && (
            <button
              onClick={() => updateUrlParams({ status: "out_of_stock" })}
              className="mt-3 text-[11px] font-semibold text-center text-rose-400/90 hover:text-rose-300 transition-colors w-full pt-2 border-t border-rose-500/10 cursor-pointer"
            >
              + {stockAlerts.outOfStockProducts.length - 5} more out of stock items — Click to view all
            </button>
          )}
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search products by name or SKU..."
        />

        <div className="flex items-center bg-slate-900/65 border border-slate-800 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "table"
                ? "bg-slate-800 text-indigo-400 shadow-sm"
                : "text-slate-550 hover:text-slate-300"
            }`}
            title="List View"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-slate-800 text-indigo-400 shadow-sm"
                : "text-slate-550 hover:text-slate-300"
            }`}
            title="Grid View"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        categories={categories}
        suppliers={suppliers}
        category={searchParams.get("category") || ""}
        onCategoryChange={(val) => updateUrlParams({ category: val })}
        supplier={searchParams.get("supplier") || ""}
        onSupplierChange={(val) => updateUrlParams({ supplier: val })}
        status={searchParams.get("status") || ""}
        onStatusChange={(val) => updateUrlParams({ status: val })}
        sortBy={searchParams.get("sortBy") || "name_asc"}
        onSortByChange={(val) => updateUrlParams({ sortBy: val })}
        onClearFilters={handleClearFilters}
        isAdmin={isAdmin}
      />

      {/* Products Display Container */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl min-h-[300px] flex flex-col justify-between">
        {initialProducts.length === 0 ? (
          <EmptyState
            title="No Products Found"
            description={
              searchValue || searchParams.get("category") || searchParams.get("supplier") || searchParams.get("status")
                ? "We couldn't find any products matching your current filters. Try modifying your search or filters."
                : "Your inventory catalog is currently empty. Get started by adding your first product record."
            }
            action={
              (searchValue || searchParams.get("category") || searchParams.get("supplier") || searchParams.get("status")) ? (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Reset Filters
                </button>
              ) : isAdmin ? (
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white border border-indigo-500/30 rounded-xl text-sm font-semibold transition-all shadow-md"
                >
                  Create Product
                </button>
              ) : null
            }
          />
        ) : viewMode === "table" ? (
          <ProductTable
            products={initialProducts}
            onEdit={setEditingProduct}
            onDelete={setDeletingProduct}
            isAdmin={isAdmin}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {initialProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onEdit={setEditingProduct}
                onDelete={setDeletingProduct}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => updateUrlParams({ page: page.toString() })}
        />
      </div>

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#06080f]/80 backdrop-blur-sm"
            onClick={() => setIsAddOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-extrabold text-white mb-4">Add New Product</h2>
            <ProductForm
              categories={categories}
              suppliers={suppliers}
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsAddOpen(false)}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#06080f]/80 backdrop-blur-sm"
            onClick={() => setEditingProduct(null)}
          />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-extrabold text-white mb-4">Edit Product Info</h2>
            <ProductForm
              categories={categories}
              suppliers={suppliers}
              initialProduct={{
                id: editingProduct.id,
                name: editingProduct.name,
                sku: editingProduct.sku,
                barcode: editingProduct.barcode,
                imageUrl: editingProduct.imageUrl,
                description: editingProduct.description,
                minimumStock: editingProduct.minimumStock,
                categoryId: editingProduct.categoryId,
                supplierId: editingProduct.supplierId,
                buyPrice: editingProduct.inventory?.buyPrice ?? 0,
                sellPrice: editingProduct.inventory?.sellPrice ?? 0,
                quantity: editingProduct.inventory?.quantity ?? 0,
              }}
              onSubmit={handleUpdateSubmit}
              onCancel={() => setEditingProduct(null)}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deletingProduct !== null}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        isPending={isDeletePending}
        title="Delete Product?"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? All inventory values and transaction logs linked to this product will be permanently deleted.`}
      />
    </div>
  );
}
