'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, ChatState, Chat } from '@/types/chat';
import ChatMessage from '@/components/ChatMessage';
import ChatSidebar from '@/components/ChatSidebar';

export default function Home() {
  const [chatState, setChatState] = useState<ChatState>({
    chats: [],
    currentChatId: null,
    isLoading: false,
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getCurrentChat = () => {
    return chatState.currentChatId 
      ? chatState.chats.find(chat => chat.id === chatState.currentChatId)
      : null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.chats, chatState.currentChatId]);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setChatState(prev => ({
      ...prev,
      chats: [newChat, ...prev.chats],
      currentChatId: newChat.id,
    }));
  };

  const handleChatSelect = (chatId: string) => {
    setChatState(prev => ({
      ...prev,
      currentChatId: chatId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatState.isLoading || !chatState.currentChatId) return;

    const currentChat = getCurrentChat();
    if (!currentChat) return;

    const newMessage: Message = { role: 'user', content: input };
    
    setChatState(prev => ({
      ...prev,
      chats: prev.chats.map(chat => 
        chat.id === prev.currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              updatedAt: new Date().toISOString(),
            }
          : chat
      ),
      isLoading: true,
    }));
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...currentChat.messages, newMessage] }),
      });

      const data = await response.json();
      
      if (data.message) {
        setChatState(prev => ({
          ...prev,
          chats: prev.chats.map(chat =>
            chat.id === prev.currentChatId
              ? {
                  ...chat,
                  messages: [...chat.messages, data.message],
                  title: chat.messages.length === 0 ? data.message.content.slice(0, 30) + '...' : chat.title,
                  updatedAt: new Date().toISOString(),
                }
              : chat
          ),
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error:', error);
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="flex h-screen max-h-screen bg-gray-50">
      <ChatSidebar
        chats={chatState.chats}
        currentChatId={chatState.currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="p-4 bg-white border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-center text-gray-900">Chat with Phi</h1>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {getCurrentChat()?.messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {chatState.isLoading && (
            <div className="text-center text-gray-900 mt-4">
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={chatState.isLoading || !chatState.currentChatId}
            />
            <button
              type="submit"
              disabled={chatState.isLoading || !chatState.currentChatId}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
