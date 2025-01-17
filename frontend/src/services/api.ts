// Debug the environment variables
console.log('Environment variables:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV
});

// Temporarily hardcode the API URL for debugging
const API_BASE_URL = 'http://localhost:8080';
console.log('Using hardcoded API URL:', API_BASE_URL);

// Common fetch options
const commonFetchOptions = {
  mode: 'cors' as RequestMode,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    const errorDetails = {
      status: response.status,
      statusText: response.statusText,
      error: error || 'Unknown error'
    };
    console.error('API Error:', errorDetails);
    throw new APIError(response.status, error || response.statusText);
  }
  const data = await response.json();
  return data;
}

// Helper function to convert byte array to UUID string
function bytesToUUID(bytes: number[]): string {
  if (!bytes || bytes.length !== 16) {
    throw new Error('Invalid byte array for UUID');
  }
  
  const byteToHex: string[] = [];
  for (let i = 0; i < 16; i++) {
    byteToHex.push((bytes[i] + 0x100).toString(16).slice(1));
  }

  return [
    byteToHex.slice(0, 4).join(''),
    byteToHex.slice(4, 6).join(''),
    byteToHex.slice(6, 8).join(''),
    byteToHex.slice(8, 10).join(''),
    byteToHex.slice(10, 16).join('')
  ].join('-');
}

// Helper function to get chat ID in the correct format
function getChatIdString(chatId: string | number[]): string {
  if (Array.isArray(chatId)) {
    return bytesToUUID(chatId);
  }
  return chatId;
}

export async function createChat(title: string) {
  try {
    console.log('Creating chat with URL:', `${API_BASE_URL}/chats`);
    const response = await fetch(`${API_BASE_URL}/chats`, {
      ...commonFetchOptions,
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    const chat = await handleResponse<any>(response);
    return {
      ...chat,
      id: Array.isArray(chat.id) ? bytesToUUID(chat.id) : chat.id,
      messages: []
    };
  } catch (error) {
    console.error('Failed to create chat:', error);
    throw error;
  }
}

export async function getChat(chatId: string | number[]) {
  try {
    const chatIdStr = getChatIdString(chatId);
    console.log('Getting chat with URL:', `${API_BASE_URL}/chats/${chatIdStr}`);
    const response = await fetch(`${API_BASE_URL}/chats/${chatIdStr}`, commonFetchOptions);
    const chat = await handleResponse<any>(response);
    
    return {
      ...chat,
      id: Array.isArray(chat.id) ? bytesToUUID(chat.id) : chat.id,
      messages: (chat.messages || []).map((msg: any) => ({
        ...msg,
        id: Array.isArray(msg.id) ? bytesToUUID(msg.id) : msg.id,
        chat_id: Array.isArray(msg.chat_id) ? bytesToUUID(msg.chat_id) : msg.chat_id,
      }))
    };
  } catch (error) {
    console.error('Failed to get chat:', error);
    throw error;
  }
}

export async function listChats(limit = 10, offset = 0) {
  try {
    console.log('Listing chats with URL:', `${API_BASE_URL}/chats?limit=${limit}&offset=${offset}`);
    console.log('Request options:', commonFetchOptions);
    
    const response = await fetch(
      `${API_BASE_URL}/chats?limit=${limit}&offset=${offset}`,
      commonFetchOptions
    );

    const chats = await handleResponse<any[]>(response);
    return chats.map(chat => ({
      ...chat,
      id: Array.isArray(chat.id) ? bytesToUUID(chat.id) : chat.id,
      messages: (chat.messages || []).map((msg: any) => ({
        ...msg,
        id: Array.isArray(msg.id) ? bytesToUUID(msg.id) : msg.id,
        chat_id: Array.isArray(msg.chat_id) ? bytesToUUID(msg.chat_id) : msg.chat_id,
      }))
    }));
  } catch (error) {
    console.error('Failed to list chats:', error);
    throw error;
  }
}

export async function deleteChat(chatId: string | number[]) {
  try {
    const chatIdStr = getChatIdString(chatId);
    console.log('Deleting chat with URL:', `${API_BASE_URL}/chats/${chatIdStr}`);
    const response = await fetch(`${API_BASE_URL}/chats/${chatIdStr}`, {
      ...commonFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to delete chat:', error);
    throw error;
  }
}

export async function sendMessage(chatId: string | number[], content: string, model: string) {
  try {
    const chatIdStr = getChatIdString(chatId);
    console.log('Sending message with URL:', `${API_BASE_URL}/chats/${chatIdStr}/messages`);
    const response = await fetch(`${API_BASE_URL}/chats/${chatIdStr}/messages`, {
      ...commonFetchOptions,
      method: 'POST',
      body: JSON.stringify({ content, model }),
    });
    const message = await handleResponse<any>(response);
    return {
      ...message,
      id: Array.isArray(message.id) ? bytesToUUID(message.id) : message.id,
      chat_id: Array.isArray(message.chat_id) ? bytesToUUID(message.chat_id) : message.chat_id,
    };
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

export async function getChatMessages(chatId: string | number[], limit = 50, offset = 0) {
  try {
    const chatIdStr = getChatIdString(chatId);
    const response = await fetch(
      `${API_BASE_URL}/chats/${chatIdStr}/messages?limit=${limit}&offset=${offset}`,
      commonFetchOptions
    );
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to get chat messages:', error);
    throw error;
  }
}

export async function listModels() {
  try {
    console.log('Listing models with URL:', `${API_BASE_URL}/models`);
    const response = await fetch(`${API_BASE_URL}/models`, commonFetchOptions);
    return handleResponse<string[]>(response);
  } catch (error) {
    console.error('Failed to list models:', error);
    throw error;
  }
}

export async function updateChatTitle(chatId: string | number[], title: string) {
  try {
    const chatIdStr = getChatIdString(chatId);
    console.log('Updating chat title:', { chatId: chatIdStr, title, url: `${API_BASE_URL}/chats/${chatIdStr}` });
    const response = await fetch(`${API_BASE_URL}/chats/${chatIdStr}`, {
      ...commonFetchOptions,
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
    console.log('Update response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to update chat title:', {
      error,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
