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
import { createProduct, updateProduct, deleteProduct } from "../../app/dashboard/products/actions";

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

  // Debounce search URL update
  useEffect(() => {
    const handler = setTimeout(() => {
      updateUrlParams({ q: searchValue, page: "1" });
    }, 450);

    return () => clearTimeout(handler);
  }, [searchValue]);

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

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search products by name, SKU, or barcode..."
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
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {initialProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onEdit={setEditingProduct}
                onDelete={setDeletingProduct}
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
