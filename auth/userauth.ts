// lib/users/userauth.ts
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile, // <-- Added this
} from "firebase/auth";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

const checkAgent = async (email: string) => {
  const agentRef = doc(db, "agents", email);
  const agentSnap = await getDoc(agentRef);
  return agentSnap.exists();
};

// Added fullName parameter
const createUserDoc = async (uid: string, email: string, fullName?: string) => {
  const userRef = doc(db, "users", email);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid,
      email,
      fullName: fullName || "User", // Save the name in Firestore
      role: "user",
      createdAt: Date.now(),
    });
  }
};

export const googleLogin = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const isAgent = await checkAgent(user.email || "");
  if (isAgent) {
    await signOut(auth);
    throw new Error("Agents not allowed here");
  }

  // Pass Google displayName if available
  await createUserDoc(user.uid, user.email || "", user.displayName || "");

  return result;
};

export const login = async (email: string, password: string) => {
  const isAgent = await checkAgent(email);
  if (isAgent) {
    throw new Error("Agents not allowed here");
  }

  const result = await signInWithEmailAndPassword(auth, email, password);

  // We don't need to pass fullName on login since the doc should already exist
  await createUserDoc(result.user.uid, result.user.email || "");

  return result;
};

// Added fullName parameter
export const signup = async (email: string, password: string, fullName: string) => {
  const isAgent = await checkAgent(email);
  if (isAgent) {
    throw new Error("Agents not allowed here");
  }

  const result = await createUserWithEmailAndPassword(auth, email, password);

  // Attach the full name to the Firebase Auth object
  if (fullName) {
    await updateProfile(result.user, { displayName: fullName });
  }

  // Pass the fullName to be saved in Firestore
  await createUserDoc(result.user.uid, result.user.email || "", fullName);

  return result;
};

export const logout = async () => {
  await signOut(auth);
};