import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DataTable } from "../../components/dashboard/DataTable";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog";
import { useNotifications } from "../../context/NotificationContext";
import { bookingService, feedbackService, paymentService } from "../../services/allServices";
import {
  CalendarCheck,
  Clock,
  MapPin,
  User,
  Star,
  FileText,
  AlertCircle,
  XCircle,
  Plus,
} from "lucide-react";

export const CustomerBookings = () => {
  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get("id");
  const { addToast } = useNotifications();

  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Cancellation Dialog
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Review Modal
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.getBookings();
      const list = res.data || [];
      setBookings(list);

      if (highlightedId) {
        const found = list.find((b) => b.id === highlightedId);
        if (found) setSelectedBooking(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [highlightedId]);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "ACTIVE") {
      return ["PENDING", "CONFIRMED", "PROVIDER_ASSIGNED", "IN_PROGRESS"].includes(b.status);
    }
    if (activeTab === "COMPLETED") return b.status === "COMPLETED";
    if (activeTab === "CANCELLED") return ["CANCELLED", "REJECTED"].includes(b.status);
    return true;
  });

  const handleConfirmCancel = async () => {
    if (!cancelBookingId) return;
    setIsCancelling(true);
    try {
      await bookingService.cancelBooking(cancelBookingId, cancelReason || "Customer cancelled appointment");
      addToast("Booking successfully cancelled", "success");
      setCancelBookingId(null);
      setCancelReason("");
      if (selectedBooking?.id === cancelBookingId) {
        setSelectedBooking(null);
      }
      loadBookings();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to cancel booking", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setIsSubmittingReview(true);
    try {
      await feedbackService.submitReview({
        booking_id: reviewBooking.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      addToast("Thank you for your rating!", "success");
      setReviewBooking(null);
      setReviewComment("");
      loadBookings();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const columns = [
    {
      header: "Booking Ref",
      accessor: "booking_reference",
      render: (row) => (
        <span className="font-bold text-slate-900">{row.booking_reference}</span>
      ),
    },
    {
      header: "Service & Provider",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">
            {row.service?.name}
          </span>
          <span className="text-xs text-slate-500">
            {row.provider?.business_name}
          </span>
        </div>
      ),
    },
    {
      header: "Scheduled For",
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-900 block">{row.booking_date}</span>
          <span className="text-slate-500">{row.time_slot}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: "Final Amount",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">₹{row.final_amount}</span>
          <Badge status={row.payment_status} size="sm" />
        </div>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedBooking(row)}
          >
            Details
          </Button>

          {["PENDING", "CONFIRMED"].includes(row.status) && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setCancelBookingId(row.id)}
            >
              Cancel
            </Button>
          )}

          {row.status === "COMPLETED" && (
            <Button
              size="sm"
              variant="teal"
              onClick={() => {
                setReviewBooking(row);
                setReviewRating(5);
              }}
            >
              <Star className="w-3.5 h-3.5 mr-1 fill-white" /> Review
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="My Service Bookings"
      subtitle="Track your active appointments, review past services, and manage bookings."
      actions={
        <Link to="/services">
          <Button variant="teal" size="sm">
            <Plus className="w-4 h-4 mr-1" /> New Booking
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-semibold pb-1">
          {[
            { id: "ALL", label: `All (${bookings.length})` },
            {
              id: "ACTIVE",
              label: `Active / Scheduled (${
                bookings.filter((b) =>
                  ["PENDING", "CONFIRMED", "PROVIDER_ASSIGNED", "IN_PROGRESS"].includes(b.status)
                ).length
              })`,
            },
            {
              id: "COMPLETED",
              label: `Completed (${
                bookings.filter((b) => b.status === "COMPLETED").length
              })`,
            },
            {
              id: "CANCELLED",
              label: `Cancelled (${
                bookings.filter((b) => ["CANCELLED", "REJECTED"].includes(b.status)).length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-xl transition ${
                activeTab === tab.id
                  ? "bg-white border-x border-t border-slate-200 text-teal-700 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings Table */}
        <DataTable
          columns={columns}
          data={filteredBookings}
          isLoading={isLoading}
          emptyMessage="No bookings found in this category."
        />

        {/* Detailed Booking Modal */}
        {selectedBooking && (
          <Modal
            isOpen={!!selectedBooking}
            onClose={() => setSelectedBooking(null)}
            title={`Booking #${selectedBooking.booking_reference}`}
            maxWidth="max-w-2xl"
          >
            <div className="space-y-6 text-xs sm:text-sm">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-xs">Current Status</span>
                  <div className="mt-1">
                    <Badge status={selectedBooking.status} size="md" />
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Payment</span>
                  <div className="mt-1">
                    <Badge status={selectedBooking.payment_status} size="md" />
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Final Amount</span>
                  <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                    ₹{selectedBooking.final_amount}
                  </span>
                </div>
              </div>

              {/* Service & Contractor Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Service Information
                  </span>
                  <div className="font-bold text-slate-900">
                    {selectedBooking.service?.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    Category: {selectedBooking.service?.category?.name || "Maintenance"}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Assigned Contractor
                  </span>
                  <div className="font-bold text-slate-900">
                    {selectedBooking.provider?.business_name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedBooking.provider?.business_address}
                  </div>
                </div>
              </div>

              {/* Schedule & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Scheduled Appointment
                  </span>
                  <div className="font-bold text-slate-900">
                    {selectedBooking.booking_date}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedBooking.time_slot}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Service Address
                  </span>
                  <div className="font-bold text-slate-900">
                    {selectedBooking.address?.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedBooking.address?.address_line1}, {selectedBooking.address?.city} - {selectedBooking.address?.pincode}
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Problem Description / Customer Remarks
                </span>
                <p className="text-slate-700 italic">
                  "{selectedBooking.problem_description}"
                </p>
              </div>

              {/* Technician Remarks if completed */}
              {selectedBooking.assignments && selectedBooking.assignments.length > 0 && (
                <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">
                    Workforce Dispatch Info
                  </span>
                  {selectedBooking.assignments.map((asg) => (
                    <div key={asg.id} className="text-xs space-y-1">
                      <div className="font-semibold text-slate-900">
                        Assigned Technician: {asg.technician?.user?.full_name || "Specialist"}
                      </div>
                      {asg.arrival_time && (
                        <div className="text-slate-600">
                          Arrived on site: {new Date(asg.arrival_time).toLocaleTimeString()}
                        </div>
                      )}
                      {asg.technician_remarks && (
                        <div className="text-slate-700 italic pt-1">
                          Completion remarks: "{asg.technician_remarks}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Link to={`/customer/invoices`}>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-1.5" /> View Tax Invoice
                  </Button>
                </Link>

                {["PENDING", "CONFIRMED"].includes(selectedBooking.status) && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setCancelBookingId(selectedBooking.id);
                      setSelectedBooking(null);
                    }}
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* Cancellation Dialog with Reason */}
        <Modal
          isOpen={!!cancelBookingId}
          onClose={() => setCancelBookingId(null)}
          title="Cancel Service Booking"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel this booking? Please provide a reason to help us improve service quality.
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="E.g., Problem resolved myself, scheduling conflict, or need to rebook for next week."
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelBookingId(null)}
                disabled={isCancelling}
              >
                Keep Booking
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmCancel}
                isLoading={isCancelling}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>

        {/* Review Modal */}
        {reviewBooking && (
          <Modal
            isOpen={!!reviewBooking}
            onClose={() => setReviewBooking(null)}
            title={`Review Service: ${reviewBooking.service?.name}`}
            maxWidth="max-w-md"
          >
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating ? "fill-amber-400" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Write Your Feedback
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the technician's punctuality, work quality, and etiquette?"
                  className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewBooking(null)}
                  disabled={isSubmittingReview}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  isLoading={isSubmittingReview}
                >
                  Submit Review
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};
