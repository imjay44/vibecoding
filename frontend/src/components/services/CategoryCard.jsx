import React from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Wrench,
  Wind,
  Sparkles,
  Paintbrush,
  Hammer,
  Tv,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

const ICON_MAP = {
  Zap,
  Wrench,
  Wind,
  Sparkles,
  Paintbrush,
  Hammer,
  Tv,
  ShieldAlert,
};

export const CategoryCard = ({ category }) => {
  const IconComponent = ICON_MAP[category.icon] || Wrench;

  return (
    <Link
      to={`/services?category=${category.id}`}
      className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-teal-400 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors mb-4">
          <IconComponent className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-600">
        <span>Explore Services</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
