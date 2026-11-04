import React from "react";
import { Loader2 } from "lucide-react";

export const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  onClick,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs sm:text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-sm",
    teal: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-600 shadow-sm",
    orange:
      "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-sm",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-300",
    outline:
      "border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400 bg-white",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
