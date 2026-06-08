// @/lib/agents/analyticsService.ts

export interface AnalyticsData {
  totalLeads: number;
  activeListings: number;
  totalViews: number;
  conversionRate: number;
}

export async function fetchAgentAnalytics(agentUid: string): Promise<AnalyticsData> {
  return {
    totalLeads: 42,
    activeListings: 15,
    totalViews: 12500,
    conversionRate: 12.5,
  };
}
