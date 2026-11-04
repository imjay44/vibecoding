import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatCard } from "../../components/dashboard/StatCard";
import { DataTable } from "../../components/dashboard/DataTable";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  bookingService,
  providerService,
} from "../../services/allServices";
import {
  CalendarCheck,
  DollarSign,
  Star,
  Users,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  UserPlus,
} from "lucide-react";

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reject Booking Modal
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Assign Technician Modal
  const [assignBooking, setAssignBooking] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const loadProviderData = async () => {
    setIsLoading(true);
    try {
      const [bookRes, earnRes, techRes] = await Promise.all([
        bookingService.getBookings(),
        providerService.getMyEarnings(),
        providerService.getMyTechnicians(),
      ]);
      setBookings(bookRes.data || []);
      setEarnings(earnRes.data || []);
      const techList = techRes.data || [];
      setTechnicians(techList);
      if (techList.length > 0) setSelectedTechId(techList[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviderData();
  }, []);

  const providerProfile = user?.provider || {};
  const isApproved = providerProfile.verification_status === "APPROVED";

  const totalIncoming = bookings.filter((b) => b.status === "PENDING").length;
  const activeJobs = bookings.filter((b) =>
    ["CONFIRMED", "PROVIDER_ASSIGNED", "IN_PROGRESS"].includes(b.status)
  ).length;

  const totalNetEarnings = earnings.reduce(
    (acc, curr) => acc + parseFloat(curr.net_earnings || 0),
    0
  );

  const handleAcceptBooking = async (id) => {
    try {
      await bookingService.acceptBooking(id);
      addToast("Booking request accepted!", "success");
      loadProviderData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to accept booking", "error");
    }
  };

  const handleRejectBooking = async () => {
    if (!rejectId) return;
    setIsRejecting(true);
    try {
      await bookingService.rejectBooking(rejectId, rejectReason || "Contractor unavailable at selected time");
      addToast("Booking request rejected", "success");
      setRejectId(null);
      setRejectReason("");
      loadProviderData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to reject booking", "error");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!assignBooking || !selectedTechId) return;
    setIsAssigning(true);
    try {
      await bookingService.assignTechnician(assignBooking.id, selectedTechId);
      addToast("Technician assigned and dispatched successfully!", "success");
      setAssignBooking(null);
      loadProviderData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to assign technician", "error");
    } finally {
      setIsAssigning(false);
    }
  };

  const columns = [
    {
      header: "Booking Ref",
      render: (row) => (
        <span className="font-bold text-slate-900">{row.booking_reference}</span>
      ),
    },
    {
      header: "Customer & Service",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {row.service?.name}
          </span>
          <span className="text-xs text-slate-500">
            Address: {row.address?.city} ({row.address?.pincode})
          </span>
        </div>
      ),
    },
    {
      header: "Scheduled",
      render: (row) => (
        <div className="text-xs">
          <span className="font-medium text-slate-900 block">{row.booking_date}</span>
          <span className="text-slate-500">{row.time_slot}</span>
        </div>
      ),
    },
    {
      header: "Net Earn (est)",
      render: (row) => {
        const net = (parseFloat(row.final_amount) * 0.9).toFixed(2);
        return <span className="font-bold text-emerald-700">₹{net}</span>;
      },
    },
    {
      header: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: "Triage Actions",
      render: (row) => (
        <div className="flex items-center space-x-2">
          {row.status === "PENDING" && (
            <>
              <Button
                size="sm"
                variant="teal"
                onClick={() => handleAcceptBooking(row.id)}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setRejectId(row.id)}
              >
                Reject
              </Button>
            </>
          )}

          {row.status === "CONFIRMED" && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setAssignBooking(row)}
            >
              Assign Technician
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title={`${providerProfile.business_name || "Service Contractor Portal"}`}
      subtitle="Manage incoming appointment requests, workforce dispatching, and earnings."
      actions={
        <Link to="/provider/technicians">
          <Button variant="teal" size="sm">
            <UserPlus className="w-4 h-4 mr-1.5" /> Onboard Technician
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Verification Status Alert Banner */}
        {!isApproved && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-xs text-amber-800">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">
                Account Status: Pending Verification
              </span>
              <p className="mt-0.5">
                Your business documentation is currently under review by our marketplace administration. Once approved, you can publish custom pricing and accept customer booking requests.
              </p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Incoming Requests"
            value={totalIncoming}
            icon={Clock}
            color="orange"
            subtitle="Requires accept/reject triage"
          />
          <StatCard
            title="Active Jobs"
            value={activeJobs}
            icon={CalendarCheck}
            color="teal"
            subtitle="Scheduled or In-Progress"
          />
          <StatCard
            title="Net Earnings"
            value={`₹${totalNetEarnings.toLocaleString()}`}
            icon={DollarSign}
            color="emerald"
            subtitle="After 10% platform commission"
          />
          <StatCard
            title="Average Rating"
            value={`${providerProfile.average_rating || "4.85"} ★`}
            icon={Star}
            color="blue"
            subtitle={`${providerProfile.total_reviews || 12} Verified Reviews`}
          />
        </div>

        {/* Incoming & Active Bookings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Booking Requests & Active Dispatches
            </h2>
            <Link
              to="/provider/bookings"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center"
            >
              <span>Manage All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <DataTable
            columns={columns}
            data={bookings.slice(0, 8)}
            isLoading={isLoading}
            emptyMessage="No pending booking requests at this time."
          />
        </div>

        {/* Reject Dialog */}
        <Modal
          isOpen={!!rejectId}
          onClose={() => setRejectId(null)}
          title="Decline Booking Request"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Please enter an explanation for declining this booking. The customer will be notified promptly.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g., All technicians fully booked for this time window, or outside current service boundary."
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectId(null)}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRejectBooking}
                isLoading={isRejecting}
              >
                Confirm Decline
              </Button>
            </div>
          </div>
        </Modal>

        {/* Assign Technician Modal */}
        <Modal
          isOpen={!!assignBooking}
          onClose={() => setAssignBooking(null)}
          title={`Dispatch Technician for #${assignBooking?.booking_reference}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAssignTechnician} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div><strong>Service:</strong> {assignBooking?.service?.name}</div>
              <div><strong>Date & Slot:</strong> {assignBooking?.booking_date} ({assignBooking?.time_slot})</div>
              <div><strong>Address:</strong> {assignBooking?.address?.address_line1}, {assignBooking?.address?.city}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Technician *
              </label>
              {technicians.length === 0 ? (
                <div className="p-3 bg-rose-50 text-xs text-rose-700 rounded-lg">
                  No technicians onboarded under your account yet. Please add a technician from the Technicians menu first.
                </div>
              ) : (
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  required
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user?.full_name} ({t.specialization || "General Maintenance"})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssignBooking(null)}
                disabled={isAssigning}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="teal"
                size="sm"
                disabled={technicians.length === 0}
                isLoading={isAssigning}
              >
                Dispatch Technician
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
