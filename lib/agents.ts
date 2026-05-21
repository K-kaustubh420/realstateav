import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export type VerificationStatus = "none" | "pending" | "approved" | "rejected";

export type AgentData = {
  uid: string;
  email: string;
  role: "agent";
  isVerified?: boolean;
  verificationRequested?: boolean;
  verificationStatus?: VerificationStatus;
  verificationIssue?: string;
  fullName?: string;
  dob?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gpsLocation?: {
    lat: number;
    lng: number;
  };
  idType?: string;
  idNumber?: string;
  idPhotoUrl?: string;
  selfieWithIdUrl?: string;
  profilePhotoUrl?: string;
  submittedAt?: number | null;
  createdAt?: number;
};

export const getAgentData = async (email: string): Promise<AgentData | null> => {
  const agentRef = doc(db, "agents", email);
  const snapshot = await getDoc(agentRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as AgentData;
};

export type VerificationPayload = {
  fullName: string;
  dob: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  idType: string;
  idNumber: string;
  idPhotoUrl: string;
  selfieWithIdUrl: string;
  profilePhotoUrl: string;
  gpsLocation: {
    lat: number;
    lng: number;
  };
};

export const submitVerification = async (
  email: string,
  payload: VerificationPayload
): Promise<void> => {
  const agentRef = doc(db, "agents", email);

  await setDoc(
    agentRef,
    {
      verificationRequested: true,
      verificationStatus: "pending",
      submittedAt: Date.now(),
      verificationIssue: "",
      ...payload,
    },
    { merge: true }
  );
};
