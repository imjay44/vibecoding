import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { useNotifications } from "../../context/NotificationContext";
import { couponService } from "../../services/allServices";
import { Tag, Plus, CheckCircle2 } from "lucide-react";

export const AdminCoupons = () => {
  const { addToast } = useNotifications();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Coupon Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [flatDiscount, setFlatDiscount] = useState("");
  const [percentDiscount, setPercentDiscount] = useState("");
  const [minOrder, setMinOrder] = useState("499");
  const [daysValid, setDaysValid] = useState(90);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await couponService.getCoupons();
      setCoupons(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code) return;

    setIsSubmitting(true);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + parseInt(daysValid || 30));

      await couponService.createCoupon({
        code: code.toUpperCase().trim(),
        flat_discount: flatDiscount ? parseFloat(flatDiscount) : null,
        discount_percent: percentDiscount ? parseFloat(percentDiscount) : null,
        min_order_amount: parseFloat(minOrder || 0),
        valid_until: validUntil.toISOString(),
      });

      addToast("Promotional campaign coupon created successfully", "success");
      setIsModalOpen(false);
      setCode("");
      setFlatDiscount("");
      setPercentDiscount("");
      loadCoupons();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create coupon", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Promo Code",
      render: (row) => (
        <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md text-xs border border-teal-200">
          {row.code}
        </span>
      ),
    },
    {
      header: "Discount Value",
      render: (row) =>
        row.discount_percent
          ? `${row.discount_percent}% Discount`
          : `₹${row.flat_discount} Flat Off`,
    },
    {
      header: "Min Order Amount",
      render: (row) => `₹${row.min_order_amount}`,
    },
    {
      header: "Validity",
      render: (row) => new Date(row.valid_until).toLocaleDateString(),
    },
    {
      header: "Status",
      render: (row) => (
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Active Campaign
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Promotional Discounts & Coupons"
      subtitle="Create and govern customer discount campaigns to incentivize repeat bookings."
      actions={
        <Button variant="teal" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Create Coupon
        </Button>
      }
    >
      <div className="space-y-6">
        <DataTable
          columns={columns}
          data={coupons}
          isLoading={isLoading}
          emptyMessage="No promotional coupons found."
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Promotional Coupon"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <Input
              label="Coupon Code *"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MONSOON25, DIWALI150"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Flat Discount (₹)"
                type="number"
                placeholder="100"
                value={flatDiscount}
                onChange={(e) => {
                  setFlatDiscount(e.target.value);
                  setPercentDiscount("");
                }}
              />
              <Input
                label="Or Percent Off (%)"
                type="number"
                placeholder="15"
                value={percentDiscount}
                onChange={(e) => {
                  setPercentDiscount(e.target.value);
                  setFlatDiscount("");
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Order Amount (₹)"
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                required
              />
              <Input
                label="Valid For (Days)"
                type="number"
                value={daysValid}
                onChange={(e) => setDaysValid(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" size="sm" isLoading={isSubmitting}>
                Publish Coupon
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
