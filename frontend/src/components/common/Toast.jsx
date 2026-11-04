import React from "react";
import { useNotifications } from "../../context/NotificationContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`flex items-start p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-200 transform translate-y-0 ${
              isSuccess
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
                : isError
                ? "bg-rose-50/95 border-rose-200 text-rose-900"
                : "bg-slate-900/95 border-slate-700 text-white"
            }`}
          >
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 text-sm font-medium pr-2">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
