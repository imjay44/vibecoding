import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  FileText,
  Heart,
  AlertCircle,
  User,
  Wrench,
  Users,
  Clock,
  DollarSign,
  Briefcase,
  ShieldAlert,
  Tag,
  CheckCircle,
} from "lucide-react";

export const Sidebar = ({ onClose }) => {
  const { role } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case "CUSTOMER":
        return [
          { name: "Dashboard Overview", path: "/customer", icon: LayoutDashboard },
          { name: "My Bookings", path: "/customer/bookings", icon: CalendarCheck },
          { name: "Saved Addresses", path: "/customer/addresses", icon: MapPin },
          { name: "Invoices & Receipts", path: "/customer/invoices", icon: FileText },
          { name: "Saved Favorites", path: "/customer/favorites", icon: Heart },
          { name: "Dispute Tickets", path: "/customer/complaints", icon: AlertCircle },
          { name: "Profile Settings", path: "/customer/profile", icon: User },
        ];
      case "SERVICE_PROVIDER":
        return [
          { name: "Overview & Metrics", path: "/provider", icon: LayoutDashboard },
          { name: "My Services & Rates", path: "/provider/services", icon: Wrench },
          { name: "Bookings Management", path: "/provider/bookings", icon: CalendarCheck },
          { name: "Technician Workforce", path: "/provider/technicians", icon: Users },
          { name: "Schedule & Availability", path: "/provider/availability", icon: Clock },
          { name: "Earnings & Ledger", path: "/provider/earnings", icon: DollarSign },
          { name: "Business Verification", path: "/provider/profile", icon: CheckCircle },
        ];
      case "TECHNICIAN":
        return [
          { name: "Work Dashboard", path: "/technician", icon: LayoutDashboard },
          { name: "Assigned Jobs", path: "/technician/jobs", icon: Briefcase },
          { name: "My Profile", path: "/technician/profile", icon: User },
        ];
      case "SUPER_ADMIN":
        return [
          { name: "Platform KPI Overview", path: "/admin", icon: LayoutDashboard },
          { name: "User Directory", path: "/admin/users", icon: Users },
          { name: "Provider Verification", path: "/admin/providers", icon: CheckCircle },
          { name: "All Bookings", path: "/admin/bookings", icon: CalendarCheck },
          { name: "Service Categories", path: "/admin/categories", icon: Wrench },
          { name: "Disputes & Complaints", path: "/admin/complaints", icon: ShieldAlert },
          { name: "Coupons & Discounts", path: "/admin/coupons", icon: Tag },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col p-4">
      <div className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/customer" || link.path === "/provider" || link.path === "/technician" || link.path === "/admin"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
