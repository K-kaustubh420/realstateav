"use client";

import { useEffect, useState } from "react";
import { fetchAgentActivity, Activity } from "@/lib/agents/activityService";
import { MessageCircle, User, MapPin, DollarSign, Bell } from "lucide-react";

export default function ActivityFeed({ agentUid }: { agentUid: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchAgentActivity(agentUid);
      setActivities(data);
    }
    load();
  }, [agentUid]);

  const getIcon = (type: string) => {
    switch (type) {
      case "lead": return <User className="w-4 h-4 text-blue-400" />;
      case "message": return <MessageCircle className="w-4 h-4 text-green-400" />;
      case "visit": return <MapPin className="w-4 h-4 text-orange-400" />;
      case "deal": return <DollarSign className="w-4 h-4 text-purple-400" />;
      default: return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <aside className="w-full xl:w-[380px] shrink-0 border-l border-white/10 bg-[#050505] flex flex-col p-6 sticky top-0 xl:h-screen overflow-y-auto hidden lg:flex">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white tracking-wide">Activity Center</h2>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Real-time Updates</p>
      </div>

      <div className="space-y-6 flex-1">
        {activities.map((act) => (
          <div key={act.id} className="relative pl-6 border-l border-white/10">
            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-[#111] border border-white/10 flex items-center justify-center">
              {getIcon(act.type)}
            </div>
            <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-semibold text-white">{act.title}</h3>
                <span className="text-[10px] text-zinc-500 font-medium">{formatTime(act.timestamp)}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{act.description}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
