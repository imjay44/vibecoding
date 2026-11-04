import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { ServiceCard } from "../../components/services/ServiceCard";
import { BookingModal } from "../../components/forms/BookingModal";
import { CardSkeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { catalogService } from "../../services/allServices";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";

export const AllServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchKeyword, setSearchKeyword] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState("");

  // Booking Modal
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await catalogService.getCategories();
        setCategories(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadCategories();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (searchKeyword.trim()) params.search = searchKeyword.trim();
      if (maxPrice) params.max_price = maxPrice;

      const res = await catalogService.getServices(params);
      setServices(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [selectedCategory, searchKeyword, maxPrice]);

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchKeyword("");
    setMaxPrice("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore All Home Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose from certified electrical, plumbing, AC, and deep cleaning solutions.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Max Price */}
            <div className="w-full sm:w-48">
              <input
                type="number"
                placeholder="Max Price (₹)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {(selectedCategory || searchKeyword || maxPrice) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
                !selectedCategory
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            title="No services match your filters"
            description="Try clearing your search query or picking another category."
            actionText="Clear All Filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {services.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                onBook={(s) => {
                  setSelectedService(s);
                  setIsBookingOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {selectedService && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedService(null);
          }}
          initialService={selectedService}
        />
      )}
    </div>
  );
};
