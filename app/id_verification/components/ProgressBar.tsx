import { Check } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const steps = [
    { num: 1, label: "Personal Details" },
    { num: 2, label: "Documents" },
    { num: 3, label: "Selfie" },
    { num: 4, label: "Review" },
  ];

  return (
    <div className="flex flex-col gap-8 ml-4">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.num;
        const isCurrent = currentStep === step.num;
        const isUpcoming = currentStep < step.num;

        return (
          <div key={step.num} className="relative flex items-center gap-4 group">
            {/* The vertical connecting line */}
            {index !== steps.length - 1 && (
              <div 
                className="absolute left-4 top-10 w-0.5 h-10 -ml-[1px] rounded-full overflow-hidden bg-white/10"
              >
                <div 
                  className="w-full h-full bg-[#D4AF37] transition-all duration-700 ease-in-out"
                  style={{
                    transformOrigin: 'top',
                    transform: currentStep > step.num ? 'scaleY(1)' : 'scaleY(0)'
                  }}
                />
              </div>
            )}

            {/* Step Circle */}
            <div 
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 z-10
                ${isCompleted ? "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]" : ""}
                ${isCurrent ? "bg-black border-2 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]" : ""}
                ${isUpcoming ? "bg-zinc-900 border border-zinc-700 text-zinc-500" : ""}
              `}
            >
              {isCompleted ? <Check size={16} strokeWidth={3} /> : step.num}
            </div>

            {/* Label */}
            <span 
              className={`
                text-sm font-semibold transition-all duration-300
                ${isCompleted || isCurrent ? "text-white" : "text-zinc-500"}
              `}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
