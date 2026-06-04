"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAgentData } from "@/lib/agents";
import { parseAgentSlug, generateAgentSlug } from "@/lib/agents/utils";
import VerifiedDashboard from "@/app/agentportal/components/VerifiedDashboard";
import { Agent } from "@/utils/user";

export default function AgentSlugDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [agentData, setAgentData] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.email) {
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      try {
        const agent = await getAgentData(user.uid, user.email);
        
        if (!agent) {
          setAuthChecked(true);
          setLoading(false);
          return;
        }

        // Verify that the slug matches the user's uid
        const uidFromSlug = parseAgentSlug(slug);
        if (uidFromSlug !== user.uid) {
          const correctSlug = generateAgentSlug({ ...agent, uid: user.uid });
          router.replace(`/agentportal/agents/${correctSlug}?view=dashboard`);
          return;
        }

        setAgentData(agent);
      } catch (err) {
        console.error("Dashboard check error:", err);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [slug, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-8 py-10 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-xl font-semibold tracking-wide">Loading dashboard…</p>
        </div>
      </main>
    );
  }

  // Display 404 for protected route if missing agent profile
  if (authChecked && !agentData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <VerifiedDashboard email={agentData!.email} />
      </div>
    </main>
  );
}

