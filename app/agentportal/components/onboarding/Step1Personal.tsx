"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, FileText } from "lucide-react";
import gsap from "gsap";

export default function Step1Personal({ onboarding }: { onboarding: any }) {
  const { formData, updateForm, nextStep } = onboarding;
  const [errors, setErrors] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, []);

  const handleNext = () => {
    const newErrors = [];
    if (!formData.firstname.trim()) newErrors.push("First name is required.");
    if (!formData.lastname.trim()) newErrors.push("Last name is required.");
    if (!formData.about.trim()) newErrors.push("Bio/About is required.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors([]);
    nextStep();
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Personal Information</h1>
        <p className="text-gray-500 dark:text-gray-400">Tell us a bit about yourself. This will be shown on your public profile.</p>
      </div>

      <div className="flex-grow space-y-8 overflow-y-auto pb-6 pr-2">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 dark:bg-[#151515] rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-black dark:border-white">
            <img src={formData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-semibold text-black dark:text-white mb-1">Profile Photo</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">A clear photo builds trust with clients.</p>
            <button className="px-4 py-2 text-sm font-medium border border-black dark:border-white text-black dark:text-white rounded-full opacity-50 cursor-not-allowed">
              Upload New Photo
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-600 ml-3">(Coming soon)</span>
          </div>
        </div>

        {/* Read Only Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">Email Address</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input type="text" value={formData.email} disabled className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 rounded-xl border border-transparent cursor-not-allowed focus:outline-none" />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">Mobile Number</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input type="text" value={`${formData.countryCode} ${formData.mobileNumber}`} disabled className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 rounded-xl border border-transparent cursor-not-allowed focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">First Name <span className="text-gray-400">*</span></span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Jane"
                value={formData.firstname} 
                onChange={(e) => updateForm("firstname", e.target.value)}
                className={`w-full pl-12 pr-4 py-3 bg-transparent text-black dark:text-white rounded-xl border ${errors.some(e => e.includes("First")) ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-black dark:focus:border-white focus:outline-none transition-colors`} 
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">Last Name <span className="text-gray-400">*</span></span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Doe"
                value={formData.lastname} 
                onChange={(e) => updateForm("lastname", e.target.value)}
                className={`w-full pl-12 pr-4 py-3 bg-transparent text-black dark:text-white rounded-xl border ${errors.some(e => e.includes("Last")) ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-black dark:focus:border-white focus:outline-none transition-colors`} 
              />
            </div>
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">Bio / About You <span className="text-gray-400">*</span></span></label>
          <div className="relative">
            <div className="absolute top-4 left-4 flex items-start pointer-events-none text-gray-400">
              <FileText size={18} />
            </div>
            <textarea 
              placeholder="Tell clients about your experience, specialties, and why they should choose you..."
              value={formData.about} 
              onChange={(e) => updateForm("about", e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-transparent text-black dark:text-white rounded-xl border ${errors.some(e => e.includes("Bio")) ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-black dark:focus:border-white focus:outline-none transition-colors min-h-[120px]`}
            ></textarea>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-sm p-4 rounded-xl border border-red-200 dark:border-red-900/50">
            <ul className="space-y-1">
              {errors.map((err, i) => <li key={i}>• {err}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-8 mt-auto flex justify-end">
        <button onClick={handleNext} className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-full hover:opacity-80 transition-opacity">
          Next Step
        </button>
      </div>
    </div>
  );
}
