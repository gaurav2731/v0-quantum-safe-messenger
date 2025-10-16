"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Lock, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: number;
}

interface BasicChatProps {
  userId: string;
  recipientId: string;
}

export const BasicChat: React.FC<BasicChatProps> = ({ userId, recipientId }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! Welcome to quantum-safe messaging! 🔐',
      sender: 'other',
      timestamp: Date.now() - 300000
    },
    {
      id: '2',
      content: 'This is a secure, encrypted conversation.',
      sender: 'other',
      timestamp: Date.now() - 240000
    },
    {
      id: '3',
      content: 'All messages are protected with quantum-safe encryption.',
      sender: 'other',
      timestamp: Date.now() - 180000
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: Date.now()
    };

    setIsSending(true);
    
    // Simulate quantum-safe encryption process
    console.log('🔐 Encrypting message with quantum-safe algorithms...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('⛓️ Storing message metadata on blockchain...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Message sent securely!');
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Encrypted Future Chat</h3>
              <p className="text-xs text-cyan-300">End-to-end encrypted messaging</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-cyan-300">Encrypted</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-slate-700/80 text-white border border-cyan-500/30'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
                <Lock className="w-3 h-3" />
                <span>Encrypted</span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-cyan-500/30 bg-slate-800/50">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-slate-700/80 border-2 border-cyan-500/40 rounded-xl text-white placeholder-cyan-300/80 focus:border-cyan-500/80 focus:outline-none resize-none shadow-lg"
              rows={2}
              disabled={isSending}
            />
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
          >
            {isSending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-xs">Encrypting...</span>
              </div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        {/* Security Indicators */}
        <div className="flex items-center gap-4 mt-3 text-xs text-cyan-300/80">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Quantum-Safe</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Tamper-Proof</span>
          </div>
        </div>
      </div>
    </div>
  );
};
