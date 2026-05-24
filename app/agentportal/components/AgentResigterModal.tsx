"use client";

import Link from "next/link";
import Image from "next/image";
import { User, Mail, Lock, Phone, CheckCircle, X, Check, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useAgentRegister } from "@/hooks/useAgentRegister";

const countryCodes = [
  { code: "+977", country: "Nepal" },
  { code: "+91", country: "India" },
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
];

export default function AgentRegisterModal() {
  const {
    formData,
    handleInputChange,
    loading,
    showOtpModal,
    setShowOtpModal,
    otp,
    handleOtpChange,
    timer,
    isVerified,
    handleRegisterClick,
    handleVerifyOtp,
    handleResendOtp,
    passwordValidation,
  } = useAgentRegister();

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-black font-sans">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #3f3f46" },
          success: { style: { border: "1px solid #10b981", color: "#10b981" } },
          error: { style: { border: "1px solid #ef4444", color: "#ef4444" } },
          loading: { style: { border: "1px solid #D4AF37", color: "#D4AF37" } },
        }}
      />

      {/* Left Column: Image & Branding */}
      <div className="relative hidden md:block">
        <Image
          src="https://i.pinimg.com/1200x/31/ad/d6/31add634f92ccd0004daf12b6a571722.jpg"
          alt="Real estate agents collaborating"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-90 grayscale-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent p-12 flex flex-col justify-between">
          <div>
            <Link href="/" className="font-serif text-3xl font-bold text-white tracking-wider">
              BHU MARKET
            </Link>
          </div>
          <div className="text-white">
            <h1 className="font-serif text-5xl font-bold leading-tight mb-4">
              Join the <span className="text-[#D4AF37]">Premier</span> Network
            </h1>
            <p className="text-xl text-zinc-300 font-light max-w-md">
              Create your account to unlock powerful tools and reach discerning clients.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 w-full">
        <div className="w-full max-w-md">
          <div className="text-center md:text-left mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-500 dark:text-zinc-400">
              Enter your details to register as an agent.
            </p>
          </div>

          <form onSubmit={handleRegisterClick} className="space-y-5">
            {/* Full Name */}
            <div className="relative group">
              <User className="absolute top-3.5 left-4 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all dark:text-white"
                value={formData.fullname}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                required
              />
            </div>

            {/* Mobile Number Group */}
            <div className="flex gap-3">
              <div className="w-1/3 relative group">
                <select
                  className="w-full pl-3 pr-8 py-3.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all dark:text-white appearance-none cursor-pointer"
                  value={formData.countryCode}
                  onChange={(e) => handleInputChange("countryCode", e.target.value)}
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-2/3 relative group">
                <Phone className="absolute top-3.5 left-4 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all dark:text-white"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute top-3.5 left-4 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all dark:text-white"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock className="absolute top-3.5 left-4 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all dark:text-white"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>

            {/* Password Requirements Checklist */}
            {formData.password && (
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-1">
                <div className={`flex items-center gap-1 ${passwordValidation.hasMinLength ? "text-green-500" : "text-gray-400"}`}>
                  {passwordValidation.hasMinLength ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />} Min 8 chars
                </div>
                <div className={`flex items-center gap-1 ${passwordValidation.hasCapital ? "text-green-500" : "text-gray-400"}`}>
                  {passwordValidation.hasCapital ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />} 1 Capital Letter
                </div>
                <div className={`flex items-center gap-1 ${passwordValidation.hasNumber ? "text-green-500" : "text-gray-400"}`}>
                  {passwordValidation.hasNumber ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />} 1 Number
                </div>
                <div className={`flex items-center gap-1 ${passwordValidation.hasSpecial ? "text-green-500" : "text-gray-400"}`}>
                  {passwordValidation.hasSpecial ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-400" />} 1 Special Char
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="relative group">
              <Lock className="absolute top-3.5 left-4 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all dark:text-white"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
              />
            </div>

            {/* Password Match Indicator */}
            {passwordValidation.isConfirming && (
              <div className={`text-xs flex items-center gap-1 transition-colors ${passwordValidation.isPasswordMatch ? "text-green-500" : "text-red-450"}`}>
                {passwordValidation.isPasswordMatch ? (
                  <>
                    <CheckCircle size={14} /> Password matches
                  </>
                ) : (
                  <>
                    <XCircle size={14} /> Passwords do not match
                  </>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passwordValidation.isPasswordStrong || (passwordValidation.isConfirming && !passwordValidation.isPasswordMatch)}
              className="w-full bg-[#D4AF37] hover:bg-yellow-600 text-black font-bold py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-yellow-500/20 transform hover:-translate-y-1 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Processing..." : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 dark:text-zinc-500 text-sm">
            Already have an account?{" "}
            <Link href="/agentportal/login" className="font-semibold text-[#D4AF37] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Modal Popup */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-gray-100 dark:border-zinc-800"
            >
              {!isVerified && (
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-255"
                >
                  <X size={20} />
                </button>
              )}

              {isVerified ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500"
                  >
                    <CheckCircle size={40} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Verified!</h3>
                  <p className="text-gray-500">Redirecting to login...</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#D4AF37]">
                      <Mail size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Verify Email</h3>
                    <p className="text-gray-500 text-sm">
                      Enter the 4-digit code sent to <br />
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {formData.email}
                      </span>
                    </p>
                  </div>

                  <div className="flex justify-center gap-2 mb-8">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-12 h-14 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-center text-xl font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all"
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full bg-[#D4AF37] hover:bg-yellow-600 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-500/20 mb-6"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>

                  <div className="text-center text-sm text-gray-500">
                    {timer > 0 ? (
                      <p>
                        Resend code in <span className="font-mono font-medium text-[#D4AF37]">{timer}s</span>
                      </p>
                    ) : (
                      <button onClick={handleResendOtp} className="text-[#D4AF37] font-semibold hover:underline">
                        Resend Code
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}