"use server";

import { db } from "../firebase";
import { doc, setDoc, serverTimestamp, getDoc, Timestamp } from "firebase/firestore";
import { AgentRegisterPayload } from "@/utils/user";
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
export async function registerAgentDocAction(body: AgentRegisterPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const { uid, email } = body;

    if (!uid || !email) {
      return { success: false, error: "Missing required fields (id, email)" };
    }

    const agentRef = doc(db, "agents", uid);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists()) {
      await setDoc(agentRef, {
        ...body,
        address: {
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        membership: {
          ...body.membership,
          start_date: Timestamp.fromDate(new Date(body.membership.start_date)),
          end_date: Timestamp.fromDate(new Date(body.membership.end_date)),
        },
        isAgencyOwner: false,
        createdAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("registerAgentDocAction Error:", error);
    return { success: false, error: error.message || "Failed to register agent doc" };
  }
}
