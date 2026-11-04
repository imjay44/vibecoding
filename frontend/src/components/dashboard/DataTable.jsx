import React from "react";
import { EmptyState } from "../common/EmptyState";
import { Skeleton } from "../common/Skeleton";

export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = "No records to display",
  keyField = "id",
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
        <Skeleton className="h-6 w-full" count={5} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState description={emptyMessage} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-5 py-3.5 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((row, rIdx) => (
              <tr key={row[keyField] || rIdx} className="hover:bg-slate-50/80 transition-colors">
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-5 py-4 whitespace-nowrap text-slate-700">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
