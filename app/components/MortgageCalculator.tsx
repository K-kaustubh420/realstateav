"use client";

import React, { useState, useEffect } from "react";
import { Calculator, Percent, DollarSign, Calendar } from "lucide-react";

interface MortgageCalculatorProps {
  initialPrice?: number;
  className?: string;
}

export default function MortgageCalculator({ initialPrice = 500000, className = "" }: MortgageCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState(initialPrice);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(5.5);
  const [loanTerm, setLoanTerm] = useState(30);

  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);

  useEffect(() => {
    // Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const principal = propertyPrice - (propertyPrice * downPaymentPct) / 100;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfMonths = loanTerm * 12;

    if (principal > 0 && monthlyRate > 0 && numberOfMonths > 0) {
      const emiValue =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
        (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

      const totalAmountPayable = emiValue * numberOfMonths;
      const totalInterestPayable = totalAmountPayable - principal;

      setEmi(Math.round(emiValue));
      setTotalPayable(Math.round(totalAmountPayable));
      setTotalInterest(Math.round(totalInterestPayable));
    } else {
      setEmi(0);
      setTotalPayable(0);
      setTotalInterest(0);
    }
  }, [propertyPrice, downPaymentPct, interestRate, loanTerm]);

  const downPaymentValue = (propertyPrice * downPaymentPct) / 100;
  const principal = propertyPrice - downPaymentValue;

  return (
    <div className={`bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 lg:p-8 shadow-2xl ${className}`}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
          <Calculator size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Mortgage Calculator</h2>
          <p className="text-sm text-zinc-400">Estimate your monthly payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Property Price */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <DollarSign size={16} className="text-zinc-500" /> Property Price
              </label>
              <span className="text-[#D4AF37] font-bold">${propertyPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="5000000"
              step="10000"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full accent-[#D4AF37]"
            />
          </div>

          {/* Down Payment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Percent size={16} className="text-zinc-500" /> Down Payment
              </label>
              <div className="text-right">
                <span className="text-[#D4AF37] font-bold">{downPaymentPct}%</span>
                <span className="text-xs text-zinc-500 block">
                  ${downPaymentValue.toLocaleString()}
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="1"
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full accent-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Interest Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-zinc-300">Interest Rate</label>
                <span className="text-[#D4AF37] font-bold">{interestRate}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="15"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-[#D4AF37]"
              />
            </div>

            {/* Loan Term */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-zinc-300 flex items-center gap-1">
                  <Calendar size={14} className="text-zinc-500" /> Loan Term
                </label>
                <span className="text-[#D4AF37] font-bold">{loanTerm} Years</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full accent-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-5">
          <div className="bg-zinc-950/80 rounded-2xl p-6 border border-zinc-800 h-full flex flex-col justify-between relative overflow-hidden">
            {/* Background glowing orb */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-[60px] pointer-events-none"></div>

            <div>
              <p className="text-zinc-400 text-sm font-medium mb-2">Estimated Monthly EMI</p>
              <div className="flex items-end gap-1 mb-6">
                <h3 className="text-5xl font-black text-white">${emi.toLocaleString()}</h3>
                <span className="text-zinc-500 mb-2">/mo</span>
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Principal Amount</span>
                  <span className="text-white font-semibold">${principal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Total Interest</span>
                  <span className="text-red-400 font-semibold">${totalInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Total Payable</span>
                  <span className="text-white font-bold">${totalPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 bg-gradient-to-r from-[#D4AF37] to-[#B38F2B] hover:from-[#E5C158] hover:to-[#D4AF37] text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transform hover:-translate-y-1">
              Apply for Pre-Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
