"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <nav aria-label="Pagination" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-6 border-t border-slate-800/60">
      <div className="text-xs text-slate-500" aria-live="polite" aria-atomic="true">
        Showing <span className="font-semibold text-slate-300">{startIdx}</span> to{" "}
        <span className="font-semibold text-slate-300">{endIdx}</span> of{" "}
        <span className="font-semibold text-slate-300">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex items-center justify-center p-2 rounded-lg bg-slate-800/40 hover:bg-slate-700/40 text-slate-400 hover:text-slate-200 border border-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
            className={`w-9 h-9 rounded-lg text-sm font-medium border transition-all ${
              currentPage === page
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-800/20 hover:bg-slate-800/60 border-slate-750 text-slate-400 hover:text-slate-200"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="flex items-center justify-center p-2 rounded-lg bg-slate-800/40 hover:bg-slate-700/40 text-slate-400 hover:text-slate-200 border border-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
