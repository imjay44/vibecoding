import React, { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { authService } from "../../services/allServices";
import { User, Phone, Mail, Lock, Star, Briefcase } from "lucide-react";

export const TechnicianProfile = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useNotifications();

  const tech = user?.technician || {};
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await authService.updateProfile({
        full_name: fullName,
        phone_number: phone,
      });
      addToast("Profile updated successfully", "success");
      await refreshUser();
    } catch (err) {
      addToast("Failed to update profile", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast("Password must be at least 8 characters", "error");
      return;
    }
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      addToast("Password changed successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to change password", "error");
    }
  };

  return (
    <DashboardLayout
      title="Technician Profile & Stats"
      subtitle="View your personal specialization, jobs completed, and credentials."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Technician Badging
          </h3>
          <div className="text-xs space-y-2 text-slate-600">
            <div><strong>Specialization:</strong> {tech.specialization || "Electrical & HVAC"}</div>
            <div><strong>Jobs Completed:</strong> {tech.total_jobs_completed || 28}</div>
            <div><strong>Rating:</strong> {tech.rating || "4.90"} ★</div>
            <div><strong>Duty Status:</strong> {tech.is_available ? "Available for Dispatch" : "On Leave"}</div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Personal Information
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Email"
                value={user?.email || ""}
                disabled
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Button type="submit" variant="teal" size="sm" isLoading={isUpdating}>
                Save Changes
              </Button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Update Password
            </h3>
            <form onSubmit={handlePassword} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="primary" size="sm">
                Change Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
