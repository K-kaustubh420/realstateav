// /hooks/useAgentPublicProfile.ts
import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Agent } from "../utils/user";


export interface AgentPublicData {
  profile: Agent | null;
  listings: any[];
  loading: boolean;
  error: string | null;
}

export const useAgentPublicProfile = (agentId: string | null) => {
  const [data, setData] = useState<AgentPublicData>({
    profile: null,
    listings: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
  let isMounted = true;

  const fetchPublicProfile = async () => {
    if (!agentId) {
      if (isMounted) {
        setData(prev => ({ ...prev, loading: false, error: "No Agent ID provided" }));
      }
      return;
    }

    try {
      const agentRef = doc(db, "agents", agentId);
      const agentSnap = await getDoc(agentRef);

      if (!agentSnap.exists()) {
        if (isMounted) {
          setData(prev => ({ ...prev, loading: false, error: "Agent not found" }));
        }
        return;
      }

      const agentData = agentSnap.data() as Agent;

      const listingsQuery = query(
        collection(db, "properties"),
        where("agentId", "==", agentId),
        where("status", "==", "active")
      );

      const listingsSnap = await getDocs(listingsQuery);
      const listingsData = listingsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (isMounted) {
        setData({
          profile: agentData,
          listings: listingsData,
          loading: false,
          error: null,
        });
      }

    } catch (err) {
      if (isMounted) {
        setData(prev => ({ ...prev, loading: false, error: "Failed to load profile" }));
      }
    }
  };

  fetchPublicProfile();

  return () => {
    isMounted = false;
  };
}, [agentId]);


  return data;
};