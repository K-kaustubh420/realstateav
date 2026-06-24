import { useState } from "react";
import { toast } from "react-hot-toast";

export default function Step4Review({ onboarding }: { onboarding: any }) {
  const { formData, prevStep, handleSubmit, submitting, updateForm } = onboarding;
  const [otpInput, setOtpInput] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const sendOtp = async () => {
    if (!formData.email) {
      toast.error("No email address provided.");
      return;
    }

    setIsSendingOtp(true);
    const toastId = toast.loading("Sending verification code...");

    try {
      const { sendOtpAction } = await import("@/lib/agents/agentAuthServer");
      const res = await sendOtpAction(formData.email);

      if (!res.success) throw new Error(res.error || "Failed to send OTP.");

      updateForm("otpSent", true);
      toast.success("Verification code sent to your email!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (otpInput.length !== 4) {
      toast.error("Please enter a valid 4-digit code.");
      return;
    }

    setIsVerifyingOtp(true);
    const toastId = toast.loading("Verifying code...");

    try {
      const { verifyOtpAction } = await import("@/lib/agents/agentAuthServer");
      const res = await verifyOtpAction(formData.email, otpInput);

      if (!res.success) throw new Error(res.error || "Invalid OTP.");

      updateForm("otpVerified", true);
      toast.success("Email verified successfully!", { id: toastId });
      
      // Proceed to submission after verification
      handleSubmit();
      
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const onFinalSubmit = () => {
    if (!formData.otpVerified) {
      if (!formData.otpSent) {
        sendOtp();
      } else {
        toast.error("Please verify your email to submit.");
      }
    } else {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full w-full animation-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Review & Submit</h2>
        <p className="text-gray-500 dark:text-gray-400">Please review your details and verify your email to create your agency.</p>
      </div>

      <div className="space-y-6 grow">
        {/* Data Review Section */}
        <div className="bg-gray-50 dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Agency Name & Type</p>
              <p className="font-medium text-lg">{formData.agencyName || "Not Provided"}</p>
              <p className="text-sm text-gray-500 capitalize">{formData.agencyType?.replace('_', ' ') || "Not Provided"}</p>
            </div>
            {formData.logoUrl && (
              <img src={formData.logoUrl} className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-800" alt="Logo" />
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
            <p className="font-medium">{formData.Address?.addressLine1}</p>
            {formData.Address?.addressLine2 && <p className="font-medium">{formData.Address?.addressLine2}</p>}
            <p className="text-gray-600 dark:text-gray-400">
              {formData.Address?.city}, {formData.Address?.state} {formData.Address?.postalCode} - {formData.Address?.country}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">PAN Number</p>
              <p className="font-medium uppercase">{formData.panNumber || "Not Provided"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Registration Date</p>
              <p className="font-medium">{formData.registrationDate || "Not Provided"}</p>
            </div>
          </div>
        </div>

        {/* OTP Section */}
        {formData.otpSent && !formData.otpVerified && (
          <div className="p-6 rounded-xl border border-[#D4AF37] bg-[#D4AF37]/5 space-y-4">
            <div>
              <h3 className="font-bold mb-1">Email Verification Required</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A 4-digit code has been sent to <strong>{formData.email}</strong>
              </p>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="0000"
                className="w-32 px-4 py-3 rounded-xl border border-[#D4AF37] bg-transparent text-center text-xl tracking-widest font-bold focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
              />
              <button
                onClick={verifyOtp}
                disabled={isVerifyingOtp || otpInput.length !== 4}
                className="px-6 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isVerifyingOtp ? "Verifying..." : "Verify & Submit"}
              </button>
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium">
            <strong>Disclaimer:</strong> This is a request to open an agency. Your details and PAN documentation will be sent to the administrator for review. After submission, your agency will be marked as "Pending" until verified.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={submitting || isSendingOtp || isVerifyingOtp}
          className="px-6 py-3 rounded-full border border-gray-300 dark:border-gray-700 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onFinalSubmit}
          disabled={submitting || isSendingOtp || isVerifyingOtp}
          className="px-8 py-3 rounded-full bg-[#D4AF37] text-black font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting || isSendingOtp || isVerifyingOtp ? (
            <>
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              {submitting ? "Submitting..." : "Processing..."}
            </>
          ) : formData.otpVerified ? (
            "Submit Agency Request"
          ) : formData.otpSent ? (
            "Awaiting Verification"
          ) : (
            "Verify Email & Submit"
          )}
        </button>
      </div>
    </div>
  );
}
