import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useNotifications } from "../../context/NotificationContext";
import { adminService } from "../../services/allServices";
import { Search, UserX, UserCheck } from "lucide-react";

export const AdminUsers = () => {
  const { addToast } = useNotifications();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search.trim()) params.search = search.trim();
      const res = await adminService.getUsers(params);
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, search]);

  const handleToggleStatus = async (user) => {
    try {
      const res = await adminService.toggleUserStatus(user.id);
      addToast(res.message || "User status updated", "success");
      loadUsers();
    } catch (err) {
      addToast(err.response?.data?.message || "Action not allowed", "error");
    }
  };

  const columns = [
    {
      header: "User Name",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.full_name}</span>
          <span className="text-xs text-slate-500">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Mobile",
      accessor: "phone_number",
    },
    {
      header: "System Role",
      render: (row) => <Badge status={row.role} size="sm" />,
    },
    {
      header: "Account State",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.is_active
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {row.is_active ? "Active" : "Suspended"}
        </span>
      ),
    },
    {
      header: "Registered On",
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: "Governance Action",
      render: (row) => (
        <Button
          size="sm"
          variant={row.is_active ? "danger" : "teal"}
          onClick={() => handleToggleStatus(row)}
        >
          {row.is_active ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="User Directory & Permissions"
      subtitle="Comprehensive view of all customers, contractors, technicians, and platform administrators."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search user by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white"
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="SERVICE_PROVIDER">Service Providers</option>
            <option value="TECHNICIAN">Technicians</option>
            <option value="SUPER_ADMIN">Administrators</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="No users matching your filters."
        />
      </div>
    </DashboardLayout>
  );
};
