import { Timestamp } from "firebase/firestore";

export type ConversationContext =
  | "property_listing"
  | "property_buying"
  | "property_rental"
  | "agent_finder";

export interface ConversationDoc {
  conversationId: string;
  conversationContext: ConversationContext;
  propertyId?: string | null;
  propertyTitle?: string | null;
  propertyImage?: string | null;
  agentId: string;
  agentName: string;
  agentEmail: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: Timestamp; // Firestore Timestamp
  updatedAt: Timestamp; // Firestore Timestamp
  lastMessage?: string;
  lastMessageAt?: Timestamp | null; // Firestore Timestamp
  unreadByAgent: boolean;
  unreadByUser: boolean;
  status: "active" | "closed";
}

export interface ChatMessage {
  senderId: string;
  senderRole: "user" | "agent";
  text: string;
  timestamp: number; // ms since epoch
  seen: boolean;
}

export interface NewConversationParams {
  conversationContext: ConversationContext;
  propertyId?: string | null;
  propertyTitle?: string | null;
  propertyImage?: string | null;
  agentId: string;
  agentName: string;
  agentEmail: string;
}

export interface MessagePayload {
  text: string;
  senderId: string;
  senderRole: "user" | "agent";
}
