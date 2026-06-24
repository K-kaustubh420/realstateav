"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { getAgentData } from "../../../lib/agents";
import { getAgencyByOwnerEmail, createAgency, Agency } from "../../../lib/agency/agency";
import AgencyOnboardingWrapper from "../components/onboarding/AgencyOnboardingWrapper";

export default function AgencyRegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [agentData, setAgentData] = useState<any | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push("/agentportal/login");
        return;
      }
      
      try {
        const a = await getAgentData(currentUser.uid);
        if (!a || (a.role !== "agent" && a.role !== "agency")) {
            setAgentData(null);
            setLoading(false);
            return;
        }
        setAgentData(a);

        if (currentUser.email) {
            const ag = await getAgencyByOwnerEmail(currentUser.email);
            setAgency(ag);
            if (ag) {
                router.push("/agencyportal/dashboard");
                return;
            }
        }
      } catch (err) {
        setError("Unable to load agency data.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  const handleCreate = async (values: any) => {
    if (!agentData) return;
    setLoading(true);
    try {
      const owner = { agentId: agentData.uid, name: agentData.fullName || "", email: agentData.email };
      await createAgency(owner, values);
      router.push("/agencyportal/login");
    } catch (err: any) {
      const msg = err?.message || "Unable to create agency.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  // 1. Not logged in
  if (!user) return null;

  // 2. Logged in but not an agent
  if (!agentData || (agentData.role !== "agent" && agentData.role !== "agency")) {
    return (
      <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center px-4">
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111] px-8 py-10 text-center shadow-lg backdrop-blur-xl">
          <p className="text-lg font-semibold">Access Denied</p>
          <p className="mt-2 text-gray-500">Only agents can create or manage agencies.</p>
        </div>
      </main>
    );
  }

  // 3. Agent not verified
  if (agentData.id_verify !== "verified") {
    return (
      <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center px-4">
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111] px-8 py-10 text-center shadow-lg backdrop-blur-xl">
          <p className="text-lg font-semibold">Action Required</p>
          <p className="mt-2 text-gray-500">Only verified agents can submit an agency request. Please get verified first in the Agent Portal.</p>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </div>
      </main>
    );
  }

  // If agency exists, handled in useEffect (redirect)
  if (agency) return null;

  return (
    <main className="min-h-screen h-screen w-screen overflow-hidden flex bg-white dark:bg-[#0a0a0a] font-sans text-black dark:text-white">
      <AgencyOnboardingWrapper defaultValues={{}} onSubmit={handleCreate} />
    </main>
  );
}
