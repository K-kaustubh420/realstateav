"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { getAgentData } from "../../lib/agents";
import { getAgencyByOwnerEmail, getAgencyById, createAgency, Agency } from "../../lib/agency";
import AgencyOnboardingWrapper from "./components/onboarding/AgencyOnboardingWrapper";
import AgencyPending from "./components/AgencyPending";
import AgencyRejected from "./components/AgencyRejected";
import AgencyDashboard from "./components/AgencyDashboard";

export default function AgencyPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<any | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (!user) {
        setUserEmail(null);
        setAgentData(null);
        setAgency(null);
        setLoading(false);
        return;
      }
      if (!user.email) {
        setError("Signed in user has no email.");
        setLoading(false);
        return;
      }

      setUserEmail(user.email);

      try {
        const a = await getAgentData(user.uid);
        setAgentData(a);
        const ag = await getAgencyByOwnerEmail(user.email);
        setAgency(ag);
      } catch (err) {
        setError("Unable to load agency data.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (!user || !user.email) {
        setError("Google sign-in failed: no email returned.");
        await signOut(auth);
        return;
      }

      // verify account is an agent with approved status
      const a = await getAgentData(user.uid);
      if (!a || (a.role !== "agent" && a.role !== "agency") || a.id_verify !== "verified") {
        setError("Only verified agents may sign in here.");
        await signOut(auth);
        return;
      }

      // allowed — onAuthStateChanged will pick this up and load data
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const refreshAgency = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const ag = await getAgencyByOwnerEmail(userEmail);
      setAgency(ag);
    } catch (err) {
      setError("Unable to refresh agency.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    if (!agentData) return;
    setLoading(true);
    try {
      const owner = { agentId: agentData.uid, name: agentData.fullName || "", email: agentData.email };
      const id = await createAgency(owner, values);
      const ag = await getAgencyById(id);
      setAgency(ag);
      setShowCreate(false);
      setError(null);
    } catch (err: any) {
      const msg = err?.message || "Unable to create agency.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/6 bg-slate-900/80 px-8 py-10 text-center shadow-lg backdrop-blur-xl">
          <p className="text-lg font-semibold">Loading agency…</p>
        </div>
      </main>
    );
  }

  // 1. Not logged in
  if (!userEmail) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/6 bg-slate-900/80 px-8 py-10 text-center shadow-lg backdrop-blur-xl">
          <p className="text-lg font-semibold">Restricted</p>
          <p className="mt-2 text-slate-400">Please sign in with your verified agent account to access agencies.</p>
          <div className="mt-6">
            <button onClick={handleGoogleSignIn} disabled={loading} className="inline-flex items-center gap-3 rounded-full bg-[#D4AF37]/10 px-5 py-3 text-sm font-semibold text-[#D4AF37]">
              Sign in with Google (Agent)
            </button>
          </div>
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </div>
      </main>
    );
  }

  // 2. Logged in but not an agent
  if (!agentData || (agentData.role !== "agent" && agentData.role !== "agency")) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/6 bg-slate-900/80 px-8 py-10 text-center shadow-lg backdrop-blur-xl">
          <p className="text-lg font-semibold">Access Denied</p>
          <p className="mt-2 text-slate-400">Only agents can create or manage agencies.</p>
        </div>
      </main>
    );
  }

  // 3. Agent not verified
  if (agentData.id_verify !== "verified") {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="rounded-2xl border border-white/6 bg-slate-900/80 px-8 py-10 text-center shadow-lg backdrop-blur-xl">
          <p className="text-lg font-semibold">Only verified agents can create or manage agencies.</p>
          <p className="mt-2 text-slate-400">Get verified to continue.</p>
        </div>
      </main>
    );
  }

  // Agent verified at this point
  // If no agency: show create form
  if (!agency) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-black text-black dark:text-white pt-10 px-4 pb-10 flex justify-center items-center">
        <div className="w-full max-w-5xl">
          <AgencyOnboardingWrapper defaultValues={{}} onSubmit={handleCreate} />
        </div>
      </main>
    );
  }

  // agency exists — render based on agency status
  if (agency.agencyStatus === "pending") {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <AgencyPending />
        </div>
      </main>
    );
  }

  if (agency.agencyStatus === "rejected") {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-black text-black dark:text-white pt-10 px-4 pb-10 lg:px-8 flex justify-center items-center">
        <div className="w-full max-w-5xl">
          {!showCreate ? (
            <div className="bg-slate-950 text-white p-8 rounded-2xl">
              <AgencyRejected rejectionReason={agency.rejectionReason || "No reason provided."} onResubmit={() => setShowCreate(true)} />
            </div>
          ) : (
             <AgencyOnboardingWrapper defaultValues={agency.details} onSubmit={handleCreate} />
          )}
        </div>
      </main>
    );
  }

  // approved
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10 lg:px-8">
      <div className="mx-auto max-w-8xl">
        <AgencyDashboard agency={agency} onAgencyUpdated={refreshAgency} />
      </div>
    </main>
  );
}
