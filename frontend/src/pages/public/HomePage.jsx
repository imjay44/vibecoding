import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { CategoryCard } from "../../components/services/CategoryCard";
import { ServiceCard } from "../../components/services/ServiceCard";
import { ProviderCard } from "../../components/services/ProviderCard";
import { BookingModal } from "../../components/forms/BookingModal";
import { Button } from "../../components/common/Button";
import { catalogService, providerService } from "../../services/allServices";
import {
  Search,
  MapPin,
  ShieldCheck,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  Users,
  CalendarCheck,
  Star,
} from "lucide-react";

export const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [faqOpenIdx, setFaqOpenIdx] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, svcRes, provRes] = await Promise.all([
          catalogService.getCategories(),
          catalogService.getServices(),
          providerService.getApprovedProviders(),
        ]);
        setCategories(catRes.data || []);
        setFeaturedServices((svcRes.data || []).slice(0, 6));
        setTopProviders((provRes.data || []).slice(0, 3));
      } catch (err) {
        console.error("Failed to load home data", err);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/services");
    }
  };

  const handleBookService = (service) => {
    setSelectedServiceForBooking(service);
    setIsBookingOpen(true);
  };

  const faqs = [
    {
      q: "How are HomeServe technicians vetted and verified?",
      a: "Every service professional undergoes strict 5-stage verification including government ID validation, criminal background checks, technical certification review, trade skill assessments, and customer etiquette training.",
    },
    {
      q: "Can I reschedule or cancel my booking?",
      a: "Yes! Bookings can be easily rescheduled or cancelled via your Customer Dashboard prior to technician arrival. Our platform offers a flexible cancellation policy.",
    },
    {
      q: "How is payment handled on HomeServe?",
      a: "Payments are processed securely via Razorpay Test Mode with full support for UPI, Credit/Debit cards, and Net Banking. All quotes and invoices are transparent with zero hidden fees.",
    },
    {
      q: "What if I am not satisfied with the completed work?",
      a: "We offer a 30-Day Service Guarantee. If you notice any defects or subpar service, raise a Dispute Ticket from your Customer Dashboard and our administrative team will dispatch a complimentary rework inspection.",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>India’s Most Trusted Home Services SaaS Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Your Home, <span className="text-teal-400">Our Responsibility</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect with verified master electricians, certified plumbers, AC jet cleaning specialists, and carpenters at fixed transparent prices.
          </p>

          {/* Search Bar Container */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto bg-white rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-slate-100 text-slate-800 text-left"
          >
            {/* City Selection */}
            <div className="flex items-center space-x-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200 w-full sm:w-auto">
              <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Delhi NCR">Delhi NCR</option>
              </select>
            </div>

            {/* Keyword Input */}
            <div className="flex-1 flex items-center px-3 w-full">
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for 'AC service', 'fan install', 'plumber'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="teal"
              size="md"
              className="w-full sm:w-auto px-6 py-3 font-semibold"
            >
              Search
            </Button>
          </form>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-4">
            <span className="flex items-center">
              <ShieldCheck className="w-4 h-4 text-teal-400 mr-1.5" /> Background Verified
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 text-teal-400 mr-1.5" /> 60-Minute Arrival
            </span>
            <span className="flex items-center">
              <Award className="w-4 h-4 text-teal-400 mr-1.5" /> 30-Day Work Warranty
            </span>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Service Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select a specialized domain to view upfront pricing and book vetted technicians.
            </p>
          </div>
          <Link
            to="/services"
            className="hidden sm:flex items-center text-xs sm:text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Top Booked Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Most requested repairs and maintenance packages across residential homes.
              </p>
            </div>
            <Link
              to="/services"
              className="text-xs sm:text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center"
            >
              <span>Explore All</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredServices.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                onBook={handleBookService}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Verified Providers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Top-Rated Service Partners
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Contractors with 4.8+ customer satisfaction ratings and verified license records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topProviders.map((prov) => (
            <ProviderCard key={prov.id} provider={prov} />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              How HomeServe Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Book certified doorstep home maintenance services in four effortless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-base mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-white mb-2">Select Service</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose from 20+ verified home repair services with transparent pricing.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-base mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-white mb-2">Pick Slot & Address</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose your convenient date, reserved time-slot, and address.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-base mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-white mb-2">Doorstep Service</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A background-checked technician arrives equipped with specialized tools.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-base mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-white mb-2">Pay & Review</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete secure digital checkout via Razorpay and rate your experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-12 bg-teal-700 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black">25,000+</div>
            <div className="text-xs sm:text-sm text-teal-100 mt-1 font-medium">Completed Bookings</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black">1,200+</div>
            <div className="text-xs sm:text-sm text-teal-100 mt-1 font-medium">Verified Technicians</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black">4.85 ★</div>
            <div className="text-xs sm:text-sm text-teal-100 mt-1 font-medium">Average Customer Rating</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black">30-Day</div>
            <div className="text-xs sm:text-sm text-teal-100 mt-1 font-medium">Service Guarantee</div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Thousands of property owners rely on HomeServe for prompt emergency maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
              "Amit from Apex Home Solutions cleaned our two split AC units thoroughly. He used a jet pump and cleaned up all water drops afterwards. Cooling is outstanding now!"
            </p>
            <div className="font-semibold text-xs text-slate-900">Rahul Sharma</div>
            <div className="text-[11px] text-slate-400">Andheri West, Mumbai</div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
              "We had a kitchen sink leak on Sunday evening. Booked through HomeServe and the technician arrived within 45 minutes with all required fittings. Very transparent bill."
            </p>
            <div className="font-semibold text-xs text-slate-900">Priya Patel</div>
            <div className="text-[11px] text-slate-400">Powai, Mumbai</div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
              "Excellent electrical safety audit before moving into our new apartment. Fixed old switchboards and properly earthed high power connections."
            </p>
            <div className="font-semibold text-xs text-slate-900">Aditya Nair</div>
            <div className="text-[11px] text-slate-400">Kothrud, Pune</div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Common questions about booking, service guarantees, and partner verification.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setFaqOpenIdx(faqOpenIdx === idx ? null : idx)}
                  className="w-full text-left px-5 py-4 font-semibold text-sm text-slate-900 flex items-center justify-between hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      faqOpenIdx === idx ? "rotate-90 text-teal-600" : ""
                    }`}
                  />
                </button>
                {faqOpenIdx === idx && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contractor CTA */}
      <section className="bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-teal-900 to-slate-900 border border-teal-500/20 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Are You a Service Contractor?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Grow your client base with guaranteed weekly direct payouts, zero marketing overhead, and automated technician dispatching tools.
            </p>
          </div>
          <Link to="/register/provider">
            <Button variant="teal" size="lg" className="whitespace-nowrap font-bold">
              Become a Verified Partner
            </Button>
          </Link>
        </div>
      </section>

      <Footer />

      {/* Booking Modal */}
      {selectedServiceForBooking && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedServiceForBooking(null);
          }}
          initialService={selectedServiceForBooking}
        />
      )}
    </div>
  );
};
