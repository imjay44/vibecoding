import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { ProviderCard } from "../../components/services/ProviderCard";
import { EmptyState } from "../../components/common/EmptyState";
import { CardSkeleton } from "../../components/common/Skeleton";
import { customerService } from "../../services/allServices";
import { Heart } from "lucide-react";

export const CustomerFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await customerService.getFavorites();
        setFavorites(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFavorites();
  }, []);

  return (
    <DashboardLayout
      title="Saved Service Providers"
      subtitle="Quick access to contractors you trust and bookmark."
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No Bookmarked Contractors"
            description="When you find a top-rated service contractor, click the heart icon on their profile to save them here for quick re-booking."
            actionText="Explore Top Contractors"
            onAction={() => (window.location.href = "/services")}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((prov) => (
              <ProviderCard key={prov.id} provider={prov} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
