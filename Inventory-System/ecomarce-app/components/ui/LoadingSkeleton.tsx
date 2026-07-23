"use client";

interface LoadingSkeletonProps {
  rows?: number;
}

export default function LoadingSkeleton({ rows = 5 }: LoadingSkeletonProps) {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Table skeleton */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/10">
        <div className="h-12 bg-slate-800/30 border-b border-slate-800" />
        <div className="divide-y divide-slate-800/50">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-slate-800/50 rounded-xl" />
                <div className="space-y-2 flex-1 max-w-[200px]">
                  <div className="h-4 bg-slate-800/60 rounded" />
                  <div className="h-3 bg-slate-800/30 rounded w-2/3" />
                </div>
              </div>
              <div className="h-4 bg-slate-800/40 rounded w-20 hidden md:block" />
              <div className="h-4 bg-slate-800/40 rounded w-16" />
              <div className="h-4 bg-slate-800/40 rounded w-16" />
              <div className="h-8 bg-slate-800/50 rounded-lg w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
