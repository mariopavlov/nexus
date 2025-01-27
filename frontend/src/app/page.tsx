'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, ChatState, Chat } from '@/types/chat';
import ChatMessage from '@/components/ChatMessage';
import ChatSidebar from '@/components/ChatSidebar';
import * as api from '@/services/api';

export default function Home() {
  const [chatState, setChatState] = useState<ChatState>({
    chats: [],
    currentChatId: null,
    isLoading: false,
    selectedModel: '',
  });
  const [input, setInput] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
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

  // Load chats and models on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Test API connectivity first
        console.log('Testing API connectivity...');
        const testResponse = await fetch('http://localhost:8080/chats', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }).catch(error => {
          console.error('API connectivity test failed:', {
            name: error.name,
            message: error.message,
            cause: error.cause,
            stack: error.stack,
            toString: error.toString()
          });
          throw error;
        });

        console.log('API test response:', {
          status: testResponse.status,
          ok: testResponse.ok,
          statusText: testResponse.statusText,
          headers: Object.fromEntries(testResponse.headers.entries())
        });

        console.log('Starting to load chats and models...');
        const [chatsResponse, models] = await Promise.all([
          api.listChats().catch(error => {
            console.error('Failed to load chats:', {
              name: error.name,
              message: error.message,
              cause: error.cause,
              stack: error.stack
            });
            return [];
          }),
          api.listModels().catch(error => {
            console.error('Failed to load models:', {
              name: error.name,
              message: error.message,
              cause: error.cause,
              stack: error.stack
            });
            return [];
          }),
        ]);

        console.log('Received responses:', { chatsResponse, models });

        const chats = chatsResponse || [];
        setChatState(prev => ({
          ...prev,
          chats: chats,
          currentChatId: chats?.length > 0 ? chats[0].id : null,
          selectedModel: models?.[0] || '',
        }));
        if (Array.isArray(models) && models.length > 0) {
          setAvailableModels(models);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setChatState(prev => ({
          ...prev,
          chats: [],
          currentChatId: null,
        }));
        setAvailableModels([]);
      }
    };
    loadInitialData();
  }, []);

  const handleNewChat = async () => {
    try {
      const newChat = await api.createChat('New Chat');
      setChatState(prev => ({
        ...prev,
        chats: [newChat, ...prev.chats],
        currentChatId: newChat.id,
      }));
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleChatSelect = async (chatId: string) => {
    try {
      console.log('Selecting chat:', chatId);
      const chat = await api.getChat(chatId);
      
      setChatState(prev => ({
        ...prev,
        currentChatId: chatId,
        chats: prev.chats.map(c => 
          c.id === chatId ? chat : c
        ),
      }));
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await api.deleteChat(chatId);
      setChatState(prev => ({
        ...prev,
        chats: prev.chats.filter(chat => chat.id !== chatId),
        currentChatId: prev.currentChatId === chatId ? null : prev.currentChatId,
      }));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatState.isLoading || !chatState.currentChatId) return;

    const currentChat = getCurrentChat();
    if (!currentChat) return;

    setChatState(prev => ({ ...prev, isLoading: true }));
    setInput('');

    try {
      // Send the message
      const message = await api.sendMessage(
        chatState.currentChatId,
        input,
        chatState.selectedModel
      );

      // Get the updated chat with all messages
      const updatedChat = await api.getChat(chatState.currentChatId);
      
      setChatState(prev => ({
        ...prev,
        chats: prev.chats.map(chat =>
          chat.id === prev.currentChatId ? updatedChat : chat
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleEditTitle = async () => {
    if (!chatState.currentChatId || !newTitle.trim()) return;
    
    try {
      console.log('Starting title update:', { chatId: chatState.currentChatId, newTitle });
      const updatedChat = await api.updateChatTitle(chatState.currentChatId, newTitle.trim());
      console.log('Title update successful:', updatedChat);
      
      setChatState(prev => ({
        ...prev,
        chats: prev.chats.map(chat =>
          chat.id === prev.currentChatId 
            ? { ...chat, title: newTitle.trim() }
            : chat
        ),
      }));
      setEditingTitle(false);
    } catch (error) {
      console.error('Error updating chat title:', {
        error,
        message: error.message,
        type: error.constructor.name,
      });
      // Keep the edit mode active on error
      alert('Failed to update chat title. Please try again.');
    }
  };

  return (
    <div className="flex h-screen max-h-screen bg-gray-50">
      <ChatSidebar
        chats={chatState.chats}
        currentChatId={chatState.currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="p-4 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {editingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={handleEditTitle}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTitle(false)}
                    className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {getCurrentChat()?.title || 'Chat with AI'}
                  </h1>
                  {getCurrentChat() && (
                    <button
                      onClick={() => {
                        setNewTitle(getCurrentChat()?.title || '');
                        setEditingTitle(true);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
            <select
              value={chatState.selectedModel}
              onChange={(e) => setChatState(prev => ({ ...prev, selectedModel: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableModels.map(model => (
                <option key={model} value={model}>
                  {model.charAt(0).toUpperCase() + model.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {getCurrentChat()?.messages?.map((message, index) => (
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
