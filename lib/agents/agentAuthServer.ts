"use server";

import { db } from "../firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { generateAndSendOtp, verifyOtpCode } from "./authotpgen";

/**
 * Server Action: Generates and sends OTP to the agent's email.
 */
export async function sendOtpAction(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await generateAndSendOtp(email);
    return { success: true };
  } catch (error: any) {
    console.error("sendOtpAction Error:", error);
    return { success: false, error: error.message || "Failed to send OTP" };
  }
}

/**
 * Server Action: Verifies the 4-digit OTP code against the temporary 'otps' collection.
 */
export async function verifyOtpAction(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
  try {
    const verification = await verifyOtpCode(email, otp);
    if (!verification.valid) {
      return { success: false, error: verification.message || "Invalid OTP" };
    }
    return { success: true };
  } catch (error: any) {
    console.error("verifyOtpAction Error:", error);
    return { success: false, error: error.message || "Failed to verify OTP" };
  }
}

/**
 * Server Action: Registers the Agent's profile document inside the 'agents' collection.
 */
export async function registerAgentDocAction(body: {
  uid: string;
  email: string;
  fullname: string;
  countryCode: string;
  mobileNumber: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { uid, email, fullname, countryCode, mobileNumber } = body;

    if (!uid || !email) {
      return { success: false, error: "Missing required fields (uid, email)" };
    }

    const agentRef = doc(db, "agents", uid);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists()) {
      const names = (fullname || "Agent").split(" ");
      const firstname = names[0] || "Agent";
      const lastname = names.slice(1).join(" ") || "";

      await setDoc(agentRef, {
        id: uid,
        preferredLocations: [],
        name: {
          firstname,
          lastname,
        },
        email: email,
        number: {
          countrycode: countryCode,
          mobilenumber: mobileNumber,
        },
        address: {
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        membership: {
          transaction_id: "",
          start_date: serverTimestamp(),
          end_date: serverTimestamp(),
          status: "pending",
        },
        role: "agent",
        agency: "",
        location: "",
        id_verify: "unverified",
        properties: [],
        ratings: [],
        about: "",
        photoURL: "",
        canaddproperty: false,
        canaddagents: false,
        isAgencyOwner: false,
        createdAt: serverTimestamp(),
        onboardingCompleted: false,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("registerAgentDocAction Error:", error);
    return { success: false, error: error.message || "Failed to register agent doc" };
  }
}
