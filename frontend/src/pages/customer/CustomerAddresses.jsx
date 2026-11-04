import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/common/Button";
import { AddressModal } from "../../components/forms/AddressModal";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { CardSkeleton } from "../../components/common/Skeleton";
import { useNotifications } from "../../context/NotificationContext";
import { customerService } from "../../services/allServices";
import { MapPin, Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";

export const CustomerAddresses = () => {
  const { addToast } = useNotifications();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Delete Dialog
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await customerService.getAddresses();
      setAddresses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await customerService.deleteAddress(deleteId);
      addToast("Address removed successfully", "success");
      setDeleteId(null);
      loadAddresses();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to remove address", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout
      title="Saved Service Addresses"
      subtitle="Manage your home, office, and delivery locations for doorstep maintenance."
      actions={
        <Button
          variant="teal"
          size="sm"
          onClick={() => {
            setEditingAddress(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Address
        </Button>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : addresses.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No Saved Addresses"
            description="Add your residential or commercial addresses for seamless one-click booking."
            actionText="Add First Address"
            onAction={() => {
              setEditingAddress(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition flex flex-col justify-between ${
                  addr.is_default
                    ? "border-teal-500 ring-1 ring-teal-500/30"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
                      {addr.title}
                    </span>
                    {addr.is_default && (
                      <span className="inline-flex items-center text-xs font-bold text-teal-600">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Default
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {addr.address_line1}
                  </p>
                  {addr.address_line2 && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {addr.address_line2}
                    </p>
                  )}
                  {addr.landmark && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Landmark: {addr.landmark}
                    </p>
                  )}
                  <p className="text-xs font-medium text-slate-700 mt-2">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingAddress(addr);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => setDeleteId(addr.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AddressModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          address={editingAddress}
          onSaved={loadAddresses}
        />

        <ConfirmationDialog
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Remove Address"
          message="Are you sure you want to remove this address from your saved address book?"
          confirmText="Delete"
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
};
