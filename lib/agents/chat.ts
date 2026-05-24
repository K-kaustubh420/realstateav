// lib/agents/chat.ts
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db, realtimeDb } from "../firebase";
import { ref, push, set, onChildAdded, off } from "firebase/database";
import { getAgentData } from "../agents";
import {

  ConversationDoc,
  NewConversationParams,
  ChatMessage,
  MessagePayload,
} from "../chat/types";

/** Create a new conversation initiated by an agent (only for agent_finder) */
export const createAgentConversation = async (
  params: NewConversationParams,
  agentId: string,
  targetUserId?: string,
  targetUserName?: string,
  targetUserEmail?: string
): Promise<string> => {
  if (params.conversationContext !== "agent_finder" && params.conversationContext !== "property_listing") {
    throw new Error("Agents can only start conversations for agent_finder or property_listing contexts.");
  }
  const agentData = await getAgentData(agentId);
  if (!agentData) throw new Error("Agent not found.");

  // Check if conversation already exists to prevent duplicates
  const q = query(
    collection(db, "conversations"),
    where("agentId", "==", agentData.uid),
    where("userId", "==", targetUserId || ""),
    where("propertyId", "==", params.propertyId ?? null),
    where("conversationContext", "==", params.conversationContext)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].id;
  }

  const convRef = await addDoc(collection(db, "conversations"), {
    conversationContext: params.conversationContext,
    propertyId: params.propertyId ?? null,
    propertyTitle: params.propertyTitle ?? null,
    propertyImage: params.propertyImage ?? null,
    agentId: agentData.uid,
    agentName: agentData.fullName || agentData.email,
    agentEmail: agentData.email,
    userId: targetUserId || "",
    userName: targetUserName || "",
    userEmail: targetUserEmail || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: "",
    lastMessageAt: null,
    unreadByAgent: false,
    unreadByUser: true,
    status: "active",
  } as unknown);

  return convRef.id;
};

/** Fetch all conversations for a given agent */
export const fetchAgentConversations = async (agentId: string): Promise<ConversationDoc[]> => {
  const q = query(collection(db, "conversations"), where("agentId", "==", agentId));
  const snap = await getDocs(q);
  const result: ConversationDoc[] = [];
  snap.forEach((docSnap) => {
    result.push({ conversationId: docSnap.id, ...(docSnap.data() as any) } as ConversationDoc);
  });
  return result;
};

/** Mark a conversation as read for the agent */
export const markConversationReadByAgent = async (conversationId: string): Promise<void> => {
  const convDoc = doc(db, "conversations", conversationId);
  await updateDoc(convDoc, { unreadByAgent: false, updatedAt: serverTimestamp() } as any);
};

/** Send a chat message from agent */
export const sendMessageFromAgent = async (
  conversationId: string,
  payload: MessagePayload
): Promise<void> => {
  const messagesRef = ref(realtimeDb, `messages/${conversationId}`);
  const newMsgRef = push(messagesRef);
  const fullMsg: ChatMessage = {
    senderId: payload.senderId,
    senderRole: "agent",
    text: payload.text,
    timestamp: Date.now(),
    seen: false,
  };
  await set(newMsgRef, fullMsg);

  const convDoc = doc(db, "conversations", conversationId);
  const updates: any = {
    lastMessage: payload.text,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    unreadByUser: true,
  };
  await updateDoc(convDoc, updates);
};

/** Listen for new messages in a conversation */
export const listenToMessages = (
  conversationId: string,
  callback: (msg: ChatMessage) => void
): (() => void) => {
  const messagesRef = ref(realtimeDb, `messages/${conversationId}`);
  const handler = onChildAdded(messagesRef, (snapshot) => {
    const msg = snapshot.val() as ChatMessage;
    callback(msg);
  });
  return () => off(messagesRef, "child_added", handler as any);
};
