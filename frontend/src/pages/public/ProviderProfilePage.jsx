import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { providerService, feedbackService } from "../../services/allServices";
import {
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  CheckCircle,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";

export const ProviderProfilePage = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [provRes, revRes] = await Promise.all([
          providerService.getProviderDetails(id),
          feedbackService.getProviderReviews(id),
        ]);
        setProvider(provRes.data);
        setReviews(revRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-sm font-semibold text-slate-500">
          Loading provider profile...
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 text-center py-16">
          <h2 className="text-xl font-bold">Provider Not Found</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Link
          to="/services"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-600"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Services
        </Link>

        {/* Header Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {provider.business_name}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Verified Contractor
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {provider.business_address}
              </p>
            </div>

            <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl">
              <div className="text-center">
                <div className="text-xl font-black text-slate-900 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                  {provider.average_rating > 0 ? provider.average_rating : "4.8"}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Rating</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <div className="text-xl font-black text-slate-900">
                  {provider.total_reviews}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Reviews</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <div className="text-xl font-black text-slate-900">
                  {provider.years_of_experience}y
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Experience</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 mb-2">About The Contractor</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {provider.description || "Certified multi-skilled service contractor."}
            </p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Customer Feedback ({reviews.length})
            </h2>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No reviews published yet for this provider.
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900">
                      {rev.customer_name || "Verified Customer"}
                    </span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  {rev.comment && (
                    <p className="text-xs sm:text-sm text-slate-600 italic">
                      "{rev.comment}"
                    </p>
                  )}
                  {rev.provider_reply && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-700 ml-4">
                      <span className="font-bold text-teal-700 block mb-0.5">
                        Provider Reply:
                      </span>
                      {rev.provider_reply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
