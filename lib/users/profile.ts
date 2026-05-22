import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface UserProfile {
  uid: string;
  email: string;
  role: "user";
  createdAt: number;
  fullName?: string;
  phoneNumber?: string;
  photoURL?: string;
  permanentAddress?: string;
  isDeleted?: boolean;
  // New lightweight identity fields
  governmentIdType?: string; // e.g., "Passport", "Aadhar"
  governmentIdNumber?: string;
  governmentIdImageUrl?: string;
  isIdentityVerified?: boolean; // default false until verification
  identityConsentAccepted?: boolean; // user self‑declaration consent
}

/**
 * Fetches the user profile doc from 'users' collection using email as the document ID.
 */
export const fetchUserProfile = async (email: string): Promise<UserProfile | null> => {
  if (!email) return null;
  const userRef = doc(db, "users", email);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    return null;
  }
  const data = snap.data() as UserProfile;
  if (data.isDeleted) {
    return null;
  }
  return data;
};

/**
 * Updates user profile details in Firestore.
 */
export const updateUserProfile = async (
  email: string,
  updatedData: Partial<Omit<UserProfile, "uid" | "email" | "role" | "createdAt" | "isDeleted">>
): Promise<void> => {
  if (!email) throw new Error("Email is required to update profile.");
  const userRef = doc(db, "users", email);
  await updateDoc(userRef, updatedData);
};

/**
 * Performs a soft-delete by setting 'isDeleted' to true.
 */
export const softDeleteUserProfile = async (email: string): Promise<void> => {
  if (!email) throw new Error("Email is required to delete profile.");
  const userRef = doc(db, "users", email);
  await updateDoc(userRef, { isDeleted: true });
};
