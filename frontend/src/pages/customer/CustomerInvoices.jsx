import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { bookingService, paymentService } from "../../services/allServices";
import { FileText, Printer, Download, CheckCircle2 } from "lucide-react";

export const CustomerInvoices = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await bookingService.getBookings();
        // Show bookings that have completed payment or invoice
        const paid = (res.data || []).filter((b) => b.payment_status === "PAID");
        setBookings(paid);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleViewInvoice = async (booking) => {
    try {
      const res = await paymentService.getInvoice(booking.id);
      setSelectedInvoice(res.data);
    } catch (e) {
      // Fallback synthetic invoice object from booking record
      setSelectedInvoice({
        invoice_number: `INV-${booking.booking_reference}`,
        booking: booking,
        subtotal: booking.base_amount,
        discount: booking.discount_amount,
        tax_amount: 0,
        total_amount: booking.final_amount,
        issued_at: booking.updated_at || booking.created_at,
      });
    }
  };

  const columns = [
    {
      header: "Invoice #",
      render: (row) => (
        <span className="font-bold text-slate-900">INV-{row.booking_reference}</span>
      ),
    },
    {
      header: "Service",
      render: (row) => row.service?.name,
    },
    {
      header: "Date Issued",
      render: (row) => row.booking_date,
    },
    {
      header: "Total Paid",
      render: (row) => (
        <span className="font-bold text-slate-900">₹{row.final_amount}</span>
      ),
    },
    {
      header: "Receipt Action",
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => handleViewInvoice(row)}>
          <FileText className="w-4 h-4 mr-1.5" /> View Receipt
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Invoices & Receipts"
      subtitle="View, print, and download formal tax invoices for your completed transactions."
    >
      <div className="space-y-6">
        <DataTable
          columns={columns}
          data={bookings}
          isLoading={isLoading}
          emptyMessage="No paid bookings or invoices found yet."
        />

        {/* Printable Invoice Modal */}
        {selectedInvoice && (
          <Modal
            isOpen={!!selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            title={`Invoice: ${selectedInvoice.invoice_number}`}
            maxWidth="max-w-2xl"
          >
            <div id="invoice-printable" className="p-6 bg-white space-y-6 text-xs sm:text-sm">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Home<span className="text-teal-600">Serve</span> Technologies
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    GSTIN: 27AABCH1234F1Z8
                  </p>
                  <p className="text-xs text-slate-500">
                    Bandra Kurla Complex, Mumbai, Maharashtra 400051
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    PAID IN FULL
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    {selectedInvoice.invoice_number}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(selectedInvoice.issued_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Service Details Table */}
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">
                        {selectedInvoice.booking?.service?.name || "Home Maintenance"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Contractor: {selectedInvoice.booking?.provider?.business_name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold">
                      ₹{selectedInvoice.subtotal}
                    </td>
                  </tr>
                  {selectedInvoice.discount > 0 && (
                    <tr className="text-emerald-700 font-medium">
                      <td className="py-2 px-3">Promotional Discount Applied</td>
                      <td className="py-2 px-3 text-right">-₹{selectedInvoice.discount}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 px-3">Platform Convenience Fee</td>
                    <td className="py-2 px-3 text-right text-emerald-700">FREE</td>
                  </tr>
                </tbody>
                <tfoot className="border-t-2 border-slate-900 font-bold text-sm text-slate-900">
                  <tr>
                    <td className="py-3 px-3">Total Paid Amount</td>
                    <td className="py-3 px-3 text-right">
                      ₹{selectedInvoice.total_amount}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="text-[11px] text-slate-400 text-center pt-4 border-t border-slate-100">
                This is a computer-generated tax invoice issued by HomeServe Technologies SaaS.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4 mr-1.5" /> Print Receipt
                </Button>
                <Button
                  variant="teal"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
                >
                  Done
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};
