import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";

export const DashboardLayout = ({ children, title, subtitle, actions }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Dashboard Menu</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar onClose={() => setMobileSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Header Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                {title && (
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
          </div>

          {/* Children View Content */}
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};
