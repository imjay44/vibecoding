import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Button } from "../../components/common/Button";
import { BookingModal } from "../../components/forms/BookingModal";
import { catalogService } from "../../services/allServices";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  AlertCircle,
} from "lucide-react";

export const ServiceDetailsPage = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const loadService = async () => {
      try {
        const res = await catalogService.getServiceById(id);
        setService(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadService();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto w-full p-8 flex items-center justify-center">
          <div className="text-sm text-slate-500 font-semibold animate-pulse">
            Loading service details...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Service Not Found</h2>
          <p className="text-xs text-slate-500">The service you requested is currently not available.</p>
          <Link to="/services">
            <Button variant="teal">Browse Services</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/services"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to All Services
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700">
                {service.category?.name || "Home Service"}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {service.name}
              </h1>

              <div className="flex items-center space-x-4 text-xs sm:text-sm text-slate-500">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 text-slate-400 mr-1.5" />
                  Approx. {service.estimated_duration_minutes} Minutes
                </span>
                <span className="flex items-center">
                  <ShieldCheck className="w-4 h-4 text-teal-600 mr-1.5" />
                  30-Day Work Warranty
                </span>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-bold text-sm text-slate-900 mb-2">Service Overview</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* What is Included */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h3 className="font-bold text-sm text-slate-900">What is Included:</h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                    Complete inspection & fault diagnosis by certified technician
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                    Professional repair using standard OEM-grade spare parts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                    Post-service cleanup and testing under customer supervision
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                    Official digital tax invoice and 30-day warranty card
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pricing & Booking Card */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Standard Rate
                </span>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">
                  ₹{service.base_price}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Inclusive of all standard labor charges.
                </p>
              </div>

              <Button
                variant="teal"
                size="lg"
                className="w-full font-bold shadow-md shadow-teal-700/20"
                onClick={() => setIsBookingOpen(true)}
              >
                <Calendar className="w-4 h-4 mr-2" /> Book This Service
              </Button>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-500">
                <div className="flex items-center">
                  <ShieldCheck className="w-4 h-4 text-teal-600 mr-2" />
                  Verified background-checked technicians
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2" />
                  No advance payment needed to reserve slot
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {isBookingOpen && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          initialService={service}
        />
      )}
    </div>
  );
};
