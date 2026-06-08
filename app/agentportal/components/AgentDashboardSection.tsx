"use client";

import { useEffect, useState } from "react";
import { Agent } from "@/utils/user";
import { fetchAgentDrafts } from "@/lib/agents/dashboardService";
import { fetchAgentLeads, Lead } from "@/lib/agents/leadService";
import { fetchAgentTasks, AgentTask } from "@/lib/agents/taskService";
import { fetchAgentAnalytics, AnalyticsData } from "@/lib/agents/analyticsService";
import { Property } from "@/utils/property";
import { AlertCircle, Plus, UploadCloud, MapPin, Building2, CheckCircle2, Circle } from "lucide-react";

interface AgentDashboardSectionProps {
  agent: Agent & { id?: string };
}

export default function AgentDashboardSection({ agent }: AgentDashboardSectionProps) {
  const [drafts, setDrafts] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const isIdVerified = agent.id_verify === "verified";
  const isMembershipActive = agent.membership?.status === "active";

  useEffect(() => {
    async function loadData() {
      if (!agent.uid && !agent.id) return;
      const uid = agent.uid || agent.id!;
      
      const [fetchedDrafts, fetchedLeads, fetchedTasks, fetchedAnalytics] = await Promise.all([
        fetchAgentDrafts(uid, agent.preferredLocations || []),
        fetchAgentLeads(uid),
        fetchAgentTasks(uid),
        fetchAgentAnalytics(uid),
      ]);
      
      setDrafts(fetchedDrafts);
      setLeads(fetchedLeads);
      setTasks(fetchedTasks);
      setAnalytics(fetchedAnalytics);
    }
    loadData();
  }, [agent]);

  const handleAction = (action: string) => {
    if (!isIdVerified) {
      alert("Action Denied: You must verify your ID before proceeding.");
      return;
    }
    if (!isMembershipActive) {
      alert("Action Denied: Your membership is not active.");
      return;
    }
    alert(`${action} triggered successfully!`);
  };

  const kanbanColumns = ["New", "Contacted", "Site Visit", "Negotiation", "Closed"];

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white mb-1">
            Welcome back, {agent.name?.firstname || agent.fullName?.split(" ")[0] || "Agent"}
          </h1>
          <p className="text-zinc-400">Here's your executive summary for today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleAction("Import Property")}
            className="px-4 py-2 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" /> Import Property
          </button>
          <button 
            onClick={() => handleAction("Add New Listing")}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black text-sm font-bold hover:bg-[#D4AF37]/90 shadow-lg shadow-[#D4AF37]/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Listing
          </button>
        </div>
      </div>

      {/* Verification Alerts */}
      {(!isIdVerified || !isMembershipActive) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-500 font-bold text-sm">Action Required</h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <p className="text-red-400/80 text-sm mt-1">
                {!isIdVerified ? "Your ID is not verified. " : ""}
                {!isMembershipActive ? "Your membership is inactive. You cannot add listings or accept leads until this is resolved." : ""}
              </p>
              {!isMembershipActive && (
                <button 
                  onClick={() => alert("Redirecting to payment gateway...")}
                  className="shrink-0 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Lead Pipeline Board */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Lead Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(status => (
            <div key={status} className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 min-w-[200px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{status}</h3>
                <span className="bg-white/5 text-zinc-300 text-[10px] px-2 py-0.5 rounded-full">
                  {leads.filter(l => l.status === status).length}
                </span>
              </div>
              <div className="space-y-3">
                {leads.filter(l => l.status === status).map(lead => (
                  <div key={lead.id} className="bg-black border border-white/5 p-3 rounded-xl hover:border-white/10 transition-colors cursor-pointer">
                    <p className="text-sm font-semibold text-white truncate">{lead.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-1 truncate">{lead.propertyOfInterest}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 & 6: Drafts and Tasks */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        <section className="lg:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4">Continue Working</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {drafts.slice(0, 4).map((draft, i) => (
              <div key={draft.id || i} className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 flex gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
                <div className="w-20 h-20 bg-zinc-900 rounded-xl shrink-0 overflow-hidden">
                  {draft.images?.[0] ? (
                    <img src={draft.images[0]} alt="Property" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <h3 className="text-sm font-bold text-white truncate">{draft.title || "Untitled Draft"}</h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3 h-3" /> {draft.city || "Unknown Location"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-full font-bold">Draft</span>
                    <button className="text-xs text-zinc-400 hover:text-white transition-colors">Resume &rarr;</button>
                  </div>
                </div>
              </div>
            ))}
            {drafts.length === 0 && (
              <div className="col-span-2 text-center py-8 bg-[#0f0f0f] border border-white/5 rounded-2xl">
                <p className="text-zinc-500 text-sm">No drafts pending.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-4">Today's Tasks</h2>
          <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-5 space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 group cursor-pointer">
                <div className="mt-0.5">
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-600 group-hover:text-[#D4AF37] transition-colors" />
                  )}
                </div>
                <p className={`text-sm ${task.completed ? "text-zinc-500 line-through" : "text-zinc-300 group-hover:text-white"}`}>
                  {task.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Section 4 & 5: Analytics & Agency */}
      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Business Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Leads</p>
              <p className="text-4xl font-serif text-white">{analytics?.totalLeads || 0}</p>
            </div>
            <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Active Listings</p>
              <p className="text-4xl font-serif text-white">{analytics?.activeListings || 0}</p>
            </div>
            <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Profile Views</p>
              <p className="text-4xl font-serif text-[#D4AF37]">{analytics?.totalViews?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-6">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Conversion</p>
              <p className="text-4xl font-serif text-white">{analytics?.conversionRate || 0}%</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-4">Target Markets</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {agent.preferredLocations?.map((loc, idx) => (
              <div key={idx} className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-sm font-bold text-white">{loc}</h3>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Listings: <span className="text-white font-medium">12</span></span>
                  <span className="text-zinc-500">Leads: <span className="text-white font-medium">28</span></span>
                </div>
              </div>
            ))}
            {(!agent.preferredLocations || agent.preferredLocations.length === 0) && (
              <div className="col-span-2 text-center py-10 bg-[#0f0f0f] border border-white/5 rounded-2xl">
                <MapPin className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm">No target markets set. Add them in Preferences.</p>
              </div>
            )}
          </div>
        </section>
      </div>

    </div>
  );
}
