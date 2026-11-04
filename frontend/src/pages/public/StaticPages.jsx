import React, { useState } from "react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useNotifications } from "../../context/NotificationContext";
import {
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

export const AboutPage = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />
    <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700">
          About HomeServe Technologies
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Pioneering Quality & Trust in Home Services
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          HomeServe Technologies is a full-stack SaaS marketplace founded with a single mission: to eliminate the uncertainty, unreliability, and safety concerns associated with doorstep repairs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Uncompromising Verification</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every technician undergoes 5-point verification including trade certification, identity checks, and police record scrutiny.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Atomic Slot Scheduling</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our backend prevents double booking with database transactions and guarantees technician arrival within your chosen window.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">30-Day Guarantee</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enjoy complete peace of mind with our 30-day warranty on all electrical, plumbing, and AC repairs.
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export const HowItWorksPage = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />
    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          How HomeServe Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          From discovery to completion: transparent, safe, and fully tracked.
        </p>
      </div>

      <div className="space-y-6">
        {[
          { step: "01", title: "Discover & Filter Services", desc: "Browse from electrical repairs to AC jet cleaning with clear fixed pricing." },
          { step: "02", title: "Select Verified Contractor & Time Slot", desc: "Choose your preferred contractor based on reviews and pick an atomic time slot." },
          { step: "03", title: "Live Tracking & Arrival", desc: "Receive status notifications when your contractor confirms and the technician arrives on site." },
          { step: "04", title: "Verified Work Completion & Review", desc: "Technician uploads before/after work verification photos, and you rate the service." },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start space-x-4 shadow-sm">
            <span className="text-2xl font-black text-teal-600">{item.step}</span>
            <div>
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export const FaqPage = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const faqs = [
    { q: "How do I make a payment?", a: "You can pay digitally via Razorpay Test Mode using UPI, Cards, Net Banking, or choose to pay after service completion." },
    { q: "What documents must a service provider submit?", a: "Contractors submit business registration, trade certifications, GST/PAN verification, and technician identity cards." },
    { q: "How are platform commissions calculated?", a: "The platform charges a standard 10% commission on the net payable amount after deducting any promotional coupon discounts." },
    { q: "How do I raise a complaint if a repair fails?", a: "Go to your Customer Dashboard -> Dispute Tickets, attach your booking reference and photo proof, and our team will resolve it within 24 hours." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h1>
          <p className="text-xs sm:text-sm text-slate-500">Everything you need to know about our marketplace.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full text-left p-4 text-sm font-bold text-slate-900 flex justify-between items-center"
              >
                <span>{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition ${openIdx === i ? "rotate-180 text-teal-600" : ""}`} />
              </button>
              {openIdx === i && (
                <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-3">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const ContactPage = () => {
  const { addToast } = useNotifications();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    addToast("Message received! Our support desk will reach out shortly.", "success");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700">
              Get in Touch
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">We're Here to Help</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Have questions regarding a service booking, partner registration, or custom enterprise requirements? Our support team is available 24/7.
            </p>

            <div className="space-y-4 pt-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-teal-600" />
                <span>+91 1800-419-8800 (Toll Free)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-teal-600" />
                <span>support@homeservetech.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-teal-600" />
                <span>BKC Technology Complex, Bandra East, Mumbai 400051</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            {submitted ? (
              <div className="text-center py-10 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
                <h3 className="font-bold text-slate-900">Thank You!</h3>
                <p className="text-xs text-slate-500">Your inquiry has been logged.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Your Name *" placeholder="Rahul Sharma" required />
                <Input label="Email Address *" type="email" placeholder="rahul@example.com" required />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we assist you today?"
                    className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <Button type="submit" variant="teal" className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const TermsPage = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />
    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed shadow-sm">
        <p>Welcome to HomeServe Technologies. By accessing or using our website, APIs, or mobile interfaces, you agree to comply with and be bound by these Terms.</p>
        <h3 className="font-bold text-slate-900 text-sm">1. Service Marketplace</h3>
        <p>HomeServe Technologies operates as a technology facilitator connecting independent verified service contractors with customers.</p>
        <h3 className="font-bold text-slate-900 text-sm">2. Booking & Cancellation</h3>
        <p>Customers may cancel or reschedule eligible bookings prior to technician dispatch. Any refund is settled in accordance with our documented refund policy.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export const PrivacyPage = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />
    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed shadow-sm">
        <p>Your privacy is of vital importance. We collect personal identification information such as name, email, phone number, and address strictly for scheduling and fulfilling home services.</p>
        <h3 className="font-bold text-slate-900 text-sm">1. Data Security</h3>
        <p>All passwords are encrypted with bcrypt hashes. Access tokens are cryptographically signed. We never store raw debit/credit card numbers on our servers.</p>
      </div>
    </main>
    <Footer />
  </div>
);
