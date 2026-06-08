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
          router.replace(`/agentportal/agents/${slug}?view=dashboard`);
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

  
}
