import React, { useMemo, useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { removeAgent, rotateInviteCode, approveAgentRequest, rejectAgentRequest } from "../../../../lib/agency/manageAgents";
import { AgencyAgent, AgencyJoinRequest, AgencyProperty } from "../../../../lib/agency/agency";
import { CheckCircle, XCircle, RefreshCcw, UserMinus, ShieldCheck } from "lucide-react";

type Props = {
  agencyId: string;
  inviteCode: string;
  agents: AgencyAgent[];
  joinRequests: AgencyJoinRequest[];
  ownerId: string;
  properties: AgencyProperty[];
  onUpdate: () => Promise<void>;
  onError: (msg: string) => void;
  onFeedback: (msg: string) => void;
};

export default function ManagingAgents({
  agencyId,
  inviteCode,
  agents,
  joinRequests,
  ownerId,
  properties,
  onUpdate,
  onError,
  onFeedback,
}: Props) {
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        gsap.utils.toArray('.gsap-section', containerRef.current),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
      gsap.fromTo(
        gsap.utils.toArray('.gsap-card', containerRef.current),
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)', delay: 0.2 }
      );
    }
  }, []);

  const groupedProperties = useMemo(() => {
    return properties.reduce<Record<string, AgencyProperty[]>>((acc, property) => {
      const key = property.agentId || "unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(property);
      return acc;
    }, {});
  }, [properties]);

  const handleRotateCode = async () => {
    setLoading(true);
    try {
      await rotateInviteCode(agencyId);
      await onUpdate();
      onFeedback("Invite code rotated successfully.");
    } catch (err: any) {
      onError(err?.message || "Failed to rotate code.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (agentId: string, name: string) => {
    const confirm = window.confirm(`Remove ${name} from this agency? Their agency properties will transfer to the owner.`);
    if (!confirm) return;
    setLoading(true);
    try {
      await removeAgent(agencyId, agentId);
      await onUpdate();
      onFeedback(`${name} has been removed from the agency.`);
    } catch (err: any) {
      onError(err?.message || "Failed to remove agent.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: AgencyJoinRequest) => {
    setLoading(true);
    try {
      await approveAgentRequest(agencyId, request);
      await onUpdate();
      onFeedback(`${request.name} has been approved.`);
    } catch (err: any) {
      onError(err?.message || "Failed to approve request.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (request: AgencyJoinRequest) => {
    setLoading(true);
    try {
      await rejectAgentRequest(agencyId, request);
      await onUpdate();
      onFeedback(`Request from ${request.name} was rejected.`);
    } catch (err: any) {
      onError(err?.message || "Failed to reject request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-10 relative">
      {/* GSAP Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl">
           <RefreshCcw className="h-8 w-8 text-[#D4AF37] animate-spin" />
        </div>
      )}

      {/* Invite Code Header Section */}
      <div className="gsap-section flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-3xl border border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/5 to-transparent p-6 md:p-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldCheck className="text-[#D4AF37]" /> Invite New Agents</h2>
          <p className="mt-1 text-sm text-slate-400">Share this code with agents so they can request to join your agency.</p>
        </div>
        <div className="flex items-center gap-4 bg-zinc-950/80 rounded-2xl border border-white/5 p-2 pr-4 shadow-inner">
          <div className="px-4 py-2">
            <p className="font-mono text-xl font-bold tracking-widest text-white">{inviteCode || "—"}</p>
          </div>
          <button
            onClick={handleRotateCode}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[#D4AF37] p-3 text-sm font-semibold text-black transition-all hover:bg-[#c4a133] hover:-translate-y-0.5 shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 disabled:hover:translate-y-0"
            title="Generate a new code"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Join Requests */}
      {joinRequests && joinRequests.length > 0 && (
        <div className="gsap-section space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Pending Requests ({joinRequests.length})</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {joinRequests.map((request) => (
              <div key={request.agentId} className="flex items-center justify-between rounded-2xl border border-white/5 bg-zinc-900/50 p-5">
                <div>
                  <p className="font-semibold text-white">{request.name}</p>
                  <p className="text-sm text-slate-400">{request.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(request)} disabled={loading} className="rounded-full bg-emerald-500/10 p-2 text-emerald-400 transition hover:bg-emerald-500/20" title="Approve">
                    <CheckCircle className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleReject(request)} disabled={loading} className="rounded-full bg-rose-500/10 p-2 text-rose-400 transition hover:bg-rose-500/20" title="Reject">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Agents (Testimonial UI Style) */}
      <div className="gsap-section space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-lg font-semibold text-white">Agency Team</h3>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">{agents.length} members</span>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {agents.map((agent) => {
            const agentProperties = groupedProperties[agent.agentId] || [];
            const isOwner = agent.agentId === ownerId;

            return (
              <div key={agent.agentId} className="gsap-card relative flex flex-col rounded-3xl border border-white/5 bg-zinc-900/40 p-6 shadow-sm transition-all hover:bg-zinc-900/80">
                {isOwner && (
                  <div className="absolute right-4 top-4 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Owner
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  {/* Testimonial Avatar */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border-2 border-white/10 shadow-inner">
                    <span className="text-xl font-bold text-white">{agent.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{agent.name}</h4>
                    <p className="text-sm text-slate-400">{agent.email}</p>
                    <p className="mt-1 text-xs text-slate-500">Joined {agent.joinedAt ? new Date(agent.joinedAt).toLocaleDateString() : "Unknown"}</p>
                  </div>
                </div>

                <div className="mt-6 flex-grow rounded-2xl bg-zinc-950/50 p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Listed Properties</p>
                    <span className="font-mono text-sm text-[#D4AF37]">{agentProperties.length}</span>
                  </div>
                  {/* Placeholder for properties visual representation */}
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: agentProperties.length > 0 ? '100%' : '0%' }} />
                  </div>
                </div>

                {!isOwner && (
                  <button 
                    onClick={() => handleRemove(agent.agentId, agent.name)} 
                    disabled={loading}
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-rose-500/10"
                  >
                    <UserMinus className="h-4 w-4" /> Remove Agent
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
