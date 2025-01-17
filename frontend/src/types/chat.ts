export interface Message {
  id?: string;
  chat_id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  created_at?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  selectedModel: string;
}

export interface SendMessageRequest {
  content: string;
  model: string;
}

export interface CreateChatRequest {
  title: string;
}
