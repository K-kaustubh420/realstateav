"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export interface AgencyData {
  name: string;
  email: string;
  role: string;
  id_verify: 'pending' | 'submitted' | 'verified' | 'rejected' | 'unverified';
 
  // Add other fields as needed based on your schema
}

export function useAgency() {
  const [user, setUser] = useState<User | null>(null);
  const [agencyData, setAgencyData] = useState<AgencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAgency, setIsAgency] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          // Verify against 'agency' collection where role should be 'agency'
          // based on your schema description
          const docRef = doc(db, "agency", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Agency data:", data);
            if (data.role === "agency") {
                setIsAgency(true);
                setAgencyData(data as AgencyData);
            } else {
                setIsAgency(false);
            }
          } else {
            setIsAgency(false);
          }
        } catch (error) {
          console.error("Error verifying agency role:", error);
          setIsAgency(false);
        }
      } else {
        setUser(null);
        setIsAgency(false);
        setAgencyData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAgency, agencyData };
}