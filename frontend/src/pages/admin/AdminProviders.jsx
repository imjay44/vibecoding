import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useNotifications } from "../../context/NotificationContext";
import { adminService } from "../../services/allServices";
import { ShieldCheck, CheckCircle2, XCircle, FileText, Briefcase } from "lucide-react";

export const AdminProviders = () => {
  const { addToast } = useNotifications();
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reject Modal
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getPendingProviders();
      setProviders(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminService.verifyProvider(id, { action: "APPROVE" });
      addToast("Provider approved successfully! Notification dispatched.", "success");
      loadProviders();
    } catch (e) {
      addToast("Failed to approve provider", "error");
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectId) return;
    setIsRejecting(true);
    try {
      await adminService.verifyProvider(rejectId, {
        action: "REJECT",
        rejection_reason: rejectReason || "Business credentials could not be verified.",
      });
      addToast("Provider application rejected", "success");
      setRejectId(null);
      setRejectReason("");
      loadProviders();
    } catch (e) {
      addToast("Failed to reject provider", "error");
    } finally {
      setIsRejecting(false);
    }
  };

  const columns = [
    {
      header: "Business Name",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.business_name}</span>
          <span className="text-xs text-slate-500">Representative: {row.user?.full_name}</span>
        </div>
      ),
    },
    {
      header: "Contact",
      render: (row) => (
        <div className="text-xs">
          <span className="text-slate-900 block">{row.user?.email}</span>
          <span className="text-slate-500">{row.user?.phone_number}</span>
        </div>
      ),
    },
    {
      header: "Experience & Address",
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-900 block">{row.years_of_experience} Years Exp</span>
          <span className="text-slate-500 line-clamp-1">{row.business_address}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => <Badge status={row.verification_status} />,
    },
    {
      header: "Verification Actions",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="teal" onClick={() => handleApprove(row.id)}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
          </Button>
          <Button size="sm" variant="danger" onClick={() => setRejectId(row.id)}>
            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Contractor Partner Accreditation"
      subtitle="Verify submitted trade licenses, identity proofs, and approve new contractor applications."
    >
      <div className="space-y-6">
        <DataTable
          columns={columns}
          data={providers}
          isLoading={isLoading}
          emptyMessage="No contractor applications currently pending review."
        />

        {/* Reject Dialog */}
        <Modal
          isOpen={!!rejectId}
          onClose={() => setRejectId(null)}
          title="Reject Contractor Application"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Provide an audit explanation for this rejection. The contractor will receive this in their notification feed.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g., Incomplete trade license, invalid GST registration, or mismatching identity documents."
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
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
                onClick={handleRejectConfirm}
                isLoading={isRejecting}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
