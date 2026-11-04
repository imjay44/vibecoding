import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatCard } from "../../components/dashboard/StatCard";
import { Button } from "../../components/common/Button";
import { adminService } from "../../services/allServices";
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Percent,
  Download,
  CalendarCheck,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0D9488", "#0284C7", "#F97316", "#10B981", "#64748B", "#E11D48"];

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          adminService.getStats(),
          adminService.getCharts(),
        ]);
        setStats(statsRes.data);
        setCharts(chartRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleExportCsv = async () => {
    try {
      const res = await adminService.exportBookingsCsv();
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "homeserve_bookings_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  return (
    <DashboardLayout
      title="Platform Executive Oversight"
      subtitle="Real-time macro analytics across marketplace demand, contractor supply, and financial commissions."
      actions={
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download className="w-4 h-4 mr-1.5" /> Export Bookings CSV
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue Settled"
            value={`₹${parseFloat(stats?.total_revenue || 0).toLocaleString()}`}
            icon={TrendingUp}
            color="emerald"
            subtitle="Via Razorpay Test Gateway"
          />
          <StatCard
            title="Platform Commission (10%)"
            value={`₹${parseFloat(stats?.platform_commission || 0).toLocaleString()}`}
            icon={Percent}
            color="teal"
            subtitle="Marketplace net take"
          />
          <StatCard
            title="Total Bookings"
            value={stats?.total_bookings || 0}
            icon={CalendarCheck}
            color="blue"
            subtitle={`${stats?.completed_bookings || 0} Completed / ${stats?.pending_bookings || 0} Pending`}
          />
          <StatCard
            title="Platform Users"
            value={(stats?.total_customers || 0) + (stats?.total_providers || 0)}
            icon={Users}
            color="purple"
            subtitle={`${stats?.total_customers || 0} Customers / ${stats?.total_providers || 0} Providers`}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Monthly Platform Revenue & Commission Trend (INR)
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.monthly_revenue || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="revenue" fill="#0284C7" name="Gross Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="commission" fill="#0D9488" name="Platform Commission" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Growth Line Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Customer Acquisition Growth Curve
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts?.customer_growth || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    stroke="#0D9488"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Registered Customers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Service Category Popularity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Service Category Popularity
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.category_popularity || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#F97316" radius={[0, 4, 4, 0]} name="Completed Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Status Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Booking Status Distribution
            </h3>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.status_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(charts?.status_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
