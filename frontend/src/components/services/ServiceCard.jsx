import React from "react";
import { Link } from "react-router-dom";
import { Clock, Star, ArrowRight } from "lucide-react";
import { Button } from "../common/Button";

export const ServiceCard = ({ service, onBook }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
            {service.category?.name || "Home Service"}
          </span>
          <div className="flex items-center text-slate-500">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>{service.estimated_duration_minutes} mins</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 line-clamp-1">
          {service.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {service.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Starting from
          </span>
          <div className="text-lg font-extrabold text-slate-900">
            ₹{service.base_price}
          </div>
        </div>

        {onBook ? (
          <Button size="sm" variant="teal" onClick={() => onBook(service)}>
            Book Service
          </Button>
        ) : (
          <Link to={`/services/${service.id}`}>
            <Button size="sm" variant="outline">
              Details
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
