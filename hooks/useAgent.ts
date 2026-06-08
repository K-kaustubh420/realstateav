"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import  { Agent } from "../utils/user"

export function useAgent() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAgent, setIsAgent] = useState(false);
    const [agentData, setAgentData] = useState<Agent | null>(null); // Store basic agent data to avoid re-fetching in page

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                setUser(null);
                setIsAgent(false);
                setAgentData(null);
                setLoading(false);
                return;
            }

            setUser(currentUser);
            
            try {
                // Check if user has 'agent' role
                const docRef = doc(db, "agents", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().role === "agent") {
                    setIsAgent(true);
                    setAgentData(docSnap.data() as Agent);
                } else {
                    setIsAgent(false);
                    setAgentData(null);
                }
            } catch (error) {
                console.error("Error verifying agent role:", error);
                setIsAgent(false);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return { user, loading, isAgent, agentData, setAgentData };
}