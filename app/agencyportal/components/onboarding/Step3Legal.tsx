import { useState } from "react";
import { toast } from "react-hot-toast";
import { validateAndConvertImage } from "@/lib/agency/kycImage";
import { generateUploadUrl } from "@/lib/id_verify/image_upload/r2";

export default function Step3Legal({ onboarding }: { onboarding: any }) {
  const { formData, updateForm, nextStep, prevStep } = onboarding;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.panNumber?.trim()) newErrors.panNumber = "Company PAN Number is required";
    if (!formData.panImageUrl?.trim()) newErrors.panImageUrl = "PAN Card image is required for verification";
    if (!formData.registrationDate?.trim()) newErrors.registrationDate = "Business Registration Date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    nextStep();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "panImageUrl" | "logoUrl" | "bannerUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Processing image...");

    try {
      let finalFile = file;

      // Only perform EXIF check for PAN card
      if (field === "panImageUrl") {
        toast.loading("Verifying image authenticity...", { id: toastId });
        const validation = await validateAndConvertImage(file);
        if (!validation.success) {
          toast.error(validation.error || "Image verification failed.", { id: toastId });
          setIsUploading(false);
          return;
        }
        if (validation.file) finalFile = validation.file;
      }

      toast.loading("Uploading securely...", { id: toastId });
      
      const { success, url, objectKey, error } = await generateUploadUrl(finalFile.type, "agency_kyc");
      
      if (!success || !url || !objectKey) {
        throw new Error(error || "Failed to generate secure upload URL");
      }

      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": finalFile.type,
        },
        body: finalFile,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image.");
      }

      updateForm(field, objectKey);
      toast.success("Image uploaded successfully!", { id: toastId });
      
      // Clear specific error if exists
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full animation-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Legal & Branding</h2>
        <p className="text-gray-500 dark:text-gray-400">Provide legal information for verification and optional branding.</p>
      </div>

      <div className="space-y-6 grow">
        
        {/* PAN Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Company PAN Number *</label>
            <input
              type="text"
              value={formData.panNumber}
              onChange={(e) => updateForm("panNumber", e.target.value.toUpperCase())}
              placeholder="e.g. ABCDE1234F"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all uppercase"
            />
            {errors.panNumber && <p className="text-red-500 text-sm mt-1">{errors.panNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Business Registered Date *</label>
            <input
              type="date"
              value={formData.registrationDate}
              onChange={(e) => updateForm("registrationDate", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
            />
            {errors.registrationDate && <p className="text-red-500 text-sm mt-1">{errors.registrationDate}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Upload PAN Card Image *</label>
          <p className="text-xs text-gray-500 mb-2">Please upload a clear, original, and unedited photo of the PAN card. We run automated checks to reject manipulated or AI-generated images.</p>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/jpeg, image/png, image/jpg"
              onChange={(e) => handleImageUpload(e, "panImageUrl")}
              disabled={isUploading}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#D4AF37]/10 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/20"
            />
          </div>
          {formData.panImageUrl && <p className="text-green-500 text-sm mt-2">✓ Image uploaded securely.</p>}
          {errors.panImageUrl && <p className="text-red-500 text-sm mt-1">{errors.panImageUrl}</p>}
        </div>

        {/* Other Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div>
            <label className="block text-sm font-medium mb-2">GST Number (Optional)</label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => updateForm("gstNumber", e.target.value.toUpperCase())}
              placeholder="e.g. 22AAAAA0000A1Z5"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all uppercase"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Logo Upload (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "logoUrl")}
              disabled={isUploading}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-800 file:text-black dark:file:text-white"
            />
            {formData.logoUrl && <p className="text-green-500 text-sm mt-2">✓ Logo uploaded.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Banner Upload (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "bannerUrl")}
              disabled={isUploading}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-800 file:text-black dark:file:text-white"
            />
             {formData.bannerUrl && <p className="text-green-500 text-sm mt-2">✓ Banner uploaded.</p>}
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
          disabled={isUploading}
          className="px-8 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
