import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { bookingService } from "../../services/allServices";
import { Search } from "lucide-react";

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await bookingService.getBookings(params);
      let list = res.data || [];
      if (search.trim()) {
        const s = search.toLowerCase();
        list = list.filter(
          (b) =>
            b.booking_reference.toLowerCase().includes(s) ||
            b.service?.name?.toLowerCase().includes(s)
        );
      }
      setBookings(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter, search]);

  const columns = [
    {
      header: "Booking Ref",
      render: (row) => <span className="font-bold text-slate-900">{row.booking_reference}</span>,
    },
    {
      header: "Service",
      render: (row) => row.service?.name,
    },
    {
      header: "Provider",
      render: (row) => row.provider?.business_name,
    },
    {
      header: "Date & Window",
      render: (row) => `${row.booking_date} (${row.time_slot})`,
    },
    {
      header: "Gross Amount",
      render: (row) => <span className="font-bold text-slate-900">₹{row.final_amount}</span>,
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
        <Button size="sm" variant="outline" onClick={() => setSelectedBooking(row)}>
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Master Bookings Ledger"
      subtitle="Complete platform transaction oversight with dispute intervention capabilities."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by booking reference or service name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Triage</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROVIDER_ASSIGNED">Provider Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={bookings}
          isLoading={isLoading}
          emptyMessage="No bookings matching selected criteria."
        />

        {selectedBooking && (
          <Modal
            isOpen={!!selectedBooking}
            onClose={() => setSelectedBooking(null)}
            title={`Booking #${selectedBooking.booking_reference}`}
            maxWidth="max-w-xl"
          >
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Service</span>
                  <span className="font-bold text-slate-900">{selectedBooking.service?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Scheduled Date</span>
                  <span className="font-bold text-slate-900">{selectedBooking.booking_date} ({selectedBooking.time_slot})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Provider Business</span>
                  <span className="font-bold text-slate-900">{selectedBooking.provider?.business_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Final Amount</span>
                  <span className="font-bold text-slate-900">₹{selectedBooking.final_amount}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Customer Address:</span>
                <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                  {selectedBooking.address?.address_line1}, {selectedBooking.address?.city} - {selectedBooking.address?.pincode}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Customer Remarks:</span>
                <p className="text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200">
                  "{selectedBooking.problem_description}"
                </p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};
