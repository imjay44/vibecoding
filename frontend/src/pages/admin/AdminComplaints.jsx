import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useNotifications } from "../../context/NotificationContext";
import { feedbackService } from "../../services/allServices";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export const AdminComplaints = () => {
  const { addToast } = useNotifications();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [status, setStatus] = useState("RESOLVED");
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await feedbackService.getComplaints();
      setComplaints(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setIsUpdating(true);
    try {
      await feedbackService.updateComplaintStatus(selectedComplaint.id, {
        status,
        admin_notes: adminNotes,
      });
      addToast("Dispute ticket updated successfully", "success");
      setSelectedComplaint(null);
      loadComplaints();
    } catch (err) {
      addToast("Failed to update dispute", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const columns = [
    {
      header: "Dispute Title & Description",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.title}</span>
          <span className="text-xs text-slate-500 line-clamp-1 italic">"{row.description}"</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: "Admin Findings",
      render: (row) => row.admin_notes || <span className="text-slate-400 text-xs">Pending investigation</span>,
    },
    {
      header: "Filed Date",
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: "Action",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedComplaint(row);
            setStatus(row.status === "OPEN" ? "RESOLVED" : row.status);
            setAdminNotes(row.admin_notes || "");
          }}
        >
          Review Ticket
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Disputes & Warranty Claims"
      subtitle="Investigate customer complaints, inspect contractor rework requests, and record resolution notes."
    >
      <div className="space-y-6">
        <DataTable
          columns={columns}
          data={complaints}
          isLoading={isLoading}
          emptyMessage="No customer disputes currently logged."
        />

        {selectedComplaint && (
          <Modal
            isOpen={!!selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
            title={`Investigate Dispute: ${selectedComplaint.title}`}
            maxWidth="max-w-md"
          >
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Customer Claims:</span>
                <p className="text-slate-600 italic">"{selectedComplaint.description}"</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Resolution Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="OPEN">OPEN (Under investigation)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Contractor contacted)</option>
                  <option value="RESOLVED">RESOLVED (Complimentary rework / credit)</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Investigation & Resolution Notes *
                </label>
                <textarea
                  rows={4}
                  required
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record your findings, contractor explanation, and final settlement agreement..."
                  className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="sm" isLoading={isUpdating}>
                  Update Dispute
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};
