import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/common/Button";
import { useNotifications } from "../../context/NotificationContext";
import { providerService } from "../../services/allServices";
import { Clock, CheckCircle2 } from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const ProviderAvailability = () => {
  const { addToast } = useNotifications();
  const [schedule, setSchedule] = useState(
    DAYS.map((day, idx) => ({
      day_of_week: idx,
      start_time: "09:00",
      end_time: "19:00",
      slot_capacity: 3,
      is_active: true,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const res = await providerService.getMyAvailability();
        if (res.data && res.data.length > 0) {
          const map = {};
          res.data.forEach((s) => {
            map[s.day_of_week] = {
              day_of_week: s.day_of_week,
              start_time: (s.start_time || "09:00:00").slice(0, 5),
              end_time: (s.end_time || "19:00:00").slice(0, 5),
              slot_capacity: s.slot_capacity,
              is_active: s.is_active,
            };
          });

          setSchedule(
            DAYS.map((day, idx) =>
              map[idx] || {
                day_of_week: idx,
                start_time: "09:00",
                end_time: "19:00",
                slot_capacity: 3,
                is_active: true,
              }
            )
          );
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadAvailability();
  }, []);

  const handleDayChange = (idx, field, value) => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveSchedule = async () => {
    setIsLoading(true);
    try {
      const payload = schedule.map((s) => ({
        day_of_week: s.day_of_week,
        start_time: `${s.start_time}:00`,
        end_time: `${s.end_time}:00`,
        slot_capacity: parseInt(s.slot_capacity) || 1,
        is_active: s.is_active,
      }));

      await providerService.updateMyAvailability(payload);
      addToast("Availability & slot capacities saved successfully!", "success");
    } catch (err) {
      addToast("Failed to save schedule", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Working Hours & Slot Capacity"
      subtitle="Define your weekly availability schedule and maximum concurrent booking capacity to prevent double bookings."
      actions={
        <Button variant="teal" size="sm" onClick={handleSaveSchedule} isLoading={isLoading}>
          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Save Working Schedule
        </Button>
      }
    >
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 divide-y divide-slate-100">
          {schedule.map((item, idx) => (
            <div
              key={idx}
              className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                !item.is_active ? "opacity-50" : ""
              }`}
            >
              <div className="w-36 flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(e) => handleDayChange(idx, "is_active", e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className="font-bold text-sm text-slate-900">{DAYS[idx]}</span>
              </div>

              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">From:</span>
                  <input
                    type="time"
                    value={item.start_time}
                    disabled={!item.is_active}
                    onChange={(e) => handleDayChange(idx, "start_time", e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-1 text-xs"
                  />
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">To:</span>
                  <input
                    type="time"
                    value={item.end_time}
                    disabled={!item.is_active}
                    onChange={(e) => handleDayChange(idx, "end_time", e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-1 text-xs"
                  />
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500">Max Capacity:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={item.slot_capacity}
                    disabled={!item.is_active}
                    onChange={(e) => handleDayChange(idx, "slot_capacity", e.target.value)}
                    className="w-16 border border-slate-300 rounded-lg px-2 py-1 text-xs text-center font-bold"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
