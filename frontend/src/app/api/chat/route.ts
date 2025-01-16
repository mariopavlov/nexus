import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('API: Received request');
    const { messages } = await req.json();
    console.log('API: Parsed messages:', JSON.stringify(messages, null, 2));
    
    console.log('API: Sending request to Ollama...');
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'phi4:14b',
        messages,
        stream: false,
      }),
    });

    console.log('API: Ollama response status:', response.status);
    const data = await response.json();
    console.log('API: Ollama response data:', JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process the request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
