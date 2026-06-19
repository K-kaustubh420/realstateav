import { useState } from "react";

export default function Step2Location({ onboarding }: { onboarding: any }) {
  const { formData, updateForm, nextStep, prevStep, locateMe, geoError } = onboarding;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const required = ["phone", "email", "address", "city", "state"];
    const newErrors: Record<string, string> = {};
    
    required.forEach((field) => {
      if (!formData[field] || String(formData[field]).trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

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
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Location & Contact</h2>
        <p className="text-gray-500 dark:text-gray-400">Where is your agency located and how can clients reach you?</p>
      </div>

      <div className="space-y-6 grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateForm("email", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateForm("phone", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Street Address *</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => updateForm("address", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">City *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => updateForm("city", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">State *</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => updateForm("state", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Pincode</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => updateForm("pincode", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
            />
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
