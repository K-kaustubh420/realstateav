export default function Step4Review({ onboarding }: { onboarding: any }) {
  const { formData, prevStep, handleSubmit, submitting } = onboarding;

  return (
    <div className="flex flex-col h-full w-full animation-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Review & Submit</h2>
        <p className="text-gray-500 dark:text-gray-400">Please review your details before creating your agency.</p>
      </div>

      <div className="space-y-6 grow">
        <div className="bg-gray-50 dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Agency Name</p>
              <p className="font-medium text-lg">{formData.agencyName || "Not Provided"}</p>
            </div>
            {formData.logoUrl && (
              <img src={formData.logoUrl} className="w-12 h-12 rounded-lg object-cover" alt="Logo" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Email</p>
              <p className="font-medium">{formData.email || "Not Provided"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Phone</p>
              <p className="font-medium">{formData.phone || "Not Provided"}</p>
            </div>
          </div>

          <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Address</p>
            <p className="font-medium">{formData.address}</p>
            <p className="text-gray-600 dark:text-gray-400">{formData.city}, {formData.state} {formData.pincode}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">GST Number</p>
            <p className="font-medium uppercase">{formData.gstNumber || "Not Provided"}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
          <p className="text-sm font-medium">
            After submission, your agency will be marked as "Pending" and must be approved by an administrator before it can accept agents.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={submitting}
          className="px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3 rounded-full bg-[#D4AF37] text-black font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              Creating...
            </>
          ) : (
            "Create Agency"
          )}
        </button>
      </div>
    </div>
  );
}
