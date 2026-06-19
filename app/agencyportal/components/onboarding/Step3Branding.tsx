import { useState } from "react";

export default function Step3Branding({ onboarding }: { onboarding: any }) {
  const { formData, updateForm, nextStep, prevStep } = onboarding;

  return (
    <div className="flex flex-col h-full w-full animation-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Branding & Legal</h2>
        <p className="text-gray-500 dark:text-gray-400">Add your logos and GST information for verification.</p>
      </div>

      <div className="space-y-6 grow">
        <div>
          <label className="block text-sm font-medium mb-2">GST Number (Optional)</label>
          <input
            type="text"
            value={formData.gstNumber}
            onChange={(e) => updateForm("gstNumber", e.target.value)}
            placeholder="e.g. 22AAAAA0000A1Z5"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all uppercase"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Logo URL (Optional)</label>
          <input
            type="url"
            value={formData.logoUrl}
            onChange={(e) => updateForm("logoUrl", e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
          />
          {formData.logoUrl && (
            <div className="mt-3 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Banner URL (Optional)</label>
          <input
            type="url"
            value={formData.bannerUrl}
            onChange={(e) => updateForm("bannerUrl", e.target.value)}
            placeholder="https://example.com/banner.png"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
          />
          {formData.bannerUrl && (
            <div className="mt-3 w-full h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              <img src={formData.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
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
          onClick={nextStep}
          className="px-8 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold hover:opacity-90 transition-opacity"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
