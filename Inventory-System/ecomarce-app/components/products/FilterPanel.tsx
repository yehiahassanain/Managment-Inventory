"use client";

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface FilterPanelProps {
  categories: Category[];
  suppliers: Supplier[];
  
  category: string;
  onCategoryChange: (val: string) => void;
  
  supplier: string;
  onSupplierChange: (val: string) => void;
  
  status: string;
  onStatusChange: (val: string) => void;
  
  sortBy: string;
  onSortByChange: (val: string) => void;
  
  onClearFilters: () => void;
}

export default function FilterPanel({
  categories,
  suppliers,
  category,
  onCategoryChange,
  supplier,
  onSupplierChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  onClearFilters,
}: FilterPanelProps) {
  const hasActiveFilters = category !== "" || supplier !== "" || status !== "";

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
        {/* Category Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Category
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Supplier Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Supplier
          </label>
          <div className="relative">
            <select
              value={supplier}
              onChange={(e) => onSupplierChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stock Status Filter */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Stock Status
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex sm:items-end gap-3 flex-col sm:flex-row mt-4 lg:mt-0">
        {/* Sort Dropdown */}
        <div className="min-w-[170px] flex-1 sm:flex-initial">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Sort By
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none"
            >
              <option value="name_asc">Name (A - Z)</option>
              <option value="name_desc">Name (Z - A)</option>
              <option value="quantity_asc">Quantity (Low - High)</option>
              <option value="quantity_desc">Quantity (High - Low)</option>
              <option value="buyPrice_asc">Purchase Price (Low - High)</option>
              <option value="buyPrice_desc">Purchase Price (High - Low)</option>
              <option value="sellPrice_asc">Selling Price (Low - High)</option>
              <option value="sellPrice_desc">Selling Price (High - Low)</option>
              <option value="created_desc">Created (Newest First)</option>
              <option value="created_asc">Created (Oldest First)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl transition-all self-end sm:self-auto cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
