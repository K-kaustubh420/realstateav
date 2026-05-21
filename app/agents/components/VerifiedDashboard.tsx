"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Home, MessageCircle, User, LogOut } from "lucide-react";
import { agentLogout } from "../../../lib/agentAuth";
import AgentAgencySection from "@/app/agents/components/AgentAgencySection";
import AgentPropertiesSection from "@/app/agents/components/AgentPropertiesSection";

type VerifiedDashboardProps = {
  email: string;
};

const tabs = [
  { key: "agency", label: "Agency", icon: Building2 },
  { key: "properties", label: "Properties", icon: Home },
  { key: "chats", label: "Chats", icon: MessageCircle },
  { key: "profile", label: "Profile", icon: User },
];

export default function VerifiedDashboard({ email }: VerifiedDashboardProps) {
  const [activeTab, setActiveTab] = useState("agency");
  const router = useRouter();
  const activeSection = tabs.find((tab) => tab.key === activeTab);

  const handleLogout = async () => {
    await agentLogout();
    router.push("/");
  };

  return (
    <div className="w-full h-full">
      <div className="" />
      <div className="relative grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-zinc-950/85 p-6 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.65)] backdrop-blur-2xl lg:sticky lg:top-6">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/12 text-[#D4AF37] shadow-[0_18px_60px_-40px_rgba(212,175,55,0.8)]">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.36em] text-slate-500">Prop-tech</p>
              <p className="text-2xl font-semibold leading-tight text-white">Agent Studio</p>
            </div>
          </div>

          <nav className="space-y-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`group flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left text-sm transition duration-300 ${
                    active
                      ? "border-[#D4AF37]/25 bg-[#D4AF37]/10 text-white shadow-[inset_0_0_0_1px_rgba(212,175,55,0.15)]"
                      : "border-transparent bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Icon className={`h-5 w-5 transition ${active ? "text-[#D4AF37]" : "text-slate-400 group-hover:text-white"}`} />
                  <span className="font-medium tracking-wide">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300 shadow-[0_16px_45px_-20px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">Signed in as</p>
            <p className="mt-4 break-all text-sm font-semibold text-white">{email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-3 text-sm font-semibold text-[#D4AF37] transition duration-300 hover:bg-[#D4AF37]/15"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/85 p-8 shadow-[0_30px_90px_-55px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:p-10">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.36em] text-slate-500">Verified Agent Dashboard</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">A refined dashboard for premium real estate teams.</h1>
              </div>
              <div className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#D4AF37]">
                Verified access
              </div>
            </div>
            <p className="mt-5 max-w-2xl text-slate-400">Corporate-grade interface designed to support high-end listings and luxury client workflows.</p>
          </div>

          <div className="grid gap-6">
            <section className="rounded-2xl border border-white/10 bg-zinc-950/85 p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.72)] backdrop-blur-2xl sm:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{activeSection?.label}</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">{activeSection?.label}</h2>
                </div>
                <div className="rounded-full border border-[#D4AF37]/15 bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#D4AF37]">Live agency workspace</div>
              </div>

              <div className="mt-8">
                {activeTab === "agency" ? (
                  <AgentAgencySection email={email} />
                ) : activeTab === "properties" ? (
                  <AgentPropertiesSection email={email} />
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/55 p-8 shadow-[0_18px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-10">
                    <p className="text-lg font-medium text-white">{activeSection?.label} tools are coming soon.</p>
                    <p className="mt-4 max-w-2xl text-slate-400">This section will expand into a dedicated workflow for {activeSection?.label.toLowerCase()} management.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
