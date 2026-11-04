import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { useNotifications } from "../../context/NotificationContext";
import { catalogService } from "../../services/allServices";
import { Plus, Edit2, Trash2, FolderPlus, Wrench } from "lucide-react";

export const AdminCategories = () => {
  const { addToast } = useNotifications();
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState("CATEGORIES");
  const [isLoading, setIsLoading] = useState(true);

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catIcon, setCatIcon] = useState("Wrench");

  // Service Modal
  const [isSvcModalOpen, setIsSvcModalOpen] = useState(false);
  const [svcCatId, setSvcCatId] = useState("");
  const [svcName, setSvcName] = useState("");
  const [svcDesc, setSvcDesc] = useState("");
  const [svcPrice, setSvcPrice] = useState("");
  const [svcDuration, setSvcDuration] = useState(60);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catRes, svcRes] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getServices(),
      ]);
      const cats = catRes.data || [];
      setCategories(cats);
      setServices(svcRes.data || []);
      if (cats.length > 0) setSvcCatId(cats[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await catalogService.createCategory({
        name: catName,
        description: catDesc,
        icon: catIcon,
      });
      addToast("Category created successfully", "success");
      setIsCatModalOpen(false);
      setCatName("");
      setCatDesc("");
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create category", "error");
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await catalogService.createService({
        category_id: svcCatId,
        name: svcName,
        description: svcDesc,
        base_price: parseFloat(svcPrice),
        estimated_duration_minutes: parseInt(svcDuration) || 60,
      });
      addToast("Service created successfully", "success");
      setIsSvcModalOpen(false);
      setSvcName("");
      setSvcDesc("");
      setSvcPrice("");
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create service", "error");
    }
  };

  const catColumns = [
    {
      header: "Category Name",
      render: (row) => <span className="font-bold text-slate-900">{row.name}</span>,
    },
    {
      header: "Slug",
      accessor: "slug",
    },
    {
      header: "Description",
      accessor: "description",
    },
    {
      header: "Icon Name",
      accessor: "icon",
    },
  ];

  const svcColumns = [
    {
      header: "Service",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          <span className="text-xs text-slate-500">{row.category?.name}</span>
        </div>
      ),
    },
    {
      header: "Base Price",
      render: (row) => <span className="font-bold text-slate-900">₹{row.base_price}</span>,
    },
    {
      header: "Est Duration",
      render: (row) => `${row.estimated_duration_minutes} mins`,
    },
  ];

  return (
    <DashboardLayout
      title="Catalog Taxonomy & Services"
      subtitle="Define master service categories, standard platform pricing, and service offerings."
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsCatModalOpen(true)}>
            <FolderPlus className="w-4 h-4 mr-1" /> Add Category
          </Button>
          <Button variant="teal" size="sm" onClick={() => setIsSvcModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Standard Service
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex space-x-2 border-b border-slate-200 text-xs font-semibold pb-1">
          <button
            onClick={() => setActiveTab("CATEGORIES")}
            className={`px-4 py-2 rounded-t-xl transition ${
              activeTab === "CATEGORIES"
                ? "bg-white border-x border-t border-slate-200 text-teal-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("SERVICES")}
            className={`px-4 py-2 rounded-t-xl transition ${
              activeTab === "SERVICES"
                ? "bg-white border-x border-t border-slate-200 text-teal-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Standard Services ({services.length})
          </button>
        </div>

        {activeTab === "CATEGORIES" ? (
          <DataTable columns={catColumns} data={categories} isLoading={isLoading} />
        ) : (
          <DataTable columns={svcColumns} data={services} isLoading={isLoading} />
        )}

        {/* Add Category Modal */}
        <Modal
          isOpen={isCatModalOpen}
          onClose={() => setIsCatModalOpen(false)}
          title="Add New Category"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <Input
              label="Category Name *"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Solar Panel Services"
              required
            />
            <Input
              label="Lucide Icon Name"
              value={catIcon}
              onChange={(e) => setCatIcon(e.target.value)}
              placeholder="Zap, Wrench, Wind, Sparkles"
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Brief category summary..."
                className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsCatModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm">
                Create Category
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Service Modal */}
        <Modal
          isOpen={isSvcModalOpen}
          onClose={() => setIsSvcModalOpen(false)}
          title="Add Standard Service"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateService} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={svcCatId}
                onChange={(e) => setSvcCatId(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Service Name *"
              value={svcName}
              onChange={(e) => setSvcName(e.target.value)}
              placeholder="e.g. Inverter Installation"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Base Price (INR) *"
                type="number"
                value={svcPrice}
                onChange={(e) => setSvcPrice(e.target.value)}
                placeholder="499"
                required
              />
              <Input
                label="Est Duration (Mins)"
                type="number"
                value={svcDuration}
                onChange={(e) => setSvcDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description *
              </label>
              <textarea
                rows={3}
                required
                value={svcDesc}
                onChange={(e) => setSvcDesc(e.target.value)}
                placeholder="Detailed scope of service..."
                className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsSvcModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm">
                Create Service
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
