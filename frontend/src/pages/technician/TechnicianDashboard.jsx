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
import { technicianService } from "../../services/allServices";
import {
  Briefcase,
  Clock,
  Star,
  CheckCircle,
  MapPin,
  CheckCircle2,
  Navigation,
} from "lucide-react";

export const TechnicianDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Completion modal
  const [completeJobId, setCompleteJobId] = useState(null);
  const [completionRemarks, setCompletionRemarks] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const res = await technicianService.getAssignedJobs();
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const techProfile = user?.technician || {};
  const activeJobs = jobs.filter((j) =>
    ["PROVIDER_ASSIGNED", "IN_PROGRESS"].includes(j.status)
  );

  const handleAccept = async (id) => {
    try {
      await technicianService.acceptJob(id);
      addToast("Job accepted! Customer has been notified.", "success");
      loadJobs();
    } catch (err) {
      addToast("Failed to accept job", "error");
    }
  };

  const handleArrive = async (id) => {
    try {
      await technicianService.arriveJob(id);
      addToast("Arrival recorded! Work status changed to In-Progress.", "success");
      loadJobs();
    } catch (err) {
      addToast("Failed to mark arrival", "error");
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completeJobId) return;
    setIsCompleting(true);
    try {
      await technicianService.completeJob(completeJobId, completionRemarks);
      addToast("Job marked as COMPLETED! Great work.", "success");
      setCompleteJobId(null);
      setCompletionRemarks("");
      loadJobs();
    } catch (err) {
      addToast("Failed to complete job", "error");
    } finally {
      setIsCompleting(false);
    }
  };

  const columns = [
    {
      header: "Booking Ref",
      render: (row) => <span className="font-bold text-slate-900">{row.booking_reference}</span>,
    },
    {
      header: "Service",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.service?.name}</span>
          <span className="text-xs text-slate-500">{row.time_slot}</span>
        </div>
      ),
    },
    {
      header: "Customer Address",
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-900 block">{row.address?.title}</span>
          <span className="text-slate-500">{row.address?.address_line1}, {row.address?.city}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: "Job Action",
      render: (row) => (
        <div className="flex items-center space-x-2">
          {row.status === "PROVIDER_ASSIGNED" && (
            <>
              <Button size="sm" variant="outline" onClick={() => handleAccept(row.id)}>
                Accept
              </Button>
              <Button size="sm" variant="teal" onClick={() => handleArrive(row.id)}>
                Mark Arrived
              </Button>
            </>
          )}

          {row.status === "IN_PROGRESS" && (
            <Button size="sm" variant="primary" onClick={() => setCompleteJobId(row.id)}>
              Mark Completed
            </Button>
          )}

          {row.status === "COMPLETED" && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Finished
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title={`Technician Workspace: ${user?.full_name}`}
      subtitle="View dispatched job assignments, navigate to customer locations, and record work completion."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Jobs Assigned to You"
            value={jobs.length}
            icon={Briefcase}
            color="teal"
            subtitle={`${activeJobs.length} In-Progress or Pending`}
          />
          <StatCard
            title="Total Finished Jobs"
            value={techProfile.total_jobs_completed || 28}
            icon={CheckCircle}
            color="emerald"
            subtitle="Verified completed work"
          />
          <StatCard
            title="Customer Rating"
            value={`${techProfile.rating || "4.90"} ★`}
            icon={Star}
            color="orange"
            subtitle="Based on customer feedback"
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            Current Dispatched Assignments
          </h2>
          <DataTable
            columns={columns}
            data={jobs}
            isLoading={isLoading}
            emptyMessage="No job assignments currently scheduled for your account."
          />
        </div>

        {/* Completion Modal */}
        <Modal
          isOpen={!!completeJobId}
          onClose={() => setCompleteJobId(null)}
          title="Complete Job Service"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCompleteSubmit} className="space-y-4">
            <p className="text-xs text-slate-600">
              Please enter work completion remarks or notes before concluding this job.
            </p>
            <textarea
              rows={4}
              required
              value={completionRemarks}
              onChange={(e) => setCompletionRemarks(e.target.value)}
              placeholder="E.g., Replaced capacitor and cleaned motor coils. Ran cooling test for 15 minutes, temperature normalized."
              className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompleteJobId(null)}
                disabled={isCompleting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm" isLoading={isCompleting}>
                Confirm Completion
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
