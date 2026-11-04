import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { technicianService } from "../../services/allServices";
import { MapPin, CheckCircle2 } from "lucide-react";

export const TechnicianJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await technicianService.getAssignedJobs();
        setJobs(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

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
      header: "Date & Window",
      render: (row) => `${row.booking_date} (${row.time_slot})`,
    },
    {
      header: "Service Location",
      render: (row) => `${row.address?.address_line1}, ${row.address?.city}`,
    },
    {
      header: "Status",
      render: (row) => <Badge status={row.status} />,
    },
  ];

  return (
    <DashboardLayout
      title="Assigned Jobs History"
      subtitle="Complete chronological history of all service dispatches assigned to you."
    >
      <div className="space-y-6">
        <DataTable
          columns={columns}
          data={jobs}
          isLoading={isLoading}
          emptyMessage="No assigned jobs found."
        />
      </div>
    </DashboardLayout>
  );
};
