'use client';

import React, { useState, useEffect } from 'react';
import { fetchUserConversations } from '@/lib/users/chat';
import { ConversationDoc } from '@/lib/chat/types';
import ChatWidget from '@/app/components/ChatWidget';
import { MessageSquare, RefreshCw } from 'lucide-react';

interface UserChatsSectionProps {
  userEmail: string;
  userId: string;
}

export default function UserChatsSection({ userEmail, userId }: UserChatsSectionProps) {
  const [conversations, setConversations] = useState<ConversationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeConversation, setActiveConversation] = useState<ConversationDoc | null>(null);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserConversations(userId);
      // Sort by updatedAt descending
      data.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
      setConversations(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [userId]);

  const openConversation = (conv: ConversationDoc) => {
    setActiveConversation(conv);
    setIsWidgetOpen(true);
  };

  const closeWidget = () => {
    setIsWidgetOpen(false);
    setActiveConversation(null);
    // Reload to update read status and last messages
    loadConversations();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="animate-spin text-warning h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-warning" />
          Your Conversations
        </h3>
        <button onClick={loadConversations} className="btn btn-ghost btn-xs text-zinc-400 hover:text-white">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          No conversations found. Inquire about a property to start a chat.
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conv) => (
            <div
              key={conv.conversationId}
              onClick={() => openConversation(conv)}
              className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                {conv.propertyImage ? (
                  <img src={conv.propertyImage} alt="Property" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {conv.propertyTitle ? conv.propertyTitle : 'General Inquiry'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    with {conv.agentName || 'Agent'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                    {conv.lastMessage ? conv.lastMessage : 'No messages yet.'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] text-zinc-500">
                  {conv.lastMessageAt ? conv.lastMessageAt.toDate().toLocaleDateString() : ''}
                </span>
                {conv.unreadByUser && (
                  <span className="badge badge-error badge-xs">New</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reusable Chat Widget */}
      <ChatWidget
        isOpen={isWidgetOpen}
        onClose={closeWidget}
        conversationId={activeConversation?.conversationId || null}
        currentUserId={userId}
        currentUserRole="user"
        title={activeConversation?.propertyTitle || 'Agent Inquiry'}
        subtitle={`with ${activeConversation?.agentName || 'Agent'}`}
        imageUrl={activeConversation?.propertyImage}
      />
    </div>
  );
}
