import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="card-premium p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-white/10 rounded-md" />
          <div className="h-7 w-16 bg-white/15 rounded-md" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/10" />
      </div>
      <div className="h-3 w-32 bg-white/10 rounded-md pt-2" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="card-premium overflow-hidden">
      <div className="p-4 border-b border-white/5 flex gap-4">
        <div className="h-4 w-20 bg-white/10 rounded" />
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-4 w-24 bg-white/10 rounded" />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
            <div className="h-4 w-16 bg-white/10 rounded" />
            <div className="h-4 w-36 bg-white/15 rounded" />
            <div className="h-4 w-28 bg-white/10 rounded hidden sm:block" />
            <div className="h-4 w-20 bg-white/10 rounded" />
            <div className="h-7 w-16 bg-white/10 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
