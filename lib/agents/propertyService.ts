import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Property, PropertyScene, PropertyStatus } from "@/lib/properties/property.types";
import { getAgentData } from "@/lib/agents";
import { getAgentActiveAgency } from "@/lib/agents/joinAgency";
import { Agent } from "@/utils/user";

export interface AgentPropertiesResult {
  properties: Property[];
  agentData: Agent | null;
  activeAgency: { agencyId: string; agencyName: string } | null;
}

export async function fetchAgentPropertiesData(uid: string, email: string): Promise<AgentPropertiesResult> {
  const agent = await getAgentData(uid, email);
  if (!agent) {
    throw new Error("Unable to resolve agent profile.");
  }

  let activeAgency = null;
  const agencyRecord = await getAgentActiveAgency(agent);
  if (agencyRecord) {
    activeAgency = {
      agencyId: agencyRecord.agencyId,
      agencyName: agencyRecord.agencyName,
    };
  }

  const propertiesCol = collection(db, "properties");
  const qAgent = query(propertiesCol, where("agentId", "==", agent.uid));
  const snapAgent = await getDocs(qAgent);
  const agentProps = snapAgent.docs.map((d) => ({ id: d.id, ...d.data() } as Property));

  const qDrafts = query(propertiesCol, where("status", "==", "draft"));
  const snapDrafts = await getDocs(qDrafts);
  const userDrafts = snapDrafts.docs
    .map((d) => ({ id: d.id, ...d.data() } as Property))
    .filter((p) => p.userId && !p.agentId);

  const allPropsMap = new Map<string, Property>();
  agentProps.forEach((p) => allPropsMap.set(p.id, p));
  userDrafts.forEach((p) => allPropsMap.set(p.id, p));

  return {
    properties: Array.from(allPropsMap.values()),
    agentData: agent,
    activeAgency,
  };
}
