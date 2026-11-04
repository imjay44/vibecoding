import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  Wrench,
  Menu,
  X,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { Badge } from "../common/Badge";

export const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Mumbai");

  const getDashboardRoute = () => {
    switch (role) {
      case "SUPER_ADMIN":
        return "/admin";
      case "SERVICE_PROVIDER":
        return "/provider";
      case "TECHNICIAN":
        return "/technician";
      default:
        return "/customer";
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-900/10">
              <Wrench className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                Home<span className="text-teal-600">Serve</span>
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
                Tech
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-teal-600 transition-colors">
              Home
            </Link>
            <Link to="/services" className="hover:text-teal-600 transition-colors">
              All Services
            </Link>
            <Link to="/how-it-works" className="hover:text-teal-600 transition-colors">
              How It Works
            </Link>
            <Link to="/about" className="hover:text-teal-600 transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-teal-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Location Selector */}
          <div className="hidden lg:flex items-center text-xs font-medium text-slate-600 bg-slate-100/80 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-teal-600 mr-1.5" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
            </select>
          </div>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-xs text-teal-600 font-medium">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 6).map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => markAsRead(notif.id)}
                              className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition ${
                                !notif.is_read ? "bg-teal-50/40" : ""
                              }`}
                            >
                              <p className="font-semibold text-slate-800">
                                {notif.title}
                              </p>
                              <p className="text-slate-500 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Avatar / Menu */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {user?.full_name?.charAt(0) || "U"}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user?.full_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user?.email}
                        </p>
                        <div className="mt-1.5">
                          <Badge status={role} size="sm" />
                        </div>
                      </div>

                      <Link
                        to={getDashboardRoute()}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2.5 text-slate-500" />
                        Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-xs sm:text-sm text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  to="/register/provider"
                  className="text-xs font-semibold text-slate-700 hover:text-teal-600 px-3 py-2"
                >
                  Become a Partner
                </Link>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-teal-600 px-3 py-2"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Book a Service
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-2 border-b border-slate-100"
          >
            Home
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-2 border-b border-slate-100"
          >
            All Services
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-2 border-b border-slate-100"
          >
            How It Works
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-2 border-b border-slate-100"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-2"
          >
            Contact
          </Link>

          {!isAuthenticated && (
            <div className="pt-4 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-white bg-teal-600 rounded-lg"
              >
                Book a Service
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
