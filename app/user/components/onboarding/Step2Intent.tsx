"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Compass, Home, Key, Search, DollarSign, UserCheck } from "lucide-react";

export default function Step2Intent({ onboarding }: { onboarding: any }) {
  const { formData, updateForm, nextStep, prevStep } = onboarding;
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
    if (!formData.intent) newErrors.push("Please select your primary intent.");
    if (formData.exploreintent.length === 0) newErrors.push("Please select at least one interest.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors([]);
    nextStep();
  };

  const intents = [
    { id: "buyer", label: "Buyer", icon: DollarSign, desc: "Looking to buy property" },
    { id: "seller", label: "Seller", icon: Key, desc: "Looking to sell property" },
    { id: "renter", label: "Renter", icon: Home, desc: "Looking to rent property" },
    { id: "homeowner", label: "Homeowner", icon: UserCheck, desc: "Managing my property" },
    { id: "researcher", label: "Researcher", icon: Search, desc: "Just browsing the market" },
  ];

  const toggleExploreIntent = (intent: string) => {
    const current = formData.exploreintent;
    if (current.includes(intent)) {
      updateForm("exploreintent", current.filter((i: string) => i !== intent));
    } else {
      updateForm("exploreintent", [...current, intent]);
    }
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Your Intent</h1>
        <p className="text-gray-500 dark:text-gray-400">What brings you here? This helps us tailor your experience.</p>
      </div>

      <div className="flex-grow space-y-8 overflow-y-auto pb-6 pr-2">
        
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Primary Goal <span className="text-red-500">*</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {intents.map((item) => {
              const Icon = item.icon;
              const isSelected = formData.intent === item.id;
              return (
                <div 
                  key={item.id}
                  onClick={() => updateForm("intent", item.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-start gap-3
                    ${isSelected 
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-lg scale-[1.02]" 
                      : "border-gray-200 bg-white text-gray-800 dark:border-gray-800 dark:bg-[#111] dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    }
                  `}
                >
                  <Icon size={24} className={isSelected ? "text-white dark:text-black" : "text-gray-500"} />
                  <div>
                    <h4 className="font-bold">{item.label}</h4>
                    <p className={`text-xs mt-1 ${isSelected ? "text-gray-300 dark:text-gray-700" : "text-gray-500"}`}>{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
            <Compass size={20} className="text-gray-500" />
            What else are you interested in? <span className="text-red-500">*</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {["Residential", "Commercial", "Land", "Luxury", "Investment", "Off-plan", "Short-term Rentals", "Long-term Rentals"].map((interest) => {
              const isSelected = formData.exploreintent.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => toggleExploreIntent(interest)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors
                    ${isSelected
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                      : "bg-transparent text-gray-700 border-gray-300 hover:border-gray-400 dark:text-gray-300 dark:border-gray-700 dark:hover:border-gray-500"
                    }
                  `}
                >
                  {interest}
                </button>
              )
            })}
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

      <div className="pt-8 mt-auto flex justify-between">
        <button onClick={prevStep} className="px-8 py-3 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-semibold rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          Back
        </button>
        <button onClick={handleNext} className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-full hover:opacity-80 transition-opacity">
          Next Step
        </button>
      </div>
    </div>
  );
}
