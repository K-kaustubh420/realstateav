"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Users, CheckCircle, XCircle, RefreshCcw, Trash2, ShieldCheck, ArrowRight } from "lucide-react";
import {
  Agency,
  AgencyProperty,
  getAgencyProperties,
  rotateAgencyInviteCode,
  removeAgentFromAgency,
  updateAgency,
  deleteAgency,
} from "../../../lib/agency";
import {
  approveAgencyJoinRequest,
  rejectAgencyJoinRequest,
} from "../../../lib/agents/joinAgency";

type Props = {
  agency: Agency;
  onAgencyUpdated: () => Promise<void>;
};

export default function AgencyDashboard({ agency, onAgencyUpdated }: Props) {
  const [active, setActive] = useState("manageAgents");
  const [agencyState, setAgencyState] = useState<Agency>(agency);
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileValues, setProfileValues] = useState({
    agencyName: agency.agencyName,
    about: agency.details?.about || "",
    phone: agency.details?.phone || "",
    email: agency.details?.email || "",
    address: agency.details?.address || "",
    city: agency.details?.city || "",
    state: agency.details?.state || "",
    pincode: agency.details?.pincode || "",
    website: agency.details?.website || "",
    gstNumber: agency.details?.gstNumber || "",
    logoUrl: agency.details?.logoUrl || "",
    bannerUrl: agency.details?.bannerUrl || "",
    gpsLat: agency.details?.gpsLocation?.lat || 0,
    gpsLng: agency.details?.gpsLocation?.lng || 0,
  });

  useEffect(() => {
    setAgencyState(agency);
    setProfileValues({
      agencyName: agency.agencyName,
      about: agency.details?.about || "",
      phone: agency.details?.phone || "",
      email: agency.details?.email || "",
      address: agency.details?.address || "",
      city: agency.details?.city || "",
      state: agency.details?.state || "",
      pincode: agency.details?.pincode || "",
      website: agency.details?.website || "",
      gstNumber: agency.details?.gstNumber || "",
      logoUrl: agency.details?.logoUrl || "",
      bannerUrl: agency.details?.bannerUrl || "",
      gpsLat: agency.details?.gpsLocation?.lat || 0,
      gpsLng: agency.details?.gpsLocation?.lng || 0,
    });
  }, [agency]);

  useEffect(() => {
    loadProperties();
  }, [agencyState.agencyId]);

  const loadProperties = async () => {
    setError(null);
    setLoading(true);
    try {
      const props = await getAgencyProperties(agencyState.agencyId);
      setProperties(props);
    } catch (err) {
      setError("Unable to load agency properties.");
    } finally {
      setLoading(false);
    }
  };

  const groupedProperties = useMemo(() => {
    return properties.reduce<Record<string, AgencyProperty[]>>((acc, property) => {
      const key = property.agentId || "unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(property);
      return acc;
    }, {});
  }, [properties]);

  const handleAction = async (action: () => Promise<unknown>, successMessage: string) => {
    setError(null);
    setFeedback(null);
    setLoading(true);
    try {
      await action();
      await onAgencyUpdated();
      await loadProperties();
      setFeedback(successMessage);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleRotateCode = async () => {
    await handleAction(async () => rotateAgencyInviteCode(agencyState.agencyId), "Invite code rotated successfully.");
  };

  const handleApprove = async (request: { agentId: string; name: string; email: string }) => {
    await handleAction(async () => approveAgencyJoinRequest(agencyState.agencyId, request), `${request.name} has been approved.`);
  };

  const handleReject = async (request: { agentId: string; name: string; email: string }) => {
    await handleAction(async () => rejectAgencyJoinRequest(agencyState.agencyId, request), "Request rejected.");
  };

  const handleRemoveAgent = async (agentId: string, name: string) => {
    const confirm = window.confirm(`Remove ${name} from this agency? Their agency properties will transfer to the owner.`);
    if (!confirm) return;
    await handleAction(async () => removeAgentFromAgency(agencyState.agencyId, agentId), `${name} has been removed.`);
  };

  const handleSaveProfile = async () => {
    await handleAction(async () => {
      await updateAgency(agencyState.agencyId, {
        agencyName: profileValues.agencyName,
        details: {
          about: profileValues.about,
          phone: profileValues.phone,
          email: profileValues.email,
          address: profileValues.address,
          city: profileValues.city,
          state: profileValues.state,
          pincode: profileValues.pincode,
          website: profileValues.website,
          gstNumber: profileValues.gstNumber,
          logoUrl: profileValues.logoUrl,
          bannerUrl: profileValues.bannerUrl,
          gpsLocation: { lat: profileValues.gpsLat, lng: profileValues.gpsLng },
        },
      });
    }, "Agency profile updated.");
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Delete this agency permanently? This cannot be undone.");
    if (!confirm) return;
    setError(null);
    setFeedback(null);
    setLoading(true);
    try {
      await deleteAgency(agencyState.agencyId);
      await onAgencyUpdated();
      setFeedback("Agency deleted. You can create a new agency now.");
    } catch (err: any) {
      setError(err?.message || "Unable to delete agency.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-4xl border border-white/10 bg-zinc-950/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-linear-to-r from-slate-950/80 to-slate-900/80 p-6 shadow-xl shadow-black/20 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Agency dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{agencyState.agencyName}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">Manage your agency team, approval requests, profile, and invite code securely.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Invite code</p>
            <p className="mt-3 text-lg font-semibold text-white">{agencyState.inviteCode || "—"}</p>
          </div>
          <button onClick={handleRotateCode} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37]/10 px-5 py-3 text-sm font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/20 disabled:cursor-not-allowed disabled:opacity-50">
            <RefreshCcw className="h-4 w-4" /> Rotate Code
          </button>
        </div>
      </div>

      {(error || feedback) && (
        <div className={`mb-6 rounded-3xl border px-5 py-4 ${error ? "border-rose-500/30 bg-rose-500/10 text-rose-100" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"}`}>
          {error || feedback}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Owner</p>
              <p className="text-sm text-slate-400">{agencyState.owner.name}</p>
            </div>
          </div>
          <div className="mt-6 space-y-1">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Contact</p>
            <p className="text-sm text-slate-300">{agencyState.owner.email}</p>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Status</p>
            <p className="rounded-2xl bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">{agencyState.agencyStatus}</p>
          </div>

          <nav className="mt-8 space-y-2">
            <button onClick={() => setActive("manageAgents")} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${active === "manageAgents" ? "bg-white/5 text-white" : "text-slate-300 hover:bg-white/5"}`}>
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Manage Agents</span>
              <span className="text-xs text-slate-400">{agencyState.agents?.length || 0}</span>
            </button>
            <button onClick={() => setActive("requests")} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${active === "requests" ? "bg-white/5 text-white" : "text-slate-300 hover:bg-white/5"}`}>
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Approval Requests</span>
              <span className="text-xs text-slate-400">{agencyState.joinRequests?.length || 0}</span>
            </button>
            <button onClick={() => setActive("profile")} className={`flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left transition ${active === "profile" ? "bg-white/5 text-white" : "text-slate-300 hover:bg-white/5"}`}>
              <XCircle className="h-4 w-4" /> Manage Profile
            </button>
          </nav>
        </aside>

        <main className="space-y-6">
          <section className="rounded-[1.75rem] border border-white/10 bg-zinc-950/85 p-6 shadow-xl shadow-black/20">
            {active === "manageAgents" && (
              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Manage Agents</h2>
                    <p className="mt-2 text-slate-400">Review the team, their properties, and remove agents safely.</p>
                  </div>
                  <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">{properties.length} properties under the agency</div>
                </div>

                <div className="mt-6 space-y-4">
                  {(agencyState.agents || []).map((agent) => {
                    const agentProperties = groupedProperties[agent.agentId] || [];
                    const isOwner = agent.agentId === agencyState.owner.agentId;

                    return (
                      <div key={agent.agentId} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-inner shadow-black/10">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-white">{agent.name}</p>
                            <p className="text-sm text-slate-400">{agent.email}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{agent.status}</span>
                              {isOwner ? <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-200">Owner</span> : null}
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Joined {agent.joinedAt ? new Date(agent.joinedAt).toLocaleDateString() : "—"}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-white/5 px-3 py-2 text-sm text-slate-300">{agentProperties.length} listed</span>
                            {!isOwner && (
                              <button onClick={() => handleRemoveAgent(agent.agentId, agent.name)} disabled={loading} className="rounded-full bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15 disabled:opacity-50">
                                Remove Agent
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 space-y-3">
                          <p className="text-sm font-semibold text-white">Properties listed by this agent</p>
                          {agentProperties.length ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                              {agentProperties.map((property) => (
                                <div key={property.propertyId} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                                  <p className="font-semibold text-white">{property.propertyTitle || "Untitled property"}</p>
                                  <p className="mt-2 text-sm text-slate-400">ID: {property.propertyId}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400">No properties are currently listed by this agent under the agency.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {active === "requests" && (
              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Approval Requests</h2>
                    <p className="mt-2 text-slate-400">Approve or reject incoming agent requests for this agency.</p>
                  </div>
                  <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">{agencyState.joinRequests?.length || 0} pending</div>
                </div>

                <div className="mt-6 space-y-4">
                  {agencyState.joinRequests?.length ? (
                    agencyState.joinRequests.map((request) => (
                      <div key={request.agentId} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-inner shadow-black/10">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-white">{request.name}</p>
                            <p className="text-sm text-slate-400">{request.email}</p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button onClick={() => handleApprove(request)} disabled={loading} className="rounded-full bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/20 disabled:opacity-50">
                              Approve
                            </button>
                            <button onClick={() => handleReject(request)} disabled={loading} className="rounded-full bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15 disabled:opacity-50">
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 text-center text-slate-400">No pending join requests right now.</div>
                  )}
                </div>
              </div>
            )}

            {active === "profile" && (
              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Manage Profile</h2>
                    <p className="mt-2 text-slate-400">Update agency details, contact information, or remove the agency entirely.</p>
                  </div>
                  <button onClick={handleDelete} disabled={loading} className="rounded-full bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15 disabled:opacity-50">
                    Delete Agency
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-300">Agency name</label>
                      <input value={profileValues.agencyName} onChange={(e) => setProfileValues((prev) => ({ ...prev, agencyName: e.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Contact email</label>
                      <input value={profileValues.email} onChange={(e) => setProfileValues((prev) => ({ ...prev, email: e.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-300">About</label>
                    <textarea value={profileValues.about} onChange={(e) => setProfileValues((prev) => ({ ...prev, about: e.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" rows={4} />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-300">Phone</label>
                      <input value={profileValues.phone} onChange={(e) => setProfileValues((prev) => ({ ...prev, phone: e.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Website</label>
                      <input value={profileValues.website} onChange={(e) => setProfileValues((prev) => ({ ...prev, website: e.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-300">State</label>
                      <input value={profileValues.state} onChange={(e) => setProfileValues((prev) => ({ ...prev, state: e.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">City</label>
                      <input value={profileValues.city} onChange={(e) => setProfileValues((prev) => ({ ...prev, city: e.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-300">Address</label>
                      <input value={profileValues.address} onChange={(e) => setProfileValues((prev) => ({ ...prev, address: e.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Pincode</label>
                      <input value={profileValues.pincode} onChange={(e) => setProfileValues((prev) => ({ ...prev, pincode: e.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-300">GST number</label>
                      <input value={profileValues.gstNumber} onChange={(e) => setProfileValues((prev) => ({ ...prev, gstNumber: e.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Logo URL</label>
                      <input value={profileValues.logoUrl} onChange={(e) => setProfileValues((prev) => ({ ...prev, logoUrl: e.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-300">Banner URL</label>
                      <input value={profileValues.bannerUrl} onChange={(e) => setProfileValues((prev) => ({ ...prev, bannerUrl: e.target.value }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">GPS latitude</label>
                      <input type="number" value={profileValues.gpsLat} onChange={(e) => setProfileValues((prev) => ({ ...prev, gpsLat: Number(e.target.value) }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-300">GPS longitude</label>
                      <input type="number" value={profileValues.gpsLng} onChange={(e) => setProfileValues((prev) => ({ ...prev, gpsLng: Number(e.target.value) }))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" />
                    </div>
                    <div className="flex items-end justify-end">
                      <button onClick={handleSaveProfile} disabled={loading} className="rounded-full bg-[#D4AF37]/10 px-6 py-3 text-sm font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/20 disabled:opacity-50">
                        Save changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
