"use client";

import React, { useState, useEffect } from 'react';
import { fetchAgentConversations } from '@/lib/agents/chat';
import { getAgentData, AgentData } from '@/lib/agents';
import { ConversationDoc } from '@/lib/chat/types';
import ChatWidget from '@/app/components/ChatWidget';
import { MessageCircle, RefreshCw } from 'lucide-react';

interface AgentChatsSectionProps {
  email: string;
}

export default function AgentChatsSection({ email }: AgentChatsSectionProps) {
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [conversations, setConversations] = useState<ConversationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeConversation, setActiveConversation] = useState<ConversationDoc | null>(null);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const agent = await getAgentData(email);
      if (!agent) {
        setError('Agent not found.');
        setLoading(false);
        return;
      }
      setAgentData(agent);

      const data = await fetchAgentConversations(agent.uid);
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
  }, [email]);

  const openConversation = (conv: ConversationDoc) => {
    setActiveConversation(conv);
    setIsWidgetOpen(true);
  };

  const closeWidget = () => {
    setIsWidgetOpen(false);
    setActiveConversation(null);
    loadConversations();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="animate-spin text-[#D4AF37] h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-[#D4AF37]" />
            Direct Inquiries & Chats
          </h3>
          <p className="text-sm text-slate-400 mt-1">Manage all user communications.</p>
        </div>
        <button onClick={loadConversations} className="p-2 rounded-full hover:bg-white/10 transition text-slate-400 hover:text-white">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-black/40 py-16 text-center text-slate-400">
          <MessageCircle className="mx-auto h-12 w-12 text-slate-600 mb-4" />
          <p className="text-lg font-medium text-white">No active conversations</p>
          <p className="mt-2 text-sm text-slate-500">When users inquire about properties or contact you directly, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conv) => (
            <div
              key={conv.conversationId}
              onClick={() => openConversation(conv)}
              className="flex items-center justify-between p-5 bg-zinc-950/80 border border-white/10 rounded-2xl hover:border-[#D4AF37]/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                {conv.propertyImage ? (
                  <img src={conv.propertyImage} alt="Property" className="w-14 h-14 rounded-xl object-cover border border-white/5" />
                ) : (
                  <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 border border-white/5">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white text-base group-hover:text-[#D4AF37] transition-colors">
                    {conv.propertyTitle ? conv.propertyTitle : 'General Inquiry'}
                  </h4>
                  <p className="text-sm text-slate-400">
                    User: {conv.userName || 'Guest User'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-1 italic">
                    {conv.lastMessage ? `"${conv.lastMessage}"` : 'No messages yet.'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                  {conv.lastMessageAt ? conv.lastMessageAt.toDate().toLocaleDateString() : ''}
                </span>
                {conv.unreadByAgent && (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    New
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {agentData && (
        <ChatWidget
          isOpen={isWidgetOpen}
          onClose={closeWidget}
          conversationId={activeConversation?.conversationId || null}
          currentUserId={agentData.uid}
          currentUserRole="agent"
          title={activeConversation?.propertyTitle || 'General Inquiry'}
          subtitle={`with ${activeConversation?.userName || 'User'}`}
          imageUrl={activeConversation?.propertyImage}
        />
      )}
    </div>
  );
}
