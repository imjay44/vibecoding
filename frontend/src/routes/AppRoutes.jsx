import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RoleProtectedRoute } from "./RoleProtectedRoute";

// Public Pages
import { HomePage } from "../pages/public/HomePage";
import { AllServicesPage } from "../pages/public/AllServicesPage";
import { ServiceDetailsPage } from "../pages/public/ServiceDetailsPage";
import { ProviderProfilePage } from "../pages/public/ProviderProfilePage";
import {
  AboutPage,
  HowItWorksPage,
  FaqPage,
  ContactPage,
  TermsPage,
  PrivacyPage,
} from "../pages/public/StaticPages";

// Auth Pages
import { LoginPage } from "../pages/auth/LoginPage";
import { CustomerRegisterPage } from "../pages/auth/CustomerRegisterPage";
import { ProviderRegisterPage } from "../pages/auth/ProviderRegisterPage";

// Customer Pages
import { CustomerDashboard } from "../pages/customer/CustomerDashboard";
import { CustomerBookings } from "../pages/customer/CustomerBookings";
import { CustomerAddresses } from "../pages/customer/CustomerAddresses";
import { CustomerInvoices } from "../pages/customer/CustomerInvoices";
import { CustomerFavorites } from "../pages/customer/CustomerFavorites";
import { CustomerComplaints } from "../pages/customer/CustomerComplaints";
import { CustomerProfile } from "../pages/customer/CustomerProfile";

// Provider Pages
import { ProviderDashboard } from "../pages/provider/ProviderDashboard";
import { ProviderServices } from "../pages/provider/ProviderServices";
import { ProviderBookings } from "../pages/provider/ProviderBookings";
import { ProviderTechnicians } from "../pages/provider/ProviderTechnicians";
import { ProviderAvailability } from "../pages/provider/ProviderAvailability";
import { ProviderEarnings } from "../pages/provider/ProviderEarnings";
import { ProviderProfile } from "../pages/provider/ProviderProfile";

// Technician Pages
import { TechnicianDashboard } from "../pages/technician/TechnicianDashboard";
import { TechnicianJobs } from "../pages/technician/TechnicianJobs";
import { TechnicianProfile } from "../pages/technician/TechnicianProfile";

// Admin Pages
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminUsers } from "../pages/admin/AdminUsers";
import { AdminProviders } from "../pages/admin/AdminProviders";
import { AdminBookings } from "../pages/admin/AdminBookings";
import { AdminCategories } from "../pages/admin/AdminCategories";
import { AdminComplaints } from "../pages/admin/AdminComplaints";
import { AdminCoupons } from "../pages/admin/AdminCoupons";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/services" element={<AllServicesPage />} />
      <Route path="/services/:id" element={<ServiceDetailsPage />} />
      <Route path="/providers/:id" element={<ProviderProfilePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<CustomerRegisterPage />} />
      <Route path="/register/customer" element={<CustomerRegisterPage />} />
      <Route path="/register/provider" element={<ProviderRegisterPage />} />
      <Route path="/forgot-password" element={<LoginPage />} />

      {/* Protected Customer Routes */}
      <Route element={<RoleProtectedRoute allowedRoles={["CUSTOMER"]} />}>
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/bookings" element={<CustomerBookings />} />
        <Route path="/customer/addresses" element={<CustomerAddresses />} />
        <Route path="/customer/invoices" element={<CustomerInvoices />} />
        <Route path="/customer/favorites" element={<CustomerFavorites />} />
        <Route path="/customer/complaints" element={<CustomerComplaints />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
      </Route>

      {/* Protected Service Provider Routes */}
      <Route element={<RoleProtectedRoute allowedRoles={["SERVICE_PROVIDER"]} />}>
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/provider/services" element={<ProviderServices />} />
        <Route path="/provider/bookings" element={<ProviderBookings />} />
        <Route path="/provider/technicians" element={<ProviderTechnicians />} />
        <Route path="/provider/availability" element={<ProviderAvailability />} />
        <Route path="/provider/earnings" element={<ProviderEarnings />} />
        <Route path="/provider/profile" element={<ProviderProfile />} />
      </Route>

      {/* Protected Technician Routes */}
      <Route element={<RoleProtectedRoute allowedRoles={["TECHNICIAN"]} />}>
        <Route path="/technician" element={<TechnicianDashboard />} />
        <Route path="/technician/jobs" element={<TechnicianJobs />} />
        <Route path="/technician/profile" element={<TechnicianProfile />} />
      </Route>

      {/* Protected Super Admin Routes */}
      <Route element={<RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/providers" element={<AdminProviders />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/complaints" element={<AdminComplaints />} />
        <Route path="/admin/coupons" element={<AdminCoupons />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
