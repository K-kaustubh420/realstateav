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
    { num: 1, title: "Agency Basics", desc: "Name, About & Website" },
    { num: 2, title: "Location Details", desc: "Contact & GPS Coordinates" },
    { num: 3, title: "Branding & Legal", desc: "Logos & GST Information" },
    { num: 4, title: "Review & Submit", desc: "Finalize your agency creation" },
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
    <div className="relative flex flex-row justify-between items-center md:items-start md:flex-col md:grow md:pl-2 w-full pt-2 md:pt-0">
      {/* ---------------- DESKTOP (Vertical) ---------------- */}
      <div className="absolute left-6 top-8 bottom-8 w-[1px] bg-zinc-800 rounded-full hidden md:block" />
      
      <div 
        ref={vLineRef}
        className="absolute left-6 top-8 w-[2px] rounded-full hidden md:block -ml-[0.5px]"
        style={{
          background: "linear-gradient(to bottom, #D4AF37, #F59E0B)",
          boxShadow: "0 0 10px rgba(212, 175, 55, 0.4)",
          height: "0%"
        }}
      />

      <div 
        ref={vGlowRef}
        className="absolute left-6 -translate-x-1/2 w-4 h-4 rounded-full bg-[#D4AF37] top-8 hidden md:block border-4 border-zinc-950"
        style={{
          boxShadow: "0 0 16px 6px rgba(212, 175, 55, 0.3)",
        }}
      />

      {/* ---------------- MOBILE (Horizontal) ---------------- */}
      <div className="absolute top-1/2 left-[8px] right-[8px] md:hidden -translate-y-1/2">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-zinc-800 rounded-full" />
        
        <div 
          ref={hLineRef}
          className="absolute top-0 left-0 h-[2px] -mt-[0.5px] rounded-full"
          style={{
            background: "linear-gradient(to right, #D4AF37, #F59E0B)",
            boxShadow: "0 0 10px rgba(212, 175, 55, 0.4)",
            width: "0%"
          }}
        />

        <div 
          ref={hGlowRef}
          className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#D4AF37] border-4 border-zinc-950"
          style={{
            boxShadow: "0 0 16px 6px rgba(212, 175, 55, 0.3)",
          }}
        />
      </div>

      {/* ---------------- STEPS ---------------- */}
      <div className="flex flex-row md:flex-col justify-between w-full h-full relative z-10">
        {steps.map((step) => {
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;

          return (
            <div key={step.num} className="relative z-10 flex items-start md:mb-12 last:mb-0 group cursor-default">
              <div 
                className={`rounded-full flex items-center justify-center shrink-0 transition-all duration-500
                  w-6 h-6 md:w-12 md:h-12 border-[2px]
                  ${isCompleted 
                    ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]" 
                    : isCurrent 
                      ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-500"}
                `}
              >
                <span className="hidden md:inline text-sm font-bold tracking-tight">
                  {isCompleted ? "✓" : step.num}
                </span>
              </div>
              
              <div className="hidden md:flex ml-6 flex-col pt-1.5 transition-all duration-500">
                <h3 className={`font-bold text-base transition-colors duration-500
                  ${isCompleted || isCurrent ? "text-white" : "text-zinc-500 group-hover:text-zinc-400"}
                `}>
                  {step.title}
                </h3>
                <span className={`text-sm mt-1 transition-colors duration-500 leading-snug
                  ${isCompleted || isCurrent ? "text-zinc-400" : "text-zinc-600"}
                `}>
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
