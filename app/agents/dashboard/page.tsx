"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import {
  AgentData,
  getAgentData,
  submitVerification,
} from "@/lib/agents";
import VerificationWelcome from "@/app/agents/components/VerificationWelcome";
import VerificationForm from "@/app/agents/components/VerificationForm";
import VerificationPending from "@/app/agents/components/VerificationPending";
import VerificationRejected from "@/app/agents/components/VerificationRejected";
import VerifiedDashboard from "@/app/agents/components/VerifiedDashboard";

export default function AgentDashboardPage() {
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAgentData(null);
        setLoading(false);
        return;
      }

      if (!user.email) {
        setError("Signed in user has no email.");
        setLoading(false);
        return;
      }

      try {
        const agent = await getAgentData(user.email);
        setAgentData(agent);
      } catch (err) {
        setError("Unable to load your agent profile.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStartVerification = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleVerificationSubmit = async (formValues: Omit<AgentData, "uid" | "email" | "role" | "createdAt">) => {
    if (!agentData?.email) {
      setError("Missing agent email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitVerification(agentData.email, {
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
        fullName: formValues.fullName || agentData.fullName,
        dob: formValues.dob || agentData.dob,
        phone: formValues.phone || agentData.phone,
        address: formValues.address || agentData.address,
        city: formValues.city || agentData.city,
        state: formValues.state || agentData.state,
        pincode: formValues.pincode || agentData.pincode,
        idType: formValues.idType || agentData.idType,
        idNumber: formValues.idNumber || agentData.idNumber,
        idPhotoUrl: formValues.idPhotoUrl || agentData.idPhotoUrl,
        selfieWithIdUrl: formValues.selfieWithIdUrl || agentData.selfieWithIdUrl,
        profilePhotoUrl: formValues.profilePhotoUrl || agentData.profilePhotoUrl,
        gpsLocation: formValues.gpsLocation || agentData.gpsLocation,
        verificationRequested: true,
        verificationStatus: "pending",
        submittedAt: Date.now(),
        verificationIssue: "",
      });
      setShowForm(false);
    } catch (err) {
      setError("Unable to submit verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const status = agentData?.verificationStatus ?? "none";
  const canShowDashboard = status === "approved";

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-8 py-10 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-xl font-semibold tracking-wide">Loading your verification dashboard…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="rounded-3xl border border-rose-500/20 bg-slate-900/90 px-8 py-10 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-xl font-semibold tracking-wide text-rose-300">{error}</p>
          <p className="mt-3 text-sm text-zinc-400">Please sign in with the agent account associated with your email.</p>
        </div>
      </main>
    );
  }

  if (!agentData) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-8 py-10 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-xl font-semibold tracking-wide">No agent profile found.</p>
          <p className="mt-2 text-sm text-zinc-400">Make sure you are signed in with the right agent account.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
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

        {canShowDashboard && <VerifiedDashboard email={agentData.email} />}

        {status === "rejected" && (
          <div className="space-y-8">
            <VerificationRejected
              verificationIssue={agentData.verificationIssue || "No issue details provided."}
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
