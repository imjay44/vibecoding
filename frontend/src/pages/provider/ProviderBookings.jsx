import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useNotifications } from "../../context/NotificationContext";
import { bookingService, providerService } from "../../services/allServices";

export const ProviderBookings = () => {
  const { addToast } = useNotifications();
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Assign modal
  const [assignBooking, setAssignBooking] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Detail Modal
  const [detailBooking, setDetailBooking] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookRes, techRes] = await Promise.all([
        bookingService.getBookings(),
        providerService.getMyTechnicians(),
      ]);
      setBookings(bookRes.data || []);
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
    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignBooking || !selectedTechId) return;
    setIsAssigning(true);
    try {
      await bookingService.assignTechnician(assignBooking.id, selectedTechId);
      addToast("Technician assigned!", "success");
      setAssignBooking(null);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to assign", "error");
    } finally {
      setIsAssigning(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === "PENDING") return b.status === "PENDING";
    if (activeTab === "ACTIVE") return ["CONFIRMED", "PROVIDER_ASSIGNED", "IN_PROGRESS"].includes(b.status);
    if (activeTab === "COMPLETED") return b.status === "COMPLETED";
    return true;
  });

  const columns = [
    {
      header: "Booking Ref",
      render: (row) => <span className="font-bold text-slate-900">{row.booking_reference}</span>,
    },
    {
      header: "Service & Notes",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.service?.name}</span>
          <span className="text-xs text-slate-500 italic line-clamp-1">"{row.problem_description}"</span>
        </div>
      ),
    },
    {
      header: "Customer Location",
      render: (row) => (
        <div className="text-xs">
          <span className="font-medium text-slate-900 block">{row.address?.title}</span>
          <span className="text-slate-500">{row.address?.city} ({row.address?.pincode})</span>
        </div>
      ),
    },
    {
      header: "Schedule",
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-900 block">{row.booking_date}</span>
          <span className="text-slate-500">{row.time_slot}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => setDetailBooking(row)}>
            Details
          </Button>
          {row.status === "CONFIRMED" && (
            <Button size="sm" variant="teal" onClick={() => setAssignBooking(row)}>
              Assign Tech
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Contractor Bookings Management"
      subtitle="Fulfill customer orders, monitor technician dispatches, and track completion."
    >
      <div className="space-y-6">
        <div className="flex space-x-2 border-b border-slate-200 text-xs font-semibold pb-1">
          {[
            { id: "ALL", label: `All (${bookings.length})` },
            { id: "PENDING", label: `Pending Triage (${bookings.filter((b) => b.status === "PENDING").length})` },
            { id: "ACTIVE", label: `In-Progress (${bookings.filter((b) => ["CONFIRMED", "PROVIDER_ASSIGNED", "IN_PROGRESS"].includes(b.status)).length})` },
            { id: "COMPLETED", label: `Completed (${bookings.filter((b) => b.status === "COMPLETED").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-xl transition ${
                activeTab === tab.id
                  ? "bg-white border-x border-t border-slate-200 text-teal-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyMessage="No bookings in this category."
        />

        {/* Details Modal */}
        {detailBooking && (
          <Modal
            isOpen={!!detailBooking}
            onClose={() => setDetailBooking(null)}
            title={`Booking #${detailBooking.booking_reference}`}
            maxWidth="max-w-xl"
          >
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Service</span>
                  <span className="font-bold text-slate-900">{detailBooking.service?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Scheduled Date</span>
                  <span className="font-bold text-slate-900">{detailBooking.booking_date} ({detailBooking.time_slot})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gross Amount</span>
                  <span className="font-bold text-slate-900">₹{detailBooking.final_amount}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <Badge status={detailBooking.status} size="sm" />
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Customer Delivery Address:</span>
                <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                  {detailBooking.address?.address_line1}, {detailBooking.address?.city} - {detailBooking.address?.pincode}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Customer Problem Description:</span>
                <p className="text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200">
                  "{detailBooking.problem_description}"
                </p>
              </div>
            </div>
          </Modal>
        )}

        {/* Assign Modal */}
        {assignBooking && (
          <Modal
            isOpen={!!assignBooking}
            onClose={() => setAssignBooking(null)}
            title="Dispatch Technician"
            maxWidth="max-w-md"
          >
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Technician *
                </label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  required
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user?.full_name} ({t.specialization || "General Specialist"})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setAssignBooking(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="sm" isLoading={isAssigning}>
                  Dispatch
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};
