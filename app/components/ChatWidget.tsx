'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import { ChatMessage, MessagePayload } from '@/lib/chat/types';
import { listenToMessages as listenAgent } from '@/lib/agents/chat';
import { listenToMessages as listenUser, sendMessage as sendUserMsg, markConversationReadByUser } from '@/lib/users/chat';
import { sendMessageFromAgent, markConversationReadByAgent } from '@/lib/agents/chat';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string | null;
  currentUserId: string;
  currentUserRole: 'user' | 'agent';
  title?: string;
  subtitle?: string;
  imageUrl?: string | null;
}

export default function ChatWidget({
  isOpen,
  onClose,
  conversationId,
  currentUserId,
  currentUserRole,
  title = 'Chat',
  subtitle,
  imageUrl,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !conversationId) {
      setMessages([]);
      return;
    }

    // Mark as read immediately when opened
    if (currentUserRole === 'user') {
      markConversationReadByUser(conversationId).catch(console.error);
    } else {
      markConversationReadByAgent(conversationId).catch(console.error);
    }

    const listenerFn = currentUserRole === 'agent' ? listenAgent : listenUser;

    const unsubscribe = listenerFn(conversationId, (msg) => {
      setMessages((prev) => {
        // Prevent duplicate messages if any
        if (prev.some((m) => m.timestamp === msg.timestamp && m.senderId === msg.senderId && m.text === msg.text)) {
          return prev;
        }
        return [...prev, msg].sort((a, b) => a.timestamp - b.timestamp);
      });
    });

    return () => unsubscribe();
  }, [isOpen, conversationId, currentUserRole]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId || sending) return;

    setSending(true);
    const payload: MessagePayload = {
      text: inputText.trim(),
      senderId: currentUserId,
      senderRole: currentUserRole,
    };

    try {
      if (currentUserRole === 'agent') {
        await sendMessageFromAgent(conversationId, payload);
      } else {
        await sendUserMsg(conversationId, payload);
      }
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <img src={imageUrl} alt="Property" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                <User size={20} />
              </div>
            )}
            <div>
              <h3 className="text-white font-bold text-sm line-clamp-1">{title}</h3>
              {subtitle && <p className="text-xs text-zinc-400 line-clamp-1">{subtitle}</p>}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs">Send a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderId === currentUserId;
              return (
                <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-zinc-500 mb-1 px-1">
                    {msg.senderRole === 'agent' ? 'Agent' : 'User'} •{' '}
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div 
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      isMine 
                        ? 'bg-[#D4AF37] text-black rounded-tr-none font-medium' 
                        : 'bg-zinc-800 text-white border border-white/5 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-zinc-900/50">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-zinc-800 text-white text-sm rounded-full px-4 py-2 border border-white/10 focus:outline-none focus:border-[#D4AF37]/50 placeholder-zinc-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2 rounded-full bg-[#D4AF37] text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#c5a12e] transition"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
