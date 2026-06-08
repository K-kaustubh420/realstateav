// @/lib/agents/leadService.ts

export interface Lead {
  id: string;
  name: string;
  phone: string;
  propertyOfInterest: string;
  status: "New" | "Contacted" | "Site Visit" | "Negotiation" | "Closed";
  createdAt: number;
}

export async function fetchAgentLeads(agentUid: string): Promise<Lead[]> {
  // Mock data for the kanban pipeline
  return [
    { id: "lead-1", name: "Sarah Jenkins", phone: "+91 9876543210", propertyOfInterest: "Skyline Penthouse", status: "New", createdAt: Date.now() - 86400000 },
    { id: "lead-2", name: "Amit Sharma", phone: "+91 8765432109", propertyOfInterest: "Lakeview Villa", status: "Contacted", createdAt: Date.now() - 172800000 },
    { id: "lead-3", name: "David Chen", phone: "+91 7654321098", propertyOfInterest: "Downtown Loft", status: "Site Visit", createdAt: Date.now() - 259200000 },
    { id: "lead-4", name: "Priya Patel", phone: "+91 6543210987", propertyOfInterest: "Garden Estate", status: "Negotiation", createdAt: Date.now() - 345600000 },
    { id: "lead-5", name: "Michael Ross", phone: "+91 5432109876", propertyOfInterest: "Commercial Space", status: "Closed", createdAt: Date.now() - 432000000 },
  ];
}
