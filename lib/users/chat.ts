// lib/users/chat.ts
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db, realtimeDb } from "../firebase";
import { ref, push, set, onChildAdded, off } from "firebase/database";
import { fetchUserProfile, UserProfile } from "./profile";
import {
  ConversationContext,
  ConversationDoc,
  NewConversationParams,
  ChatMessage,
  MessagePayload,
} from "../chat/types";

/** Ensure user has completed required identity fields */
const ensureUserIdentity = async (email: string): Promise<UserProfile> => {
  const profile = await fetchUserProfile(email);
  if (!profile) throw new Error("User profile not found.");
  const required = [
    profile.phoneNumber,
    profile.governmentIdType,
    profile.governmentIdNumber,
    profile.governmentIdImageUrl,
    profile.identityConsentAccepted,
  ];
  if (required.includes(undefined) || profile.identityConsentAccepted !== true) {
    throw new Error(
      "Complete identity details and accept consent before starting a conversation."
    );
  }
  return profile;
};

/** Create a new conversation (user‑initiated). Returns conversationId */
export const createUserConversation = async (
  params: NewConversationParams,
  userEmail: string
): Promise<string> => {
  const userProfile = await ensureUserIdentity(userEmail);

  // Check if conversation already exists to prevent duplicates
  const q = query(
    collection(db, "conversations"),
    where("userId", "==", userProfile.uid),
    where("agentId", "==", params.agentId),
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
    agentId: params.agentId,
    agentName: params.agentName,
    agentEmail: params.agentEmail,
    userId: userProfile.uid,
    userName: userProfile.fullName || userProfile.email.split("@")[0],
    userEmail: userProfile.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: "",
    lastMessageAt: null,
    unreadByAgent: true,
    unreadByUser: false,
    status: "active",
  } as any);

  return convRef.id;
};

/** Fetch all conversations for a user */
export const fetchUserConversations = async (userId: string): Promise<ConversationDoc[]> => {
  const q = query(collection(db, "conversations"), where("userId", "==", userId));
  const snap = await getDocs(q);
  const result: ConversationDoc[] = [];
  snap.forEach((docSnap) => {
    result.push({ conversationId: docSnap.id, ...(docSnap.data() as any) } as ConversationDoc);
  });
  return result;
};

/** Mark conversation as read for user */
export const markConversationReadByUser = async (conversationId: string): Promise<void> => {
  const convDoc = doc(db, "conversations", conversationId);
  await updateDoc(convDoc, { unreadByUser: false, updatedAt: serverTimestamp() } as any);
};

/** Send a chat message (adds to Realtime DB and updates metadata) */
export const sendMessage = async (
  conversationId: string,
  payload: MessagePayload
): Promise<void> => {
  const messagesRef = ref(realtimeDb, `messages/${conversationId}`);
  const newMsgRef = push(messagesRef);
  const fullMsg: ChatMessage = {
    senderId: payload.senderId,
    senderRole: payload.senderRole,
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
  };
  if (payload.senderRole === "user") {
    updates.unreadByAgent = true;
  } else {
    updates.unreadByUser = true;
  }
  await updateDoc(convDoc, updates);
};

/** Listen for new messages in a conversation. Returns unsubscribe function */
export const listenToMessages = (
  conversationId: string,
  callback: (msg: ChatMessage) => void
): (() => void) => {
  const messagesRef = ref(realtimeDb, `messages/${conversationId}`);
  const handler = onChildAdded(messagesRef, (snapshot) => {
    const msg = snapshot.val() as ChatMessage;
    callback(msg);
  });
  // Return unsubscribe
  return () => off(messagesRef, "child_added", handler as any);
};
