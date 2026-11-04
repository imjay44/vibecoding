import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Wrench, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useNotifications();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const { role } = await login(email, password);
      addToast("Welcome back! Login successful.", "success");

      // Redirect according to role
      if (role === "SUPER_ADMIN") navigate("/admin");
      else if (role === "SERVICE_PROVIDER") navigate("/provider");
      else if (role === "TECHNICIAN") navigate("/technician");
      else navigate("/customer");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Invalid credentials. Please verify your email & password.";
      setErrorMsg(msg);
      addToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-teal-400 flex items-center justify-center shadow-lg">
            <Wrench className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Home<span className="text-teal-600">Serve</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
          Sign In to Your Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your bookings, workforce dispatching, or platform metrics.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-200/80">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="font-medium text-teal-600 hover:text-teal-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="teal"
              size="lg"
              className="w-full font-bold shadow-md shadow-teal-700/20"
              isLoading={isLoading}
            >
              Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              Quick 1-Click Demo Login Fill
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemo("rahul.customer@example.com", "Customer@123456")
                }
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-left truncate"
              >
                👤 <span className="font-bold">Customer</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemo("apex.services@example.com", "Provider@123456")
                }
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-left truncate"
              >
                🏢 <span className="font-bold">Provider</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemo("amit.tech@example.com", "Tech@123456")
                }
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-left truncate"
              >
                🔧 <span className="font-bold">Technician</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemo("admin@homeserve.com", "Admin@123456")
                }
                className="p-2 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-700 font-medium text-left truncate"
              >
                ⚡ <span className="font-bold">Super Admin</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{" "}
            <Link
              to="/register"
              className="font-bold text-teal-600 hover:text-teal-700"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
