import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { useNotifications } from "../../context/NotificationContext";
import { providerService } from "../../services/allServices";
import { UserPlus, Star, Briefcase, Mail, Phone, CheckCircle2 } from "lucide-react";

export const ProviderTechnicians = () => {
  const { addToast } = useNotifications();
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Onboard modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    specialization: "General Electrical & Maintenance",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTechnicians = async () => {
    setIsLoading(true);
    try {
      const res = await providerService.getMyTechnicians();
      setTechnicians(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const handleCreateTechnician = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.phone_number || !formData.password) {
      addToast("Please fill in all technician details", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await providerService.createTechnician(formData);
      addToast("Technician account created successfully!", "success");
      setIsModalOpen(false);
      setFormData({
        full_name: "",
        email: "",
        phone_number: "",
        password: "",
        specialization: "General Electrical & Maintenance",
      });
      loadTechnicians();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create technician account", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Technician",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.user?.full_name}</span>
          <span className="text-xs text-slate-500">{row.specialization || "Service Expert"}</span>
        </div>
      ),
    },
    {
      header: "Contact",
      render: (row) => (
        <div className="text-xs">
          <span className="text-slate-900 block">{row.user?.email}</span>
          <span className="text-slate-500">{row.user?.phone_number}</span>
        </div>
      ),
    },
    {
      header: "Jobs Completed",
      render: (row) => (
        <span className="font-bold text-slate-900">{row.total_jobs_completed} jobs</span>
      ),
    },
    {
      header: "Performance Rating",
      render: (row) => (
        <div className="flex items-center text-xs font-bold text-amber-700">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
          <span>{row.rating > 0 ? row.rating : "5.0"}</span>
        </div>
      ),
    },
    {
      header: "Workforce Status",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Active Duty
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Field Workforce Management"
      subtitle="Onboard, assign jobs, and monitor performance metrics for your technician team."
      actions={
        <Button variant="teal" size="sm" onClick={() => setIsModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1.5" /> Onboard Technician
        </Button>
      }
    >
      <div className="space-y-6">
        <DataTable
          columns={columns}
          data={technicians}
          isLoading={isLoading}
          emptyMessage="No technicians onboarded yet. Click 'Onboard Technician' to add your team members."
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Onboard Field Technician"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateTechnician} className="space-y-4">
            <Input
              label="Technician Full Name *"
              placeholder="Amit Verma"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />

            <Input
              label="Login Email Address *"
              type="email"
              placeholder="amit.tech@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Mobile Number *"
              type="tel"
              placeholder="+919876543210"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              required
            />

            <Input
              label="Temporary Password *"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Input
              label="Specialization / Skill Domain"
              placeholder="Master Electrician, AC Jet Cleaner, Plumber"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
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
              <Button type="submit" variant="teal" size="sm" isLoading={isSubmitting}>
                Create Account
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
