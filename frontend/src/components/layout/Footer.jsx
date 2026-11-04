import React from "react";
import { Link } from "react-router-dom";
import { Wrench, ShieldCheck, Clock, Headphones, Award } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-900">
      {/* Trust Banner */}
      <div className="border-b border-slate-900 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3">
            <ShieldCheck className="w-8 h-8 text-teal-400 flex-shrink-0" />
            <div>
              <h4 className="text-white font-semibold text-sm">Verified Experts</h4>
              <p className="text-xs text-slate-500">Rigorous 5-point background check</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3">
            <Clock className="w-8 h-8 text-teal-400 flex-shrink-0" />
            <div>
              <h4 className="text-white font-semibold text-sm">On-Time Arrival</h4>
              <p className="text-xs text-slate-500">Punctual guaranteed service delivery</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3">
            <Award className="w-8 h-8 text-teal-400 flex-shrink-0" />
            <div>
              <h4 className="text-white font-semibold text-sm">Transparent Pricing</h4>
              <p className="text-xs text-slate-500">No hidden costs or surprise surcharges</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3">
            <Headphones className="w-8 h-8 text-teal-400 flex-shrink-0" />
            <div>
              <h4 className="text-white font-semibold text-sm">24x7 Support</h4>
              <p className="text-xs text-slate-500">Dedicated dispute resolution team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                <Wrench className="w-5 h-5 text-teal-100" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Home<span className="text-teal-400">Serve</span> Technologies
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your Home, Our Responsibility. India’s leading trusted marketplace connecting certified technicians with homeowners for prompt, safe, and quality-guaranteed repairs.
            </p>
            <p className="text-xs text-slate-500">
              Corporate Office: High-Tech Park, Bandra Kurla Complex, Mumbai, Maharashtra 400051
            </p>
          </div>

          {/* Popular Services */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              Popular Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/services?category=electrical" className="hover:text-teal-400">Electrical Solutions</Link></li>
              <li><Link to="/services?category=plumbing" className="hover:text-teal-400">Plumbing & Drains</Link></li>
              <li><Link to="/services?category=ac-repair" className="hover:text-teal-400">AC Jet Cleaning</Link></li>
              <li><Link to="/services?category=cleaning" className="hover:text-teal-400">Full House Cleaning</Link></li>
              <li><Link to="/services?category=appliance-repair" className="hover:text-teal-400">Appliance Repair</Link></li>
              <li><Link to="/services?category=pest-control" className="hover:text-teal-400">Pest Extermination</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-teal-400">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-teal-400">How It Works</Link></li>
              <li><Link to="/faq" className="hover:text-teal-400">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-teal-400">Contact & Support</Link></li>
              <li><Link to="/register/provider" className="hover:text-teal-400 font-medium text-teal-400">Join as Service Partner</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/privacy" className="hover:text-teal-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-teal-400">Terms of Service</Link></li>
              <li><span className="text-slate-500">Security Standards</span></li>
              <li><span className="text-slate-500">Payment Gateway Compliance</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HomeServe Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for Enterprise Reliability & Scalability.</p>
        </div>
      </div>
    </footer>
  );
};
