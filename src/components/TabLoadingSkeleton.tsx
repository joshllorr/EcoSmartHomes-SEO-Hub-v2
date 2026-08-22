import React from 'react';

export default function TabLoadingSkeleton({
  title = 'Loading Workspace...',
}: {
  title?: string;
}) {
  return (
    <div className="w-full h-full flex flex-col gap-6 animate-pulse p-2 sm:p-4 text-left">
      {/* Top Banner Skeleton */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2.5">
          <div className="h-3 w-28 bg-emerald-500/20 rounded-md" />
          <div className="h-6 w-64 bg-white/10 rounded-lg" />
          <div className="h-3.5 w-96 max-w-full bg-white/5 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-white/10 rounded-xl" />
      </div>

      {/* Metric Cards Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-white/10 rounded" />
              <div className="h-4 w-4 bg-white/10 rounded" />
            </div>
            <div className="h-8 w-28 bg-white/15 rounded-lg" />
            <div className="h-3 w-36 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Body Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 min-h-[300px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="h-6 w-20 bg-white/10 rounded-full" />
          </div>
          <div className="space-y-3 pt-2">
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-5/6 bg-white/5 rounded" />
            <div className="h-4 w-4/6 bg-white/5 rounded" />
            <div className="h-32 w-full bg-white/5 rounded-xl mt-4" />
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 min-h-[300px]">
          <div className="h-4 w-36 bg-white/10 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="p-3 rounded-lg bg-black/20 space-y-2">
                <div className="h-3 w-3/4 bg-white/10 rounded" />
                <div className="h-2.5 w-1/2 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
