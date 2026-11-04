import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { StatCard } from "../../components/dashboard/StatCard";
import { Badge } from "../../components/common/Badge";
import { providerService } from "../../services/allServices";
import { DollarSign, Percent, TrendingUp, CheckCircle } from "lucide-react";

export const ProviderEarnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        const res = await providerService.getMyEarnings();
        setEarnings(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadEarnings();
  }, []);

  const totalGross = earnings.reduce((acc, curr) => acc + parseFloat(curr.gross_amount || 0), 0);
  const totalCommission = earnings.reduce((acc, curr) => acc + parseFloat(curr.platform_commission || 0), 0);
  const totalNet = earnings.reduce((acc, curr) => acc + parseFloat(curr.net_earnings || 0), 0);

  const columns = [
    {
      header: "Booking Settled",
      render: (row) => <span className="font-bold text-slate-900">HS-{row.booking_id?.slice(0, 8)}</span>,
    },
    {
      header: "Customer Gross Paid",
      render: (row) => `₹${row.gross_amount}`,
    },
    {
      header: "Platform Commission (10%)",
      render: (row) => <span className="text-rose-600 font-medium">-₹{row.platform_commission}</span>,
    },
    {
      header: "Your Net Payout",
      render: (row) => <span className="font-extrabold text-emerald-700 text-sm">₹{row.net_earnings}</span>,
    },
    {
      header: "Payout Status",
      render: (row) => <Badge status={row.payout_status} size="sm" />,
    },
    {
      header: "Date",
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <DashboardLayout
      title="Financial Ledger & Earnings"
      subtitle="Complete accounting breakdown of completed jobs, automated 10% platform commission deductions, and net contractor shares."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Gross Revenue"
            value={`₹${totalGross.toLocaleString()}`}
            icon={TrendingUp}
            color="blue"
            subtitle="Before platform fee deduction"
          />
          <StatCard
            title="Platform Commission (10%)"
            value={`₹${totalCommission.toLocaleString()}`}
            icon={Percent}
            color="orange"
            subtitle="Platform maintenance & technology fee"
          />
          <StatCard
            title="Net Contractor Share"
            value={`₹${totalNet.toLocaleString()}`}
            icon={DollarSign}
            color="emerald"
            subtitle="Eligible for direct bank payout"
          />
        </div>

        <DataTable
          columns={columns}
          data={earnings}
          isLoading={isLoading}
          emptyMessage="No earnings records yet. Complete bookings will automatically post here."
        />
      </div>
    </DashboardLayout>
  );
};
