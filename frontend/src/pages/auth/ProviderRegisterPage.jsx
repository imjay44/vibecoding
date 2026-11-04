import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Wrench, Mail, Lock, User, Phone, Building, Briefcase, ShieldAlert, ArrowRight } from "lucide-react";

export const ProviderRegisterPage = () => {
  const navigate = useNavigate();
  const { registerProvider } = useAuth();
  const { addToast } = useNotifications();

  const [formData, setFormData] = useState({
    full_name: "",
    business_name: "",
    email: "",
    phone_number: "",
    password: "",
    business_address: "",
    description: "",
    years_of_experience: 2,
    id_proof_url: "",
    license_doc_url: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await registerProvider({
        ...formData,
        years_of_experience: parseInt(formData.years_of_experience) || 1,
      });
      setSuccessSubmitted(true);
      addToast("Application submitted successfully!", "success");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Registration failed. Please check your inputs.";
      setErrorMsg(msg);
      addToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (successSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Application Under Review
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thank you for registering <strong>{formData.business_name}</strong>! Your provider application is currently pending administrator verification. You will be notified once your trade license and credentials have been verified.
          </p>
          <div className="pt-4">
            <Link to="/login">
              <Button variant="teal" className="w-full">
                Proceed to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-teal-400 flex items-center justify-center shadow-lg">
            <Wrench className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Home<span className="text-teal-600">Serve</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
          Service Contractor Partner Registration
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Join our verified network of professional repair & maintenance contractors.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-200/80">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
            <span className="font-bold flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1.5" /> Verification Notice:
            </span>
            <p>
              In accordance with marketplace compliance, provider registrations remain pending until an administrator reviews your business documents.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contractor Full Name *"
                icon={User}
                placeholder="Rajesh Verma"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
              <Input
                label="Registered Business Name *"
                icon={Building}
                placeholder="Apex Home Solutions"
                value={formData.business_name}
                onChange={(e) =>
                  setFormData({ ...formData, business_name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address *"
                type="email"
                icon={Mail}
                placeholder="apex@example.com"
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
                placeholder="+919811111111"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password (min 8 chars) *"
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
                label="Years of Experience *"
                type="number"
                min="0"
                value={formData.years_of_experience}
                onChange={(e) =>
                  setFormData({ ...formData, years_of_experience: e.target.value })
                }
                required
              />
            </div>

            <Input
              label="Physical Business Address *"
              placeholder="Shop 14, Commercial Center, Andheri West, Mumbai"
              value={formData.business_address}
              onChange={(e) =>
                setFormData({ ...formData, business_address: e.target.value })
              }
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business Description & Specializations
              </label>
              <textarea
                rows={2}
                placeholder="Describe your domain specializations, team size, tools, and background..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <Button
              type="submit"
              variant="teal"
              size="lg"
              className="w-full font-bold shadow-md shadow-teal-700/20"
              isLoading={isLoading}
            >
              Submit Application for Verification <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-bold text-teal-600 hover:text-teal-700"
            >
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
