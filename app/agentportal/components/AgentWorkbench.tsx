"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Home, MessageCircle, User, LogOut, LayoutDashboard, Settings, MapPin, FileEdit, Share2, Plus } from "lucide-react";
import { agentLogout } from "../../../auth/agentAuth";
import AgentAgencySection from "./AgentAgencySection";
import AgentPropertiesSection from "./AgentPropertiesSection";
import AgentChatsSection from "./AgentChatsSection";
import AgentDashboardSection from "./AgentDashboardSection";
import AgentSettingsSection from "./AgentSettingsSection";
import ActivityFeed from "./ActivityFeed";
import { Agent } from "@/utils/user";
import { User as FirebaseUser } from "firebase/auth";
import dynamic from "next/dynamic";

const Preference = dynamic(() => import("./Preference"), { ssr: false });

type AgentWorkbenchProps = {
  agentData: Agent & { id?: string };
  user: FirebaseUser;
};

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "properties", label: "Listings", icon: Home },
  { key: "leads", label: "Leads", icon: User },
  { key: "chats", label: "Messages", icon: MessageCircle },
  { key: "analytics", label: "Analytics", icon: Building2 }, // Placeholder icon
  { key: "preferences", label: "Preferences", icon: MapPin },
  { key: "agency", label: "Agency", icon: Building2 },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function AgentWorkbench({ agentData: initialAgentData, user }: AgentWorkbenchProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [agentData, setAgentData] = useState<Agent & { id?: string }>(initialAgentData);
  const router = useRouter();

  const handleLogout = async () => {
    await agentLogout();
    router.push("/");
  };

  const handleShareProfile = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/share/agentprofile?agentid=${encodeURIComponent(user.uid)}&share=true`;
    navigator.clipboard.writeText(link);
    alert("Profile link copied!");
  };

  return (
    <div className="flex w-full h-full min-h-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* Left Sidebar */}
      <aside className="w-[280px] shrink-0 border-r border-white/10 bg-[#050505] flex flex-col p-6 sticky top-0 h-screen overflow-y-auto hidden md:flex">
        
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-black font-bold text-lg">
            BM
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold tracking-widest text-white uppercase">Arvista</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">Agent Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${active ? "text-black" : "text-zinc-400"}`} />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto space-y-2 pt-8">
          <button
            onClick={handleShareProfile}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-all border border-white/10"
          >
            <Share2 className="h-4 w-4 text-zinc-400" />
            Share Profile
          </button>
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-w-0 bg-[#050505]">
        {/* Render Active View */}
        <div className="min-h-full">
          
          {/* KYC Unverified Banner */}
          {agentData.id_verify !== "verified" && agentData.id_verify !== "pending" && (
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-red-500 font-bold flex items-center gap-2">
                  Action Required: Identity Verification
                </h3>
                <p className="text-red-200/80 text-sm mt-1">
                  Your agent profile is unverified. Please complete your ID verification to unlock all features.
                </p>
              </div>
              <button 
                onClick={() => router.push(`/id_verification/agent_${user.uid}?uid=${user.uid}`)}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
              >
                Verify ID Now
              </button>
            </div>
          )}

          {activeTab === "dashboard" && <AgentDashboardSection agent={agentData} />}
          {activeTab === "agency" && <AgentAgencySection uid={user.uid} email={user.email!} />}
          {activeTab === "properties" && <AgentPropertiesSection uid={user.uid} email={user.email!} />}
          {activeTab === "chats" && <AgentChatsSection email={user.email!} />}
          {activeTab === "preferences" && (
            <div className="p-8 lg:p-12 max-w-4xl mx-auto"><Preference agent={agentData as any} setAgent={setAgentData as any} /></div>
          )}
          {activeTab === "settings" && (
            <div className="p-8 lg:p-12 max-w-4xl mx-auto"><AgentSettingsSection agent={agentData as any} setAgent={setAgentData as any} /></div>
          )}
          {activeTab === "leads" && (
            <div className="p-8 lg:p-12"><h1 className="text-3xl font-serif text-white">Leads Center</h1><p className="text-zinc-400">Manage your leads here.</p></div>
          )}
          {activeTab === "analytics" && (
            <div className="p-8 lg:p-12"><h1 className="text-3xl font-serif text-white">Analytics</h1><p className="text-zinc-400">View performance metrics.</p></div>
          )}
        </div>
      </main>

      {/* Right Sidebar Activity Feed */}
      <ActivityFeed agentUid={agentData.uid || agentData.id || ""} />

    </div>
  );
}
