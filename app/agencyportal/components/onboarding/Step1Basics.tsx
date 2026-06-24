import { useState } from "react";

export default function Step1Basics({ onboarding }: { onboarding: any }) {
  const { formData, updateForm, nextStep } = onboarding;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.agencyName?.trim()) newErrors.agencyName = "Agency Name is required";
    if (!formData.agencyType?.trim()) newErrors.agencyType = "Agency Type is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    nextStep();
  };

  return (
    <div className="flex flex-col h-full w-full animation-fade-in">
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-[Playfair_Display] font-bold mb-3 tracking-tight">Agency Basics</h2>
        <p className="text-zinc-500 text-base max-w-md">Let's start with the official name and contact information of your real estate agency.</p>
      </div>

      <div className="space-y-6 grow">
        <div>
          <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">Agency Name *</label>
          <input
            type="text"
            value={formData.agencyName}
            onChange={(e) => updateForm("agencyName", e.target.value)}
            placeholder="e.g. Dream Homes Realty"
            className="w-full px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all placeholder:text-zinc-400 font-medium"
          />
          {errors.agencyName && <p className="text-red-500 text-sm mt-1">{errors.agencyName}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">Agency Type *</label>
          <div className="relative">
            <select
              value={formData.agencyType}
              onChange={(e) => updateForm("agencyType", e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all appearance-none font-medium text-zinc-500"
            >
              <option value="" disabled>Select Agency Type</option>
              <option value="brokerage" className="text-black dark:text-white">Real Estate Brokerage</option>
              <option value="property_management" className="text-black dark:text-white">Property Management</option>
              <option value="developer" className="text-black dark:text-white">Developer / Builder</option>
              <option value="other" className="text-black dark:text-white">Other</option>
            </select>
          </div>
          {errors.agencyType && <p className="text-red-500 text-sm mt-1">{errors.agencyType}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">Agency Contact Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateForm("email", e.target.value)}
            placeholder="contact@youragency.com"
            className="w-full px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all placeholder:text-zinc-400 font-medium"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-zinc-700 dark:text-zinc-300">Agency Phone Number *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateForm("phone", e.target.value)}
            placeholder="+1 234 567 8900"
            className="w-full px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all placeholder:text-zinc-400 font-medium"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
