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
import { generateAgentSlug } from "@/lib/agents/utils";

export const useAgencyLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Strict Validation logic ---
  const validateAgent = async (userEmail: string | null, uid: string) => {
    // 1. Strict check: If registered in "users" collection (Client/General User), return a special flag
    if (userEmail) {
      const userRefByEmail = doc(db, "users", userEmail);
      const userSnapByEmail = await getDoc(userRefByEmail);
      if (userSnapByEmail.exists()) return { type: "user" };
    }
    const userRefByUid = doc(db, "users", uid);
    const userSnapByUid = await getDoc(userRefByUid);
    if (userSnapByUid.exists()) return { type: "user" };

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
      agentDoc.uid = uid;
      return { type: "agent", data: agentDoc };
    }

    return { type: "none" };
  };

  const handleSuccessRedirect = async (agentData: any) => {
    // Check if the agent has an agency
    const { getAgencyByOwnerEmail } = await import("@/lib/agency/agency");
    const agency = await getAgencyByOwnerEmail(agentData.email);

    if (!agency) {
      router.push("/agencyportal/register");
      return;
    }

    const returnUrl = searchParams?.get("redirect");
    if (returnUrl) {
      router.push(returnUrl);
    } else {
      const slug = encodeURIComponent(`${agency.agencyName}-${agency.agencyId}`);
      router.push(`/agencyportal/${slug}?view=dashboard`);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      const validation = await validateAgent(user.email, user.uid);

      if (validation.type === "user") {
        throw new Error("normal_user_blocked");
      }

      if (validation.type !== "agent" || !validation.data) {
        throw new Error("unauthorized_agent");
      }

      await handleSuccessRedirect(validation.data);
    } catch (err: any) {
      console.error("Login Check Failed:", err);
      await signOut(auth); // Force sign out

      if (err.message === "normal_user_blocked") {
        localStorage.setItem("block_portals_until", (Date.now() + 3 * 60 * 60 * 1000).toString());
        router.push("/");
      } else if (err.message === "unauthorized_agent") {
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

      const validation = await validateAgent(user.email, user.uid);

      if (validation.type === "user") {
        localStorage.setItem("block_portals_until", (Date.now() + 3 * 60 * 60 * 1000).toString());
        await signOut(auth);
        router.push("/");
        return;
      }

      if (validation.type !== "agent" || !validation.data) {
        await signOut(auth); // Force sign out immediately
        setError("Access Denied: No Agent account associated with this Google ID.");
        return;
      }

      await handleSuccessRedirect(validation.data);
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