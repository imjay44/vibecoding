import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatCard } from "../../components/dashboard/StatCard";
import { DataTable } from "../../components/dashboard/DataTable";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { bookingService, customerService } from "../../services/allServices";
import {
  CalendarCheck,
  Clock,
  MapPin,
  CreditCard,
  Plus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [bookRes, addrRes] = await Promise.all([
          bookingService.getBookings(),
          customerService.getAddresses(),
        ]);
        setBookings(bookRes.data || []);
        setAddresses(addrRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) =>
    ["PENDING", "CONFIRMED", "PROVIDER_ASSIGNED", "IN_PROGRESS"].includes(b.status)
  ).length;
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
  const totalSpent = bookings
    .filter((b) => b.payment_status === "PAID")
    .reduce((acc, curr) => acc + parseFloat(curr.final_amount || 0), 0);

  const columns = [
    {
      header: "Booking Ref",
      accessor: "booking_reference",
      render: (row) => (
        <span className="font-bold text-slate-900">{row.booking_reference}</span>
      ),
    },
    {
      header: "Service",
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">
            {row.service?.name || "Service"}
          </span>
          <span className="text-xs text-slate-500">
            {row.provider?.business_name}
          </span>
        </div>
      ),
    },
    {
      header: "Schedule",
      render: (row) => (
        <div className="text-xs">
          <span className="font-medium text-slate-900 block">{row.booking_date}</span>
          <span className="text-slate-500">{row.time_slot}</span>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-bold text-slate-900">₹{row.final_amount}</span>
      ),
    },
    {
      header: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: "Payment",
      render: (row) => <Badge status={row.payment_status} size="sm" />,
    },
    {
      header: "Action",
      render: (row) => (
        <Link to={`/customer/bookings?id=${row.id}`}>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout
      title={`Hello, ${user?.full_name?.split(" ")[0] || "Customer"}`}
      subtitle="Welcome to your personal HomeServe maintenance dashboard."
      actions={
        <Link to="/services">
          <Button variant="teal" size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Book a Service
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Bookings"
            value={totalBookings}
            icon={CalendarCheck}
            color="teal"
            subtitle={`${completedBookings} Completed`}
          />
          <StatCard
            title="Active / Scheduled"
            value={activeBookings}
            icon={Clock}
            color="orange"
            subtitle="In fulfillment pipeline"
          />
          <StatCard
            title="Saved Addresses"
            value={addresses.length}
            icon={MapPin}
            color="blue"
            subtitle="Home & Office delivery"
          />
          <StatCard
            title="Total Expenditure"
            value={`₹${totalSpent.toLocaleString()}`}
            icon={CreditCard}
            color="emerald"
            subtitle="Settled via Razorpay"
          />
        </div>

        {/* Recent Bookings Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Recent Service Appointments
            </h2>
            <Link
              to="/customer/bookings"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center"
            >
              <span>View All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <DataTable
            columns={columns}
            data={bookings.slice(0, 5)}
            isLoading={isLoading}
            emptyMessage="You have not created any service bookings yet. Explore our verified home service catalog to get started!"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};
