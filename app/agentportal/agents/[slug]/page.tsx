"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AgentData, getAgentData, submitVerification } from "@/lib/agents";
import { parseAgentSlug, generateAgentSlug } from "@/lib/agents/utils";
import VerifiedDashboard from "@/app/agentportal/components/VerifiedDashboard";
import VerificationWelcome from "@/app/agentportal/components/VerificationWelcome";
import VerificationForm from "@/app/agentportal/components/VerificationForm";
import VerificationPending from "@/app/agentportal/components/VerificationPending";
import VerificationRejected from "@/app/agentportal/components/VerificationRejected";

export default function AgentSlugDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleStartVerification = () => setShowForm(true);
  const handleCloseForm = () => setShowForm(false);

  const handleVerificationSubmit = async (formValues: Omit<AgentData, "uid" | "email" | "role" | "createdAt">) => {
    const user = auth.currentUser;
    if (!user || !agentData) {
      setError("Not authenticated.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitVerification(user.uid, user.email, {
        fullName: formValues.fullName || "",
        dob: formValues.dob || "",
        phone: formValues.phone || "",
        address: formValues.address || "",
        city: formValues.city || "",
        state: formValues.state || "",
        pincode: formValues.pincode || "",
        idType: formValues.idType || "",
        idNumber: formValues.idNumber || "",
        idPhotoUrl: formValues.idPhotoUrl || "",
        selfieWithIdUrl: formValues.selfieWithIdUrl || "",
        profilePhotoUrl: formValues.profilePhotoUrl || "",
        gpsLocation: formValues.gpsLocation || { lat: 0, lng: 0 },
      });

      setAgentData({
        ...agentData,
        ...formValues,
        verificationRequested: true,
        verificationStatus: "pending",
        submittedAt: Date.now(),
        verificationIssue: "",
      });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to submit verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const status = agentData?.verificationStatus ?? "none";

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-900/20 p-4 text-center">
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        {status === "none" && (
          <div className="space-y-8">
            <VerificationWelcome onStart={handleStartVerification} />
            {showForm && (
              <VerificationForm
                defaultValues={agentData}
                onSubmit={handleVerificationSubmit}
                onClose={handleCloseForm}
              />
            )}
          </div>
        )}

        {status === "pending" && <VerificationPending />}

        {status === "approved" && <VerifiedDashboard email={agentData!.email} />}

        {status === "rejected" && (
          <div className="space-y-8">
            <VerificationRejected
              verificationIssue={agentData?.verificationIssue || "No issue details provided."}
              onResubmit={handleStartVerification}
            />
            {showForm && (
              <VerificationForm
                defaultValues={agentData}
                onSubmit={handleVerificationSubmit}
                onClose={handleCloseForm}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
