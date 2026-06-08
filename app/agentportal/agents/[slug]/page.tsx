"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { useAgent } from "@/hooks/useAgent";
import { parseAgentSlug, generateAgentSlug } from "@/lib/agents/utils";
import AgentWorkbench from "@/app/agentportal/components/AgentWorkbench";

export default function AgentSlugDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { user, loading, isAgent, agentData } = useAgent();
  const [isSlugValidating, setIsSlugValidating] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    if (!user || !isAgent || !agentData) {
      setIsSlugValidating(false);
      return;
    }

    const uidFromSlug = parseAgentSlug(slug);
    if (uidFromSlug !== user.uid) {
      const correctSlug = generateAgentSlug({ ...agentData, uid: user.uid });
      router.replace(`/agentportal/agents/${correctSlug}?view=dashboard`);
    } else {
      setIsSlugValidating(false);
    }
  }, [user, loading, isAgent, agentData, slug, router]);

  if (loading || isSlugValidating) {
    return (
      <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        {/* Subtle non-blocking loader */}
      </main>
    );
  }

  if (!user || !isAgent || !agentData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex">
      <AgentWorkbench agentData={agentData} user={user} />
    </main>
  );
}

