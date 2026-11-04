import React from "react";

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp = true,
  color = "teal",
}) => {
  const colorMap = {
    teal: "text-teal-600 bg-teal-50 border-teal-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };

  const badgeColor = colorMap[color] || colorMap.teal;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${badgeColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </h3>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center space-x-1.5 text-xs">
            {trend && (
              <span
                className={`font-semibold ${
                  trendUp ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {trend}
              </span>
            )}
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
