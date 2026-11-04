import React, { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { authService } from "../../services/allServices";
import { User, Mail, Phone, Lock, CheckCircle2 } from "lucide-react";

export const CustomerProfile = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useNotifications();

  // Profile Form
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await authService.updateProfile({
        full_name: fullName,
        phone_number: phoneNumber,
      });
      addToast("Profile details updated successfully", "success");
      await refreshUser();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast("New password must be at least 8 characters long", "error");
      return;
    }

    setIsChangingPassword(true);
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
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <DashboardLayout
      title="Profile & Security Settings"
      subtitle="Manage your personal contact information and authentication credentials."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Personal Information
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              icon={User}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              icon={Mail}
              value={user?.email || ""}
              disabled
              helperText="Email cannot be changed directly."
            />

            <Input
              label="Phone Number"
              icon={Phone}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="teal"
              size="sm"
              isLoading={isUpdatingProfile}
            >
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Change Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              icon={Lock}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password (min 8 chars)"
              type="password"
              icon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isChangingPassword}
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
