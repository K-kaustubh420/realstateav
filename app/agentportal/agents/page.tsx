"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAgentData } from "@/lib/agents";
import { generateAgentSlug } from "@/lib/agents/utils";

export default function AgentDashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !user.email) {
        router.replace("/agentportal/login");
        return;
      }

      try {
        const agent = await getAgentData(user.uid, user.email);
        if (agent) {
          const slug = generateAgentSlug({ ...agent, uid: user.uid });
          router.replace(`/agentportal/agents/${slug}`);
        } else {
          router.replace("/agentportal/login");
        }
      } catch (err) {
        console.error("Redirect error:", err);
        router.replace("/agentportal/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-8 py-10 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-xl font-semibold tracking-wide">Redirecting...</p>
      </div>
    </main>
  );
}
