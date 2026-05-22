import { collection, doc, getDoc, getDocs, query, setDoc, where, addDoc, deleteDoc, writeBatch, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export type GPS = { lat: number; lng: number };

export type AgencyAgent = {
  agentId: string;
  name: string;
  email: string;
  joinedAt?: number;
  status?: "pending" | "accepted";
  listedProperties?: Array<{ propertyId: string; propertyTitle: string; listedAt?: number }>;
};

export type AgencyJoinRequest = {
  agentId: string;
  name: string;
  email: string;
  requestedAt?: number;
};

export type AgencyProperty = {
  propertyId: string;
  propertyTitle?: string;
  agencyId?: string;
  agentId?: string;
  agentName?: string;
};

export type AgencyDetails = {
  about?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  website?: string;
  gstNumber?: string;
  logoUrl?: string;
  bannerUrl?: string;
  gpsLocation?: GPS;
};

export type Agency = {
  agencyId: string;
  agencyName: string;
  inviteCode?: string;
  agencyStatus?: "none" | "pending" | "approved" | "rejected";
  rejectionReason?: string;
  verificationRequested?: boolean;
  createdAt?: number;
  owner: { agentId: string; name: string; email: string };
  details?: AgencyDetails;
  agents?: AgencyAgent[];
  joinRequests?: AgencyJoinRequest[];
};

const agenciesCol = collection(db, "agencies");
const propertiesCol = collection(db, "properties");

const generateInviteCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

export const getAgencyByOwnerEmail = async (email: string): Promise<Agency | null> => {
  const q = query(agenciesCol, where("owner.email", "==", email));
  const snaps = await getDocs(q);
  if (snaps.empty) return null;
  const docSnap = snaps.docs[0];
  return { agencyId: docSnap.id, ...(docSnap.data() as any) } as Agency;
};

export const getAgencyById = async (agencyId: string): Promise<Agency | null> => {
  const ref = doc(db, "agencies", agencyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { agencyId: snap.id, ...(snap.data() as any) } as Agency;
};

export const getAgencyProperties = async (agencyId: string): Promise<AgencyProperty[]> => {
  const q = query(propertiesCol, where("agencyId", "==", agencyId));
  const snaps = await getDocs(q);
  return snaps.docs.map((docSnap) => ({ propertyId: docSnap.id, ...(docSnap.data() as any) })) as AgencyProperty[];
};

export const createAgency = async (owner: { agentId: string; name: string; email: string }, payload: Partial<AgencyDetails> & { agencyName: string }): Promise<string> => {
  const now = Date.now();
  const inviteCode = generateInviteCode();
  const docRef = await addDoc(agenciesCol, {
    agencyName: payload.agencyName,
    inviteCode,
    agencyStatus: "pending",
    verificationRequested: true,
    createdAt: now,
    owner,
    details: { ...payload, gpsLocation: payload.gpsLocation || { lat: 0, lng: 0 } },
    agents: [
      {
        agentId: owner.agentId,
        name: owner.name,
        email: owner.email,
        joinedAt: now,
        status: "accepted",
        listedProperties: [],
      },
    ],
    joinRequests: [],
  });

  // Auto-map owner as active agency member on their agent document
  const ownerAgentRef = doc(db, "agents", owner.email);
  await setDoc(
    ownerAgentRef,
    {
      activeAgency: {
        agencyId: docRef.id,
        agencyName: payload.agencyName,
        role: "owner",
      },
    },
    { merge: true }
  );

  return docRef.id;
};

export const updateAgency = async (agencyId: string, data: Partial<Agency>): Promise<void> => {
  const ref = doc(db, "agencies", agencyId);
  await setDoc(ref, data, { merge: true });
};

export const rotateAgencyInviteCode = async (agencyId: string): Promise<string> => {
  const code = generateInviteCode();
  await updateAgency(agencyId, { inviteCode: code });
  return code;
};

export const approveJoinRequest = async (agencyId: string, request: AgencyJoinRequest): Promise<void> => {
  const agency = await getAgencyById(agencyId);
  if (!agency) throw new Error("Agency not found.");
  const existing = agency.agents?.find((agent) => agent.agentId === request.agentId);
  if (existing) {
    await updateAgency(agencyId, {
      joinRequests: (agency.joinRequests || []).filter((item) => item.agentId !== request.agentId),
    });
    return;
  }

  const updatedAgents: AgencyAgent[] = [
    ...(agency.agents || []),
    {
      agentId: request.agentId,
      name: request.name,
      email: request.email,
      joinedAt: Date.now(),
      status: "accepted",
      listedProperties: [],
    },
  ];

  const updatedRequests = (agency.joinRequests || []).filter((item) => item.agentId !== request.agentId);
  await updateAgency(agencyId, { agents: updatedAgents, joinRequests: updatedRequests });
};

export const rejectJoinRequest = async (agencyId: string, requestAgentId: string): Promise<void> => {
  const agency = await getAgencyById(agencyId);
  if (!agency) throw new Error("Agency not found.");
  const updatedRequests = (agency.joinRequests || []).filter((item) => item.agentId !== requestAgentId);
  await updateAgency(agencyId, { joinRequests: updatedRequests });
};

export const removeAgentFromAgency = async (agencyId: string, agentId: string): Promise<void> => {
  const agency = await getAgencyById(agencyId);
  if (!agency) throw new Error("Agency not found.");
  if (agency.owner.agentId === agentId) {
    throw new Error("Agency owner cannot be removed.");
  }

  const agentToRemove = agency.agents?.find((agent) => agent.agentId === agentId);
  if (!agentToRemove) {
    throw new Error("Agent not found in this agency.");
  }

  const ownerAgent = agency.agents?.find((agent) => agent.agentId === agency.owner.agentId);
  if (!ownerAgent) {
    throw new Error("Agency owner record is missing.");
  }

  const updatedAgents = (agency.agents || []).filter((agent) => agent.agentId !== agentId);
  const propertyQuery = query(propertiesCol, where("agencyId", "==", agencyId), where("agentId", "==", agentId));
  const propertySnaps = await getDocs(propertyQuery);

  const batch = writeBatch(db);
  const updatedOwnerProperties = [...(ownerAgent.listedProperties || [])];

  propertySnaps.docs.forEach((propDoc) => {
    const prop = propDoc.data() as any;
    batch.update(propDoc.ref, {
      agentId: agency.owner.agentId,
      agentName: agency.owner.name,
    });

    updatedOwnerProperties.push({
      propertyId: propDoc.id,
      propertyTitle: prop.title || prop.propertyTitle || "",
      listedAt: Date.now(),
    });
  });

  const updatedOwnerAgent = {
    ...ownerAgent,
    listedProperties: updatedOwnerProperties,
  };

  const finalAgents = updatedAgents.map((agent) => (agent.agentId === agency.owner.agentId ? updatedOwnerAgent : agent));

  const agencyRef = doc(db, "agencies", agencyId);
  batch.update(agencyRef, { agents: finalAgents });

  await batch.commit();
};

export const getAgencyPropertiesByAgent = async (agencyId: string): Promise<AgencyProperty[]> => {
  return getAgencyProperties(agencyId);
};

export const deleteAgency = async (agencyId: string): Promise<void> => {
  const ref = doc(db, "agencies", agencyId);
  await deleteDoc(ref);
};
