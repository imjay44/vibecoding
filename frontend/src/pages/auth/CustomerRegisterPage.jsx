import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Wrench, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";

export const CustomerRegisterPage = () => {
  const navigate = useNavigate();
  const { registerCustomer, login } = useAuth();
  const { addToast } = useNotifications();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    emergency_contact: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await registerCustomer(formData);
      addToast("Account created successfully! Logging you in...", "success");
      await login(formData.email, formData.password);
      navigate("/customer");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Registration failed. Please check your inputs.";
      setErrorMsg(msg);
      addToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
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
          Create Customer Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Book verified technicians for your home maintenance with ease.
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
              label="Full Name *"
              icon={User}
              placeholder="Rahul Sharma"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              required
            />

            <Input
              label="Email Address *"
              type="email"
              icon={Mail}
              placeholder="rahul@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <Input
              label="Mobile Number *"
              type="tel"
              icon={Phone}
              placeholder="+919876543210"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              required
            />

            <Input
              label="Password (min 8 characters) *"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />

            <Input
              label="Emergency Contact (Optional)"
              type="tel"
              placeholder="+919876543211"
              value={formData.emergency_contact}
              onChange={(e) =>
                setFormData({ ...formData, emergency_contact: e.target.value })
              }
            />

            <Button
              type="submit"
              variant="teal"
              size="lg"
              className="w-full font-bold shadow-md shadow-teal-700/20"
              isLoading={isLoading}
            >
              Register & Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-teal-600 hover:text-teal-700"
            >
              Sign In here
            </Link>
          </div>

          <div className="mt-3 text-center text-xs text-slate-500">
            Want to offer services?{" "}
            <Link
              to="/register/provider"
              className="font-bold text-slate-800 hover:text-teal-600"
            >
              Register as Contractor Partner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
