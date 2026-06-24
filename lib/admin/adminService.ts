import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { Property } from '../../utils/property';
import { User, Agent } from '../../utils/user';

import { getPendingAgencies, approveAgency, rejectAgency, Agency as AgencyType } from '../agency/agency';

export class AdminService {
  static async fetchAllProperties(): Promise<Property[]> {
    const propsSnap = await getDocs(collection(db, 'properties'));
    const props: Property[] = [];
    propsSnap.forEach(d => props.push({ id: d.id, ...d.data() } as Property));
    return props;
  }

  static async fetchAllUsers(): Promise<User[]> {
    const usersSnap = await getDocs(collection(db, 'users'));
    const users: User[] = [];
    usersSnap.forEach(d => users.push({ id: d.id, ...d.data() } as unknown as User));
    return users;
  }

  static async fetchAllAgents(): Promise<Agent[]> {
    const agentsSnap = await getDocs(collection(db, 'agents'));
    const agents: Agent[] = [];
    agentsSnap.forEach(d => agents.push({ id: d.id, ...d.data() } as unknown as Agent));
    return agents;
  }

  static async fetchAllAgencies(): Promise<any[]> {
    const agencySnap = await getDocs(collection(db, 'agencies'));
    const agencies: any[] = [];
    agencySnap.forEach(d => agencies.push({ id: d.id, ...d.data() }));
    return agencies;
  }

  static async fetchPendingAgencies(): Promise<AgencyType[]> {
    return await getPendingAgencies();
  }

  static async approveAgencyRequest(agencyId: string): Promise<void> {
    return await approveAgency(agencyId);
  }

  static async rejectAgencyRequest(agencyId: string, reason: string): Promise<void> {
    return await rejectAgency(agencyId, reason);
  }

  static async fetchRecentChats(): Promise<any[]> {
    // Note: To properly fetch chats across the platform, you would query the 'chats' collection.
    // Assuming a 'chats' collection exists.
    const chatsQuery = query(collection(db, 'chats'), orderBy('lastMessageTime', 'desc'), limit(50));
    const chatsSnap = await getDocs(chatsQuery);
    const chats: any[] = [];
    chatsSnap.forEach(d => chats.push({ id: d.id, ...d.data() }));
    return chats;
  }

  static async updatePropertyStatus(propertyId: string, status: 'active' | 'inactive' | 'sold') {
    await updateDoc(doc(db, 'properties', propertyId), { status });
  }

  static async getDashboardMetrics() {
    const [properties, users, agents, agencies] = await Promise.all([
      this.fetchAllProperties(),
      this.fetchAllUsers(),
      this.fetchAllAgents(),
      this.fetchAllAgencies()
    ]);

    return {
      totalProperties: properties.length,
      activeProperties: properties.filter(p => p.status === 'active').length,
      totalUsers: users.length,
      totalAgents: agents.length,
      totalAgencies: agencies.length,
      properties,
      users,
      agents,
      agencies
    };
  }
}
