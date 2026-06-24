import { rotateAgencyInviteCode, removeAgentFromAgency } from "./agency";
import { approveAgencyJoinRequest, rejectAgencyJoinRequest } from "../agents/joinAgency";

export const rotateInviteCode = async (agencyId: string): Promise<string> => {
  try {
    return await rotateAgencyInviteCode(agencyId);
  } catch (error) {
    console.error("Error rotating invite code:", error);
    throw new Error("Failed to rotate invite code");
  }
};

export const removeAgent = async (agencyId: string, agentId: string): Promise<void> => {
  try {
    await removeAgentFromAgency(agencyId, agentId);
  } catch (error) {
    console.error("Error removing agent:", error);
    throw new Error("Failed to remove agent");
  }
};

export const approveAgentRequest = async (agencyId: string, request: { agentId: string; name: string; email: string }): Promise<void> => {
  try {
    await approveAgencyJoinRequest(agencyId, request);
  } catch (error) {
    console.error("Error approving agent request:", error);
    throw new Error("Failed to approve request");
  }
};

export const rejectAgentRequest = async (agencyId: string, request: { agentId: string; name: string; email: string }): Promise<void> => {
  try {
    await rejectAgencyJoinRequest(agencyId, request);
  } catch (error) {
    console.error("Error rejecting agent request:", error);
    throw new Error("Failed to reject request");
  }
};
