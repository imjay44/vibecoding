import React from "react";
import { Link } from "react-router-dom";
import { Star, ShieldCheck, MapPin, Briefcase } from "lucide-react";
import { Button } from "../common/Button";

export const ProviderCard = ({ provider, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-bold text-slate-900 text-base">
                {provider.business_name}
              </h3>
              <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {provider.business_address}
            </p>
          </div>

          <div className="flex items-center bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
            <span>{provider.average_rating > 0 ? provider.average_rating : "4.8"}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
          {provider.description || "Certified multi-skilled service contractor."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 font-medium">
            <Briefcase className="w-3 h-3 mr-1 text-slate-400" />
            {provider.years_of_experience} Years Exp
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 font-medium">
            <Star className="w-3 h-3 mr-1 text-slate-400" />
            {provider.total_reviews} Reviews
          </span>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/providers/${provider.id}`}
          className="text-xs font-semibold text-slate-600 hover:text-teal-600"
        >
          View Profile
        </Link>
        {onSelect && (
          <Button size="sm" variant="teal" onClick={() => onSelect(provider)}>
            Select Provider
          </Button>
        )}
      </div>
    </div>
  );
};
