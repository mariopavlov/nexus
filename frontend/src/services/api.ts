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
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      error
    });
    throw new APIError(response.status, error);
  }
  return response.json();
}

export async function createChat(title: string) {
  try {
    console.log('Creating chat with URL:', `${API_BASE_URL}/chats`);
    const response = await fetch(`${API_BASE_URL}/chats`, {
      ...commonFetchOptions,
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to create chat:', error);
    throw error;
  }
}

export async function getChat(chatId: string) {
  try {
    console.log('Getting chat with URL:', `${API_BASE_URL}/chats/${chatId}`);
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, commonFetchOptions);
    return handleResponse(response);
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
    return handleResponse(response);
  } catch (error) {
    // Log detailed error information
    console.error('Failed to list chats. Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack,
      toString: error.toString(),
      // If it's a TypeError, log additional properties
      ...(error instanceof TypeError && {
        type: 'TypeError',
        fullDetails: error
      })
    });
    throw error;
  }
}

export async function deleteChat(chatId: string) {
  try {
    console.log('Deleting chat with URL:', `${API_BASE_URL}/chats/${chatId}`);
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      ...commonFetchOptions,
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to delete chat:', error);
    throw error;
  }
}

export async function sendMessage(chatId: string, content: string, model: string) {
  try {
    console.log('Sending message with URL:', `${API_BASE_URL}/chats/${chatId}/messages`);
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      ...commonFetchOptions,
      method: 'POST',
      body: JSON.stringify({ content, model }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

export async function getChatMessages(chatId: string, limit = 50, offset = 0) {
  try {
    console.log('Getting chat messages with URL:', `${API_BASE_URL}/chats/${chatId}/messages?limit=${limit}&offset=${offset}`);
    const response = await fetch(
      `${API_BASE_URL}/chats/${chatId}/messages?limit=${limit}&offset=${offset}`,
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
