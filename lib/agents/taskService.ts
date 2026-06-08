// @/lib/agents/taskService.ts

export interface AgentTask {
  id: string;
  title: string;
  completed: boolean;
}

export async function fetchAgentTasks(agentUid: string): Promise<AgentTask[]> {
  return [
    { id: "task-1", title: "Follow Up Leads", completed: false },
    { id: "task-2", title: "Pending Property Review", completed: false },
    { id: "task-3", title: "Schedule Site Visits", completed: true },
    { id: "task-4", title: "Respond To Messages", completed: false },
    { id: "task-5", title: "Complete Draft Listings", completed: true },
  ];
}
