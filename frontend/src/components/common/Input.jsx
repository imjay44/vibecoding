import React, { forwardRef } from "react";

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = "text",
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`block w-full rounded-lg border text-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
              Icon ? "pl-10" : "pl-3.5"
            } pr-3.5 py-2.5 ${
              error
                ? "border-rose-300 text-rose-900 placeholder-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20"
                : "border-slate-300 text-slate-900 placeholder-slate-400 bg-white"
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
