import { useState } from "react";

export default function Step1Basics({ onboarding }: { onboarding: any }) {
  const { formData, updateForm, nextStep } = onboarding;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.agencyName.trim()) newErrors.agencyName = "Agency Name is required";
    
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
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Agency Basics</h2>
        <p className="text-gray-500 dark:text-gray-400">Let's start with the name and description of your agency.</p>
      </div>

      <div className="space-y-6 grow">
        <div>
          <label className="block text-sm font-medium mb-2">Agency Name *</label>
          <input
            type="text"
            value={formData.agencyName}
            onChange={(e) => updateForm("agencyName", e.target.value)}
            placeholder="e.g. Dream Homes Realty"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
          />
          {errors.agencyName && <p className="text-red-500 text-sm mt-1">{errors.agencyName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">About Agency</label>
          <textarea
            value={formData.about}
            onChange={(e) => updateForm("about", e.target.value)}
            placeholder="Describe your agency's mission and services..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Website (Optional)</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => updateForm("website", e.target.value)}
            placeholder="https://www.youragency.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
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
