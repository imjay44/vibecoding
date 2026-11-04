import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { useNotifications } from "../../context/NotificationContext";
import { providerService, catalogService } from "../../services/allServices";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";

export const ProviderServices = () => {
  const { addToast } = useNotifications();
  const [providerServices, setProviderServices] = useState([]);
  const [catalogServices, setCatalogServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Offering Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [psRes, catRes] = await Promise.all([
        providerService.getMyServices(),
        catalogService.getServices(),
      ]);
      setProviderServices(psRes.data || []);
      const allSvc = catRes.data || [];
      setCatalogServices(allSvc);
      if (allSvc.length > 0) {
        setSelectedServiceId(allSvc[0].id);
        setCustomPrice(allSvc[0].base_price);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!selectedServiceId || !customPrice) return;
    setIsSubmitting(true);
    try {
      await providerService.addMyService({
        service_id: selectedServiceId,
        custom_price: parseFloat(customPrice),
        is_available: true,
      });
      addToast("Service rate configured successfully!", "success");
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to configure service", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await providerService.updateMyService(item.id, {
        is_available: !item.is_available,
      });
      addToast("Availability toggled", "success");
      loadData();
    } catch (err) {
      addToast("Failed to update status", "error");
    }
  };

  const columns = [
    {
      header: "Service Name",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {row.service?.name}
          </span>
          <span className="text-xs text-slate-500">
            Category: {row.service?.category?.name || "General"}
          </span>
        </div>
      ),
    },
    {
      header: "Catalog Base Rate",
      render: (row) => `₹${row.service?.base_price}`,
    },
    {
      header: "Your Custom Rate",
      render: (row) => (
        <span className="font-bold text-teal-700 text-sm">₹{row.custom_price}</span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <button
          onClick={() => handleToggleAvailability(row)}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${
            row.is_available
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {row.is_available ? "Active Offering" : "Paused"}
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="My Services & Custom Rates"
      subtitle="Configure which services from the global marketplace catalog your business fulfills."
      actions={
        <Button variant="teal" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Configure Service Rate
        </Button>
      }
    >
      <div className="space-y-6">
        <DataTable
          columns={columns}
          data={providerServices}
          isLoading={isLoading}
          emptyMessage="No services configured yet. Click 'Configure Service Rate' to offer services."
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Offer a Catalog Service"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddService} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Service from Marketplace *
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  setSelectedServiceId(e.target.value);
                  const found = catalogServices.find((s) => s.id === e.target.value);
                  if (found) setCustomPrice(found.base_price);
                }}
                className="w-full text-sm rounded-lg border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                {catalogServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Base: ₹{s.base_price})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Your Custom Rate (INR) *"
              type="number"
              min="1"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="e.g. 599"
              required
            />

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="teal"
                size="sm"
                isLoading={isSubmitting}
              >
                Save Offering
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
