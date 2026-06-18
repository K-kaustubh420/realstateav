"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const vLineRef = useRef<HTMLDivElement>(null);
  const vGlowRef = useRef<HTMLDivElement>(null);
  const hLineRef = useRef<HTMLDivElement>(null);
  const hGlowRef = useRef<HTMLDivElement>(null);

  const steps = [
    { num: 1, title: "Personal information", desc: "Add your personal information" },
    { num: 2, title: "Intent & Interests", desc: "Tell us what you are looking for" },
    { num: 3, title: "Location Details", desc: "Set your default location" },
    { num: 4, title: "Review & Submit", desc: "Finalize your profile setup" },
  ];

  useEffect(() => {
    const totalSteps = steps.length;
    const percentage = Math.max(0, ((currentStep - 1) / (totalSteps - 1)) * 100);
    
    // Vertical animation (Desktop/Tablet)
    if (vLineRef.current && vGlowRef.current) {
      gsap.to(vLineRef.current, {
        height: `${percentage}%`,
        duration: 0.8,
        ease: "power3.inOut",
      });
      
      gsap.to(vGlowRef.current, {
        top: `${percentage}%`,
        duration: 0.8,
        ease: "power3.inOut",
      });
    }

    // Horizontal animation (Mobile)
    if (hLineRef.current && hGlowRef.current) {
      gsap.to(hLineRef.current, {
        width: `${percentage}%`,
        duration: 0.8,
        ease: "power3.inOut",
      });
      
      gsap.to(hGlowRef.current, {
        left: `${percentage}%`,
        duration: 0.8,
        ease: "power3.inOut",
      });
    }
  }, [currentStep, steps.length]);

  return (
    <div className="relative flex flex-row justify-between items-center md:items-start md:flex-col md:flex-grow md:pl-2 w-full pt-2 md:pt-0">
      {/* ---------------- DESKTOP (Vertical) ---------------- */}
      {/* Background Track line */}
      <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-800 rounded-full hidden md:block" />
      
      {/* Animated Golden Line */}
      <div 
        ref={vLineRef}
        className="absolute left-6 top-6 w-0.5 rounded-full hidden md:block"
        style={{
          background: "linear-gradient(to bottom, #FFD700, #FFA500)",
          boxShadow: "0 0 8px rgba(255, 215, 0, 0.6)",
          height: "0%"
        }}
      />

      {/* Animated Golden Glow Dot */}
      <div 
        ref={vGlowRef}
        className="absolute left-[24px] -translate-x-1/2 w-3 h-3 rounded-full bg-[#FFD700] top-6 hidden md:block"
        style={{
          boxShadow: "0 0 12px 4px rgba(255, 215, 0, 0.4)",
        }}
      />

      {/* ---------------- MOBILE (Horizontal) ---------------- */}
      <div className="absolute top-1/2 left-[8px] right-[8px] md:hidden -translate-y-1/2">
        {/* Background Track line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 rounded-full" />
        
        {/* Animated Golden Line */}
        <div 
          ref={hLineRef}
          className="absolute top-0 left-0 h-0.5 rounded-full"
          style={{
            background: "linear-gradient(to right, #FFD700, #FFA500)",
            boxShadow: "0 0 8px rgba(255, 215, 0, 0.6)",
            width: "0%"
          }}
        />

        {/* Animated Golden Glow Dot */}
        <div 
          ref={hGlowRef}
          className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FFD700]"
          style={{
            boxShadow: "0 0 12px 4px rgba(255, 215, 0, 0.4)",
          }}
        />
      </div>

      {/* ---------------- STEPS ---------------- */}
      {steps.map((step) => {
        const isCompleted = currentStep > step.num;
        const isCurrent = currentStep === step.num;

        return (
          <div key={step.num} className="relative z-10 flex items-start md:mb-10 last:mb-0">
            {/* Step Number Circle (Desktop) / Dot (Mobile) */}
            <div 
              className={`rounded-full flex items-center justify-center shrink-0 transition-colors duration-500
                w-4 h-4 md:w-9 md:h-9 md:border-2
                ${isCompleted || isCurrent 
                  ? "bg-black text-white md:border-black dark:bg-white dark:text-black md:dark:border-white" 
                  : "bg-gray-300 text-gray-400 border-transparent md:bg-white md:border-gray-200 dark:bg-gray-700 md:dark:bg-[#111] md:dark:border-gray-800 md:dark:text-gray-500"}
              `}
            >
              <span className="hidden md:inline text-sm font-bold">{isCompleted ? "✓" : step.num}</span>
            </div>
            
            {/* Step Content (Hidden on Mobile) */}
            <div className="hidden md:flex ml-6 flex-col pt-1">
              <h3 className={`font-bold text-sm lg:text-base transition-colors duration-500
                ${isCompleted || isCurrent ? "text-black dark:text-white" : "text-gray-400 dark:text-gray-600"}
              `}>
                Step {step.num}
              </h3>
              <p className={`font-semibold text-sm lg:text-base transition-colors duration-500
                ${isCompleted || isCurrent ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}
              `}>
                {step.title}
              </p>
              <span className={`text-xs mt-1 transition-colors duration-500
                ${isCompleted || isCurrent ? "text-gray-500 dark:text-gray-400" : "text-gray-400 dark:text-gray-700"}
              `}>
                {step.desc}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
