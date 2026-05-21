import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Agency, AgencyAgent } from "../agency";

/**
 * Maps a property to an agent inside their agency's agents list.
 * Adds or updates the property in `agency.agents[].listedProperties[]`.
 */
export const mapPropertyToAgency = async (
  agencyId: string,
  agentId: string,
  propertyId: string,
  propertyTitle: string
): Promise<void> => {
  if (!agencyId || !agentId) return;

  const agencyRef = doc(db, "agencies", agencyId);
  const snap = await getDoc(agencyRef);
  if (!snap.exists()) {
    throw new Error("Agency not found.");
  }

  const agency = snap.data() as Agency;
  const agents = agency.agents || [];

  const updatedAgents = agents.map((agent: AgencyAgent) => {
    if (agent.agentId === agentId) {
      const listed = agent.listedProperties || [];
      const exists = listed.some((p) => p.propertyId === propertyId);
      const newListed = exists
        ? listed.map((p) =>
            p.propertyId === propertyId
              ? { ...p, propertyTitle, listedAt: p.listedAt || Date.now() }
              : p
          )
        : [...listed, { propertyId, propertyTitle, listedAt: Date.now() }];
      return { ...agent, listedProperties: newListed };
    }
    return agent;
  });

  await updateDoc(agencyRef, { agents: updatedAgents });
};

/**
 * Unmaps a property from an agent inside their agency's agents list.
 * Removes the property from `agency.agents[].listedProperties[]`.
 */
export const unmapPropertyFromAgency = async (
  agencyId: string,
  agentId: string,
  propertyId: string
): Promise<void> => {
  if (!agencyId || !agentId) return;

  const agencyRef = doc(db, "agencies", agencyId);
  const snap = await getDoc(agencyRef);
  if (!snap.exists()) return;

  const agency = snap.data() as Agency;
  const agents = agency.agents || [];

  const updatedAgents = agents.map((agent: AgencyAgent) => {
    if (agent.agentId === agentId) {
      const listed = agent.listedProperties || [];
      const newListed = listed.filter((p) => p.propertyId !== propertyId);
      return { ...agent, listedProperties: newListed };
    }
    return agent;
  });

  await updateDoc(agencyRef, { agents: updatedAgents });
};
