import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Property } from "@/utils/property";
import { Agent } from "@/utils/user";
import { getAgentDocRef } from "@/lib/agents";

export async function fetchAgentFullData(agentId: string): Promise<Agent | null> {
  try {
    const docRef = doc(db, "agents", agentId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Agent & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching agent full data:", error);
    return null;
  }
}

export async function fetchAgentDrafts(agentId: string, preferredLocations: string[] = []): Promise<Property[]> {
  try {
    const propertiesCol = collection(db, "properties");
    const qDrafts = query(propertiesCol, where("status", "==", "draft"));
    const snapDrafts = await getDocs(qDrafts);
    const allDrafts = snapDrafts.docs.map((d) => ({ id: d.id, ...d.data() } as Property));

    // Priority 1: explicitly assigned to this agent
    const assignedDrafts = allDrafts.filter(p => p.agentId === agentId);
    
    // Priority 2: matching preferred locations
    const preferredDrafts = allDrafts.filter(p => 
      !p.agentId && p.city && preferredLocations.some(loc => loc.toLowerCase().includes(p.city.toLowerCase()))
    );

    // Priority 3: other unclaimed drafts
    const otherDrafts = allDrafts.filter(p => 
      !p.agentId && (!p.city || !preferredLocations.some(loc => loc.toLowerCase().includes(p.city!.toLowerCase())))
    );

    return [...assignedDrafts, ...preferredDrafts, ...otherDrafts];
  } catch (error) {
    console.error("Error fetching agent drafts:", error);
    return [];
  }
}

export async function fetchAgentStats(agentId: string) {
  try {
    const propertiesCol = collection(db, "properties");
    
    // Total active properties
    const qActive = query(propertiesCol, where("agentId", "==", agentId), where("status", "==", "active"));
    const snapActive = await getDocs(qActive);
    const activeCount = snapActive.size;

    return {
      totalActiveProperties: activeCount,
      profileViews: Math.floor(Math.random() * 500) + 50 // Mock data for views
    };
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    return {
      totalActiveProperties: 0,
      profileViews: 0
    };
  }
}

export async function updateAgentProfile(agentUid: string, agentEmail: string, updates: Partial<Agent>): Promise<boolean> {
  try {
    const agentRef = await getAgentDocRef(agentUid, agentEmail);
    const firestoreUpdates: Record<string, any> = {};
    
    if (updates.name) {
      if (updates.name.firstname) firestoreUpdates["name.firstname"] = updates.name.firstname;
      if (updates.name.lastname) firestoreUpdates["name.lastname"] = updates.name.lastname;
    }
    if (updates.fullName) firestoreUpdates["fullName"] = updates.fullName;
    if (updates.about !== undefined) firestoreUpdates["about"] = updates.about;
    
    if (updates.number?.mobilenumber) {
      firestoreUpdates["number.mobilenumber"] = updates.number.mobilenumber;
    }
    
    if (updates.Address) {
      if (updates.Address.addressLine1 !== undefined) firestoreUpdates["Address.addressLine1"] = updates.Address.addressLine1;
      if (updates.Address.city !== undefined) firestoreUpdates["Address.city"] = updates.Address.city;
      if (updates.Address.state !== undefined) firestoreUpdates["Address.state"] = updates.Address.state;
    }

    await updateDoc(agentRef, firestoreUpdates);
    return true;
  } catch (error) {
    console.error("Error updating agent profile:", error);
    return false;
  }
}

export async function updateAgentPreferences(agentUid: string, agentEmail: string, preferredLocations: string[]): Promise<boolean> {
  try {
    const agentRef = await getAgentDocRef(agentUid, agentEmail);
    await updateDoc(agentRef, { preferredLocations });
    return true;
  } catch (error) {
    console.error("Error updating agent preferences:", error);
    return false;
  }
}
