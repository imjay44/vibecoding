import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Badge } from "../../components/common/Badge";
import { useNotifications } from "../../context/NotificationContext";
import { feedbackService, bookingService } from "../../services/allServices";
import { ShieldAlert, Plus, MessageSquare } from "lucide-react";

export const CustomerComplaints = () => {
  const { addToast } = useNotifications();
  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // New ticket modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [compRes, bookRes] = await Promise.all([
        feedbackService.getComplaints(),
        bookingService.getBookings(),
      ]);
      setComplaints(compRes.data || []);
      const blist = bookRes.data || [];
      setBookings(blist);
      if (blist.length > 0) setSelectedBookingId(blist[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!selectedBookingId || !title || !description) {
      addToast("Please complete all required ticket fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.submitComplaint({
        booking_id: selectedBookingId,
        title,
        description,
      });
      addToast("Dispute ticket raised. An administrator has been assigned.", "success");
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to submit ticket", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Ticket Title",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.title}</span>
          <span className="text-xs text-slate-500 line-clamp-1">{row.description}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: "Admin Investigation Notes",
      render: (row) =>
        row.admin_notes ? (
          <span className="text-xs text-teal-700 bg-teal-50 px-2 py-1 rounded-md font-medium">
            {row.admin_notes}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Pending review</span>
        ),
    },
    {
      header: "Created",
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <DashboardLayout
      title="Dispute & Warranty Support"
      subtitle="Escalate quality issues or unresolved service matters directly to HomeServe platform managers."
      actions={
        <Button variant="teal" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Raise Dispute Ticket
        </Button>
      }
    >
      <div className="space-y-6">
        <DataTable
          columns={columns}
          data={complaints}
          isLoading={isLoading}
          emptyMessage="No open or resolved dispute tickets found."
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Raise Customer Dispute Ticket"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateComplaint} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Booking Reference *
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.booking_reference} - {b.service?.name} ({b.booking_date})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Issue Subject *"
              placeholder="E.g., AC cooling stopped after 2 days, or tap fitting loose"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what went wrong and your preferred resolution (e.g. rework inspection, refund)..."
                className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                isLoading={isSubmitting}
              >
                Submit Ticket
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
