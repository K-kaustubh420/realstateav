"use server";

import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface AgentOnboardingPayload {
  name: {
    firstname: string;
    lastname: string;
  };
  about: string;
  photoURL: string;
  location: {
    longitute: string;
    latitute: string;
  };
  Address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Server Action: Completes the onboarding process for an Agent.
 * Updates the user's document in the `agents` collection with the provided details
 * and sets `onboardingCompleted` to true.
 */
export async function completeAgentOnboardingAction(
  uid: string,
  payload: AgentOnboardingPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!uid) {
      return { success: false, error: "Missing Agent UID" };
    }

    const agentRef = doc(db, "agents", uid);

    // Note: We use updateDoc so we don't overwrite the initial fields created during registration.
    await updateDoc(agentRef, {
      ...payload,
      onboardingCompleted: true,
    });

    return { success: true };
  } catch (error: any) {
    console.error("completeAgentOnboardingAction Error:", error);
    return { success: false, error: error.message || "Failed to complete onboarding" };
  }
}
