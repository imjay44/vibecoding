import React from "react";

export const Badge = ({ status, text, size = "md", className = "" }) => {
  const normStatus = (status || "").toUpperCase();

  const styles = {
    // Booking statuses
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-sky-50 text-sky-700 border-sky-200",
    PROVIDER_ASSIGNED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    IN_PROGRESS: "bg-teal-50 text-teal-700 border-teal-200 animate-pulse",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
    REJECTED: "bg-slate-100 text-slate-700 border-slate-300",

    // Payment statuses
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    FAILED: "bg-rose-50 text-rose-700 border-rose-200",
    REFUNDED: "bg-purple-50 text-purple-700 border-purple-200",

    // Verification
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    SUSPENDED: "bg-rose-50 text-rose-700 border-rose-200",

    // Roles
    SUPER_ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
    SERVICE_PROVIDER: "bg-blue-50 text-blue-700 border-blue-200",
    TECHNICIAN: "bg-cyan-50 text-cyan-700 border-cyan-200",
    CUSTOMER: "bg-emerald-50 text-emerald-700 border-emerald-200",

    // Complaint
    OPEN: "bg-rose-50 text-rose-700 border-rose-200",
    UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const badgeStyle = styles[normStatus] || "bg-slate-100 text-slate-700 border-slate-200";

  const sizeStyle =
    size === "sm"
      ? "px-2 py-0.5 text-[11px]"
      : "px-2.5 py-1 text-xs font-medium";

  const displayText =
    text ||
    normStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center rounded-full border ${badgeStyle} ${sizeStyle} font-semibold ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {displayText}
    </span>
  );
};
