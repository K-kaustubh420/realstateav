
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

import { Agent } from "@/utils/user";

export type VerificationStatus = "none" | "pending" | "approved" | "rejected";

import { collection, query, where, getDocs } from "firebase/firestore";

export const getAgentDocRef = async (uid: string, email?: string | null) => {
  if (email) {
    let ref = doc(db, "agents", email);
    if ((await getDoc(ref)).exists()) return ref;
  }
  let ref = doc(db, "agents", uid);
  if ((await getDoc(ref)).exists()) return ref;
  
  if (email) {
     const agentsCol = collection(db, "agents");
     const qEmail = query(agentsCol, where("email", "==", email));
     const snapsEmail = await getDocs(qEmail);
     if (!snapsEmail.empty) return doc(db, "agents", snapsEmail.docs[0].id);
  }
  
  const agentsCol = collection(db, "agents");
  const qUid = query(agentsCol, where("uid", "==", uid));
  const snapsUid = await getDocs(qUid);
  if (!snapsUid.empty) return doc(db, "agents", snapsUid.docs[0].id);

  return doc(db, "agents", uid); // fallback
};

export const getAgentData = async (uid: string, email?: string | null): Promise<Agent | null> => {
  const agentRef = await getAgentDocRef(uid, email);
  const snapshot = await getDoc(agentRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Agent;
  if (!data.uid) {
    data.uid = uid;
  }
  return data;
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
  uid: string,
  email: string | null,
  payload: VerificationPayload
): Promise<void> => {
  const agentRef = await getAgentDocRef(uid, email);

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
