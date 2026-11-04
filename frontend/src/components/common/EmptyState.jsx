import React from "react";
import { Inbox } from "lucide-react";
import { Button } from "./Button";

export const EmptyState = ({
  icon: Icon = Inbox,
  title = "No records found",
  description = "There is currently no data to display here.",
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="teal" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
