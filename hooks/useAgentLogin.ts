"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const useAgentLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Strict Validation logic ---
  const validateAgent = async (userEmail: string | null, uid: string) => {
    // 1. Strict check: Deny if registered in "users" collection (Client/General User)
    if (userEmail) {
      const userRefByEmail = doc(db, "users", userEmail);
      const userSnapByEmail = await getDoc(userRefByEmail);
      if (userSnapByEmail.exists()) return null;
    }
    const userRefByUid = doc(db, "users", uid);
    const userSnapByUid = await getDoc(userRefByUid);
    if (userSnapByUid.exists()) return null;

    let agentDoc = null;
    let docRef = null;

    // 2. Check if agent document exists by email
    if (userEmail) {
      docRef = doc(db, "agents", userEmail);
      const agentSnapByEmail = await getDoc(docRef);
      if (agentSnapByEmail.exists()) {
        agentDoc = agentSnapByEmail.data();
      }
    }

    // 3. Check by uid as document ID
    if (!agentDoc) {
      docRef = doc(db, "agents", uid);
      const agentSnapByUid = await getDoc(docRef);
      if (agentSnapByUid.exists()) {
        agentDoc = agentSnapByUid.data();
      }
    }

    // 4. Search documents inside "agents" matching email or uid
    if (!agentDoc && userEmail) {
      const agentsCol = collection(db, "agents");
      const qEmail = query(agentsCol, where("email", "==", userEmail));
      const snapsEmail = await getDocs(qEmail);
      if (!snapsEmail.empty) {
        docRef = doc(db, "agents", snapsEmail.docs[0].id);
        agentDoc = snapsEmail.docs[0].data();
      }
    }

    if (!agentDoc) {
      const agentsCol = collection(db, "agents");
      const qUid = query(agentsCol, where("uid", "==", uid));
      const snapsUid = await getDocs(qUid);
      if (!snapsUid.empty) {
        docRef = doc(db, "agents", snapsUid.docs[0].id);
        agentDoc = snapsUid.docs[0].data();
      }
    }

    // Ensure role is "agent" or "agency"
    if (agentDoc && (agentDoc.role === "agent" || agentDoc.role === "agency")) {
      // Auto-update UID field if missing or not matching
      if (docRef && (!agentDoc.uid || agentDoc.uid !== uid)) {
        try {
          await updateDoc(docRef, { uid });
        } catch (e) {
          console.error("Failed to auto-update agent UID:", e);
        }
      }
      return agentDoc;
    }

    return null;
  };

  const handleSuccessRedirect = (uid: string) => {
    const returnUrl = searchParams?.get("redirect");
    if (returnUrl) {
      router.push(returnUrl);
    } else {
      router.push("/agentportal/dashboard");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      const agentData = await validateAgent(user.email, user.uid);

      if (!agentData) {
        throw new Error("unauthorized_agent");
      }

      handleSuccessRedirect(user.uid);
    } catch (err: any) {
      console.error("Login Check Failed:", err);
      await signOut(auth); // Force sign out

      if (err.message === "unauthorized_agent") {
        setError("Access Denied: Account not found in agent records.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const agentData = await validateAgent(user.email, user.uid);

      if (!agentData) {
        await signOut(auth); // Force sign out immediately
        setError("Access Denied: No Agent account associated with this Google ID.");
        return;
      }

      handleSuccessRedirect(user.uid);
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled.");
      } else {
        setError("Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleEmailLogin,
    handleGoogleLogin,
  };
};