// @/lib/agents/activityService.ts

export interface Activity {
  id: string;
  type: "lead" | "message" | "visit" | "deal" | "system";
  title: string;
  description: string;
  timestamp: number;
}

export async function fetchAgentActivity(agentUid: string): Promise<Activity[]> {
  return [
    { id: "act-1", type: "lead", title: "New Lead Inquiry", description: "Sarah Jenkins asked about Skyline Penthouse", timestamp: Date.now() - 3600000 },
    { id: "act-2", type: "message", title: "Message Received", description: "Amit Sharma sent you a message", timestamp: Date.now() - 7200000 },
    { id: "act-3", type: "visit", title: "Site Visit Scheduled", description: "David Chen at Downtown Loft", timestamp: Date.now() - 86400000 },
    { id: "act-4", type: "deal", title: "Negotiation Started", description: "Priya Patel made an offer on Garden Estate", timestamp: Date.now() - 172800000 },
    { id: "act-5", type: "system", title: "Listing Approved", description: "Lakeview Villa is now live", timestamp: Date.now() - 259200000 },
  ];
}
