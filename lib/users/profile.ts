import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "@/utils/user";

/**
 * Fetches the user profile doc from 'users' collection using uid as the document ID.
 */
export const fetchUserProfile = async (uid: string): Promise<User | null> => {
  if (!uid) return null;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    return null;
  }
  const data = snap.data() as User;
  return data;
};

/**
 * Updates user profile details in Firestore.
 */
export const updateUserProfile = async (
  uid: string,
  updatedData: Partial<User>
): Promise<void> => {
  if (!uid) throw new Error("UID is required to update profile.");
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, updatedData);
};

/**
 * Performs a soft-delete by removing PII but keeping the auth record if needed, 
 * or just flag it (Note: 'isDeleted' is not in standard User interface right now, 
 * so we can either add it or handle it separately. We will use a soft approach).
 */
export const softDeleteUserProfile = async (uid: string): Promise<void> => {
  if (!uid) throw new Error("UID is required to delete profile.");
  const userRef = doc(db, "users", uid);
  // Setting name and email to placeholders to anonymize if we want soft delete.
  // We can just add an isDeleted flag temporarily even if not in the strict User interface.
  await updateDoc(userRef, { isDeleted: true, name: "Deleted User", email: "deleted@example.com" });
};
