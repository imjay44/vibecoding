import React from "react";

export const Skeleton = ({ className = "", count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
    <div className="flex items-center space-x-3">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-12 w-full" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  </div>
);
