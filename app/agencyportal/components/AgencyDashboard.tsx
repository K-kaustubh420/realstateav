"use client";

import { useEffect, useState } from "react";
import { Building2, Users, CheckCircle, RefreshCcw, ShieldCheck, MapPin, LogOut } from "lucide-react";
import { Agency, AgencyProperty, getAgencyProperties } from "../../../lib/agency/agency";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// Sub-components
import ManagingAgents from "./dashboard/ManagingAgents";
import Profile from "./dashboard/Profile";
import Preferences from "./dashboard/Preferences";

type Props = {
  agency: Agency;
  onAgencyUpdated: () => Promise<void>;
};

export default function AgencyDashboard({ agency, onAgencyUpdated }: Props) {
  const router = useRouter();
  const [active, setActive] = useState("manageAgents");
  const [agencyState, setAgencyState] = useState<Agency>(agency);
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAgencyState(agency);
  }, [agency]);

  useEffect(() => {
    loadProperties();
  }, [agencyState.agencyId]);

  const loadProperties = async () => {
    setLoadingProps(true);
    try {
      const props = await getAgencyProperties(agencyState.agencyId);
      setProperties(props);
    } catch (err) {
      console.error("Unable to load agency properties.", err);
    } finally {
      setLoadingProps(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/agencyportal/login");
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  const bannerImg = agencyState.details?.bannerUrl || "/Banner.jpeg";
  const logoImg = agencyState.details?.logoUrl;
  const isPending = agencyState.agencyStatus === "pending";

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setError(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setFeedback(null);
    setTimeout(() => setError(null), 4000);
  };

  return (
    <div className="relative rounded-4xl border border-white/10 bg-zinc-950/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl overflow-hidden min-h-[600px] flex flex-col">
      
      {/* Pending Overlay */}
      {isPending && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-4xl">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-md text-center shadow-2xl">
            <ShieldCheck className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Verification Pending</h2>
            <p className="text-zinc-400">Your agency is still under verification. You will be notified once the verification is completed and your dashboard is unlocked.</p>
          </div>
        </div>
      )}

      {/* Header with Banner and Logo */}
      <div className="relative mb-8 rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 shadow-xl shrink-0">
        <div 
          className="h-48 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerImg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent" />
        </div>
        
        <div className="relative px-6 pb-6 -mt-12 flex flex-col sm:flex-row sm:items-end gap-6 justify-between">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Logo */}
            <div className="h-28 w-28 rounded-full border-4 border-zinc-950 bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
              {logoImg ? (
                <img src={logoImg} alt={agencyState.agencyName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-[#D4AF37]">{agencyState.agencyName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            
            <div className="text-center sm:text-left mb-2">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-3xl font-bold text-white">{agencyState.agencyName}</h1>
                {agencyState.agencyStatus === "approved" && (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
              </div>
              <p className="text-slate-400 mt-1 max-w-xl line-clamp-1">{agencyState.details?.about || "Manage your agency team, properties, and profile securely."}</p>
            </div>
          </div>
        </div>
      </div>

      {(error || feedback) && (
        <div className={`mb-6 rounded-2xl border px-5 py-4 shrink-0 transition-all ${error ? "border-rose-500/30 bg-rose-500/10 text-rose-100" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"}`}>
          {error || feedback}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] flex-grow">
        {/* Sidebar Navigation */}
        <aside className="flex flex-col rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Owner</p>
              <p className="text-sm text-slate-400 line-clamp-1">{agencyState.owner.name}</p>
            </div>
          </div>
          
          <nav className="mt-8 space-y-2 flex-grow">
            <button onClick={() => setActive("manageAgents")} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${active === "manageAgents" ? "bg-white/5 text-white font-medium" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Team & Agents</span>
            </button>
            <button onClick={() => setActive("preferences")} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${active === "preferences" ? "bg-white/5 text-white font-medium" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Preferences</span>
            </button>
            <button onClick={() => setActive("profile")} className={`flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left transition ${active === "profile" ? "bg-white/5 text-white font-medium" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>
              <Building2 className="h-4 w-4" /> Agency Profile
            </button>
          </nav>

          {/* Sign Out Button */}
          <div className="pt-6 mt-auto border-t border-white/10">
            <button 
              onClick={handleSignOut} 
              className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-rose-400/80 transition hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="rounded-[1.75rem] border border-white/10 bg-zinc-950/85 p-6 shadow-xl shadow-black/20">
          {active === "manageAgents" && (
            <ManagingAgents 
              agencyId={agencyState.agencyId}
              inviteCode={agencyState.inviteCode || ""}
              agents={agencyState.agents || []}
              joinRequests={agencyState.joinRequests || []}
              ownerId={agencyState.owner.agentId}
              properties={properties}
              onUpdate={async () => { await onAgencyUpdated(); await loadProperties(); }}
              onError={showError}
              onFeedback={showFeedback}
            />
          )}

          {active === "preferences" && (
            <Preferences 
              agencyId={agencyState.agencyId}
              initialPreferences={agencyState.preferences || {}}
              onUpdate={onAgencyUpdated}
              onError={showError}
              onFeedback={showFeedback}
            />
          )}

          {active === "profile" && (
            <Profile 
              agencyId={agencyState.agencyId}
              initialValues={{
                agencyName: agencyState.agencyName,
                about: agencyState.details?.about || "",
                phone: agencyState.details?.phone || "",
                email: agencyState.details?.email || "",
                address: agencyState.details?.Address?.addressLine1 || "",
                city: agencyState.details?.Address?.city || "",
                state: agencyState.details?.Address?.state || "",
                pincode: agencyState.details?.Address?.postalCode || "",
                website: agencyState.details?.website || "",
                gstNumber: agencyState.details?.gstNumber || "",
                logoUrl: agencyState.details?.logoUrl || "",
                bannerUrl: agencyState.details?.bannerUrl || "",
                gpsLat: agencyState.details?.gpsLocation?.lat || 0,
                gpsLng: agencyState.details?.gpsLocation?.lng || 0,
              }}
              onUpdate={onAgencyUpdated}
              onError={showError}
              onFeedback={showFeedback}
            />
          )}
        </main>
      </div>
    </div>
  );
}
