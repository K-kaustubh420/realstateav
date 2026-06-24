import { useState } from "react";

export default function Step2Location({ onboarding }: { onboarding: any }) {
  const { formData, updateAddress, nextStep, prevStep, locateMe, geoError } = onboarding;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    const addr = formData.Address;
    
    if (!addr.addressLine1?.trim()) newErrors.addressLine1 = "Address Line 1 is required";
    if (!addr.city?.trim()) newErrors.city = "City is required";
    if (!addr.state?.trim()) newErrors.state = "State is required";
    if (!addr.country?.trim()) newErrors.country = "Country is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    nextStep();
  };

  return (
    <div className="flex flex-col h-full w-full animation-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Location Details</h2>
        <p className="text-gray-500 dark:text-gray-400">Where is your agency located?</p>
      </div>

      <div className="space-y-6 grow">
        <div>
          <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
          <input
            type="text"
            value={formData.Address.addressLine1}
            onChange={(e) => updateAddress("addressLine1", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
            placeholder="Street address, P.O. box, etc."
          />
          {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Address Line 2</label>
          <input
            type="text"
            value={formData.Address.addressLine2}
            onChange={(e) => updateAddress("addressLine2", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
            placeholder="Suite, unit, building, floor, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">City *</label>
            <input
              type="text"
              value={formData.Address.city}
              onChange={(e) => updateAddress("city", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">State / Province *</label>
            <input
              type="text"
              value={formData.Address.state}
              onChange={(e) => updateAddress("state", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Postal Code</label>
            <input
              type="text"
              value={formData.Address.postalCode}
              onChange={(e) => updateAddress("postalCode", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Country *</label>
            <input
              type="text"
              value={formData.Address.country}
              onChange={(e) => updateAddress("country", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-medium">GPS Location</p>
              <p className="text-sm text-gray-500">Lat: {formData.gpsLocation.lat || "--"} • Lng: {formData.gpsLocation.lng || "--"}</p>
              {geoError && <p className="text-red-500 text-sm mt-1">{geoError}</p>}
            </div>
            <button
              type="button"
              onClick={locateMe}
              className="px-4 py-2 text-sm rounded-full bg-[#D4AF37]/10 text-[#D4AF37] font-semibold hover:bg-[#D4AF37]/20 transition-colors"
            >
              Use Current Location
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={prevStep}
          className="px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold hover:opacity-90 transition-opacity"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
