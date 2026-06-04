import { AgentData } from "@/lib/agents";

/**
 * Generates a URL-friendly slug for the agent dashboard.
 * Format: {first-name}-{uid} (fallback to "agent-{uid}")
 */
export const generateAgentSlug = (agentData: Partial<AgentData> & { uid: string }): string => {
  let namePart = "agent";
  
  if (agentData.fullName) {
    const parts = agentData.fullName.trim().split(" ");
    if (parts.length > 0) {
      // Use the first name
      namePart = parts[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    }
  }

  // Fallback if the name was entirely special characters
  if (!namePart) {
    namePart = "agent";
  }

  return `${namePart}-${agentData.uid}`;
};

/**
 * Parses the agent slug to extract the UID.
 * The slug format is {name}-{uid}. Since uid typically doesn't contain hyphens, 
 * we split by the first hyphen or just take the last part.
 * However, to be safe, we assume everything after the first hyphen is the UID.
 */
export const parseAgentSlug = (slug: string): string | null => {
  const parts = slug.split("-");
  if (parts.length < 2) return null;
  
  // Extract everything after the first hyphen as the UID
  return parts.slice(1).join("-");
};
