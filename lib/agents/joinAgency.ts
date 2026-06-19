import {
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAgentData } from "../agents";
import {
  Agency,
  AgencyJoinRequest,
  AgencyProperty,
  getAgencyById,
  getAgencyProperties,
  approveJoinRequest,
  rejectJoinRequest,
  removeAgentFromAgency,
} from "../agency";
import { AgentData } from "@/utils/user";

const agenciesCol = collection(db, "agencies");

export type PendingAgencyRequest = {
  agencyId: string;
  agencyName: string;
  requestedAt: number;
};

const getAgentRef = (uid: string) => doc(db, "agents", uid);

export const findAgencyByInviteCode = async (inviteCode: string): Promise<Agency | null> => {
  const q = query(agenciesCol, where("inviteCode", "==", inviteCode.trim().toUpperCase()));
  const snaps = await getDocs(q);
  if (snaps.empty) return null;
  const agencyDoc = snaps.docs[0];
  return { agencyId: agencyDoc.id, ...(agencyDoc.data() as any) } as Agency;
};

export const submitAgencyJoinRequest = async (inviteCode: string, agent: AgentData): Promise<void> => {
  if (!agent.email || !agent.uid) {
    throw new Error("Agent identity is incomplete.");
  }

  const agency = await findAgencyByInviteCode(inviteCode);
  if (!agency) {
    throw new Error("Invite code not found. Please check and try again.");
  }
  if (agency.agencyStatus !== "approved") {
    throw new Error("This agency is still pending approval and cannot accept join requests yet.");
  }

  const alreadyMember = agency.agents?.some((item) => item.agentId === agent.uid);
  if (alreadyMember) {
    throw new Error("You are already a member of this agency.");
  }

  const alreadyRequested = agency.joinRequests?.some((item) => item.agentId === agent.uid);
  if (alreadyRequested) {
    throw new Error("Your request is already pending approval.");
  }

  const request: AgencyJoinRequest = {
    agentId: agent.uid,
    name: agent.fullName || "Unknown Agent",
    email: agent.email,
    requestedAt: Date.now(),
  };

  const agencyRef = doc(db, "agencies", agency.agencyId);
  await updateDoc(agencyRef, {
    joinRequests: arrayUnion(request),
  });

  const agentRef = getAgentRef(agent.uid);
  await setDoc(
    agentRef,
    {
      pendingAgencyRequest: {
        agencyId: agency.agencyId,
        agencyName: agency.agencyName,
        requestedAt: request.requestedAt,
      },
    },
    { merge: true }
  );
};

export const getAgentActiveAgency = async (agent: AgentData): Promise<Agency | null> => {
  const active: any = (agent as any).activeAgency;
  if (!active) return null;

  // Support several possible shapes: { agencyId }, { id }, string agencyId, or DocumentReference
  let agencyId: string | null = null;

  if (typeof active === "string") {
    agencyId = active;
  } else if (active?.agencyId) {
    agencyId = active.agencyId;
  } else if (active?.id) {
    agencyId = active.id;
  } else if (active?.agencyID) {
    agencyId = active.agencyID;
  } else if (active?.agency_id) {
    agencyId = active.agency_id;
  } else if (active?.path) {
    // maybe a DocumentReference-like object
    const parts = String(active.path).split("/");
    agencyId = parts[parts.length - 1] || null;
  }

  if (!agencyId) return null;
  return getAgencyById(agencyId);
};

export const getAgentPendingRequest = (agent: AgentData): PendingAgencyRequest | null => {
  return ((agent as any).pendingAgencyRequest as PendingAgencyRequest) || null;
};

export const getAgentPropertiesUnderAgency = async (agencyId: string, agentId: string): Promise<AgencyProperty[]> => {
  const properties = await getAgencyProperties(agencyId);
  return properties.filter((property) => property.agentId === agentId);
};

export const leaveAgency = async (agent: AgentData): Promise<void> => {
  const activeAgency = (agent as any).activeAgency as { agencyId: string; agencyName: string } | undefined;
  if (!activeAgency?.agencyId) {
    throw new Error("No active agency found.");
  }

  await removeAgentFromAgency(activeAgency.agencyId, agent.uid);

  const agentRef = getAgentRef(agent.uid!);
  await updateDoc(agentRef, {
    activeAgency: deleteField(),
    pendingAgencyRequest: deleteField(),
  });
};

export const approveAgencyJoinRequest = async (agencyId: string, request: AgencyJoinRequest): Promise<void> => {
  await approveJoinRequest(agencyId, request);
  const agency = await getAgencyById(agencyId);
  const agentRef = getAgentRef(request.agentId);
  await setDoc(
    agentRef,
    {
      activeAgency: {
        agencyId,
        agencyName: agency?.agencyName || "Unknown Agency",
      },
      pendingAgencyRequest: deleteField(),
    },
    { merge: true }
  );
};

export const rejectAgencyJoinRequest = async (agencyId: string, request: AgencyJoinRequest): Promise<void> => {
  await rejectJoinRequest(agencyId, request.agentId);
  const agentRef = getAgentRef(request.agentId);
  await setDoc(
    agentRef,
    {
      pendingAgencyRequest: deleteField(),
    },
    { merge: true }
  );
};

export const clearAgentPendingRequest = async (uid: string): Promise<void> => {
  const agentRef = getAgentRef(uid);
  await updateDoc(agentRef, {
    pendingAgencyRequest: deleteField(),
  });
};
