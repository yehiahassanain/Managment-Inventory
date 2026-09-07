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

  // Build the visible page numbers: always show first, last, current, and neighbours.
  // On very small viewports we render all but hide some via CSS; for large page
  // counts we compute a sensible window.
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [];
    const addPage = (p: number) => {
      if (!pages.includes(p)) pages.push(p);
    };
    addPage(1);
    if (currentPage > 3) pages.push("...");
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
      addPage(p);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    addPage(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav aria-label="Pagination" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-6 border-t border-slate-800/60">
      <div className="text-xs text-slate-500" aria-live="polite" aria-atomic="true">
        Showing <span className="font-semibold text-slate-300">{startIdx}</span> to{" "}
        <span className="font-semibold text-slate-300">{endIdx}</span> of{" "}
        <span className="font-semibold text-slate-300">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-1 self-end sm:self-auto flex-wrap">
        {/* Previous */}
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

        {pageNumbers.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-600 text-sm select-none">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
              className={`w-9 h-9 rounded-lg text-sm font-medium border transition-all ${
                currentPage === page
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-800/20 hover:bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
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
