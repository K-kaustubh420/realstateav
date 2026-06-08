"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Building2, CheckCircle2, Send, ShieldCheck } from "lucide-react";
import { getAgentData } from "@/lib/agents";
import {
  getAgentPendingRequest,
  getAgentPropertiesUnderAgency,
  leaveAgency,
  submitAgencyJoinRequest,
  getAgentActiveAgency,
  PendingAgencyRequest,
} from "@/lib/agents/joinAgency";
import { Agency, getAgencyById, AgencyProperty } from "@/lib/agency";
import { Agent } from "@/utils/user";

type AgentAgencySectionProps = {
  uid: string;
  email: string;
};

export default function AgentAgencySection({ uid, email }: AgentAgencySectionProps) {
  const [agentData, setAgentData] = useState<Agent | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [status, setStatus] = useState<"none" | "pending" | "accepted">("none");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState<PendingAgencyRequest | null>(null);

  const refreshAgentStatus = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!email) {
        setError("Missing agent email.");
        return;
      }
      const agent = await getAgentData(uid, email);
      if (!agent) {
        console.error("getAgentData returned null for", email);
        setError("Unable to find your agent profile.");
        return;
      }

      console.debug("agent doc:", agent);
      console.debug("agent.activeAgency:", (agent as any).activeAgency);

      // set agent state first
      setAgentData(agent);

      // pending request (if any)
      const pending = getAgentPendingRequest(agent);
      setPendingRequest(pending || null);

      // attempt to resolve active agency using centralized helper which
      // reads `agent.activeAgency.agencyId` in a consistent way
      let agencyRecord = null;
      try {
        agencyRecord = await getAgentActiveAgency(agent);
      } catch (err: any) {
        console.error("getAgentActiveAgency error:", err);
        setError(err?.message || "Failed to resolve active agency.");
      }
      if (agencyRecord) {
          setAgency(agencyRecord);
          if (agent.uid) {
            const agentProperties = await getAgentPropertiesUnderAgency(agencyRecord.agencyId, agent.uid);
            setProperties(agentProperties || []);
          } else {
            setProperties([]);
          }
          setStatus("accepted");
        } else if (pending) {
        setStatus("pending");
        setAgency(null);
        setProperties([]);
      } else {
        setStatus("none");
        setAgency(null);
        setProperties([]);
      }
    } catch (err: any) {
      console.error("refreshAgentStatus error:", err);
      setError(err?.message || "Unable to load agency information. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAgentStatus();
  }, [uid, email]);

  // subscribe to realtime changes on the agent document so approvals show up instantly
  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, "agents", uid);
    const unsub = onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) return;
        const agent = snap.data() as Agent;
        setAgentData(agent);
        const pending = getAgentPendingRequest(agent);
        setPendingRequest(pending || null);

        // if an active agency pointer exists, resolve it
        try {
          const agencyRecord = await getAgentActiveAgency(agent);
          if (agencyRecord) {
            setAgency(agencyRecord);
            if (agent.uid) {
              const agentProps = await getAgentPropertiesUnderAgency(agencyRecord.agencyId, agent.uid);
              setProperties(agentProps || []);
            } else {
              setProperties([]);
            }
            setStatus("accepted");
          } else if (pending) {
            setStatus("pending");
            setAgency(null);
            setProperties([]);
          } else {
            setStatus("none");
            setAgency(null);
            setProperties([]);
          }
        } catch (err) {
          // ignore snapshot-driven resolution errors; refresh can be used for retry
        }
      },
      (err) => {
        // snapshot listener error
      }
    );

    return () => unsub();
  }, [uid]);

  const handleSubmitJoin = async () => {
    if (!joinCode.trim()) {
      setError("Enter an invite code to request access.");
      return;
    }
    if (!agentData) return;

    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      await submitAgencyJoinRequest(joinCode, agentData);
      setMessage("Your request was sent. Waiting for agency approval.");
      setJoinCode("");
      await refreshAgentStatus();
    } catch (err: any) {
      setError(err?.message ?? "Unable to submit join request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveAgency = async () => {
    if (!agentData || !agency) return;
    const confirmed = window.confirm(
      `Leave ${agency.agencyName}? This will remove your membership and transfer any listed properties back to the agency owner.`
    );
    if (!confirmed) return;

    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      await leaveAgency(agentData);
      setMessage("You have left the agency.");
      await refreshAgentStatus();
    } catch (err: any) {
      setError(err?.message ?? "Unable to leave the agency.");
    } finally {
      setActionLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-10 text-center text-slate-300">
          Loading your agency workspace…
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 text-rose-100">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      );
    }

    if (status === "pending") {
      return (
        <div className="space-y-6 rounded-3xl border border-amber-500/15 bg-amber-500/5 p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Join request pending</h3>
              <p className="mt-2 text-sm text-slate-300">
                Your request to join <span className="font-semibold text-white">{pendingRequest?.agencyName}</span> is awaiting approval.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-slate-300">
            <p className="text-sm">Request sent on</p>
            <p className="mt-2 text-lg font-semibold text-white">{pendingRequest ? new Date(pendingRequest.requestedAt).toLocaleDateString() : "Unknown date"}</p>
          </div>
          <p className="text-sm text-slate-400">
            Once approved, the agency will appear in your agent dashboard and you can manage your listings directly from the team workspace.
          </p>
        </div>
      );
    }

    if (status === "accepted" && agency) {
      return (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/85 p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.72)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Agency membership</p>
                <h3 className="mt-3 text-3xl font-semibold text-white">{agency.agencyName}</h3>
                <p className="mt-2 text-sm text-slate-400">Managed by {agency.owner.name} ({agency.owner.email})</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Active member
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/85 p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.72)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Team activity</p>
                <h4 className="mt-2 text-2xl font-semibold text-white">Properties under your account</h4>
              </div>
              <div className="rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
                {properties.length} listed property{properties.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {properties.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-black/60 p-6 text-slate-300">
                  <p className="font-medium text-white">No properties are currently assigned to you in this agency.</p>
                  <p className="mt-2 text-sm text-slate-400">Any new listings will appear here once you are assigned as the listing agent.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {properties.map((property) => (
                    <div key={property.propertyId} className="rounded-3xl border border-white/10 bg-black/60 p-5">
                      <h5 className="text-lg font-semibold text-white">{property.propertyTitle || "Untitled property"}</h5>
                      <p className="mt-2 text-sm text-slate-400">Property ID: {property.propertyId}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/60 p-8 text-slate-300">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Remove membership</p>
                <h4 className="mt-2 text-xl font-semibold text-white">Leave this agency</h4>
              </div>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleLeaveAgency}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Leave agency
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/85 p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.72)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Join an agency</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">Request access with an invite code</h3>
              <p className="mt-2 text-sm text-slate-400">Enter the agency invite code shared by your agency owner to request membership.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#D4AF37]">
              <Building2 className="h-4 w-4" />
              Agency join
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_180px]">
            <label className="space-y-3">
              <span className="text-sm font-medium text-slate-300">Invite code</span>
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="ENTER8CHARS"
                className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-white outline-none transition focus:border-[#D4AF37]"
              />
            </label>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleSubmitJoin}
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[#D4AF37] px-5 py-4 text-sm font-semibold text-black transition hover:bg-[#c39b32] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading ? "Sending…" : "Request access"}
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-black/60 p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Agency workflow</p>
            <h4 className="mt-3 text-xl font-semibold text-white">Designed for agents joining teams</h4>
            <p className="mt-3 text-sm text-slate-400">
              Once your request is approved, your agency workspace will appear here automatically. Until then, your status stays visible to help you track progress.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/60 p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Next step</p>
            <h4 className="mt-3 text-xl font-semibold text-white">Invite code ready?</h4>
            <p className="mt-3 text-sm text-slate-400">Ask your agency owner for the latest join code and paste it above. Codes rotate regularly for security.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-3xl border border-emerald-600/20 bg-emerald-500/10 p-4 text-emerald-100">{message}</div>
      ) : null}
      {renderContent()}
    </div>
  );
}
