import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { customerService } from "../../services/allServices";
import { useNotifications } from "../../context/NotificationContext";

export const AddressModal = ({ isOpen, onClose, address, onSaved }) => {
  const { addToast } = useNotifications();
  const [formData, setFormData] = useState({
    title: "Home",
    address_line1: "",
    address_line2: "",
    landmark: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "",
    is_default: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setFormData({
        title: address.title || "Home",
        address_line1: address.address_line1 || "",
        address_line2: address.address_line2 || "",
        landmark: address.landmark || "",
        city: address.city || "Mumbai",
        state: address.state || "Maharashtra",
        pincode: address.pincode || "",
        is_default: address.is_default || false,
      });
    } else {
      setFormData({
        title: "Home",
        address_line1: "",
        address_line2: "",
        landmark: "",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "",
        is_default: false,
      });
    }
  }, [address, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address_line1 || !formData.city || !formData.pincode) {
      addToast("Please fill in all required address fields", "error");
      return;
    }

    setIsLoading(true);
    try {
      if (address?.id) {
        await customerService.updateAddress(address.id, formData);
        addToast("Address updated successfully", "success");
      } else {
        await customerService.createAddress(formData);
        addToast("Address added to your address book", "success");
      }
      onClose();
      if (onSaved) onSaved();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save address", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={address?.id ? "Edit Address" : "Add New Address"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Address Title
          </label>
          <div className="flex space-x-2">
            {["Home", "Office", "Other"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, title: t })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  formData.title === t
                    ? "bg-teal-50 border-teal-600 text-teal-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Flat / House / Building / Street *"
          value={formData.address_line1}
          onChange={(e) =>
            setFormData({ ...formData, address_line1: e.target.value })
          }
          placeholder="e.g. Flat 301, Blue Ridge Towers"
          required
        />

        <Input
          label="Area / Landmark"
          value={formData.landmark}
          onChange={(e) =>
            setFormData({ ...formData, landmark: e.target.value })
          }
          placeholder="e.g. Near Metro Station / Opposite Park"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="City *"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
          <Input
            label="Pincode *"
            value={formData.pincode}
            onChange={(e) =>
              setFormData({ ...formData, pincode: e.target.value })
            }
            placeholder="e.g. 400001"
            required
          />
        </div>

        <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={formData.is_default}
            onChange={(e) =>
              setFormData({ ...formData, is_default: e.target.checked })
            }
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
          />
          <span>Set as default address for future bookings</span>
        </label>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="teal" isLoading={isLoading}>
            Save Address
          </Button>
        </div>
      </form>
    </Modal>
  );
};
