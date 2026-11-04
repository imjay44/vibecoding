import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this action?",
  confirmText = "Confirm",
  confirmVariant = "danger",
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
