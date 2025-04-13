import { NextResponse } from 'next/server';
import { startMeasurement, endMeasurement } from '@/lib/performanceMonitoring';

// Define proper interfaces for request and response
interface ChatRequest {
  message: string;
  characterId: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface ChatResponse {
  message?: string;
  error?: string;
}

/**
 * This API route serves as a proxy between the frontend and the character chat server.
 * It forwards requests from the frontend to the character chat server running on port 3000,
 * and streams responses back to the client.
 */
export async function POST(request: Request) {
  const perfMark = startMeasurement('chat_proxy_api');
  
  try {
    // Get the API server URL from environment variables or use the default
    const chatServerUrl = process.env.CHARACTER_API_URL || 'http://localhost:3000';
    const targetUrl = `${chatServerUrl}/chat`;
    
    // Get and validate the request body
    const requestData = await request.json() as Partial<ChatRequest>;
    
    if (!requestData.message || !requestData.characterId) {
      endMeasurement(perfMark, { 
        metadata: { 
          validationError: true,
          success: false
        } 
      });
      
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          message: 'The message and characterId fields are required.'
        },
        { status: 400 }
      );
    }
    
    // Implement retry logic for external API calls
    const MAX_RETRIES = 3;
    let attempts = 0;
    let serverResponse: Response | null = null;
    
    while (attempts < MAX_RETRIES) {
      try {
        serverResponse = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
          // Add a timeout to prevent hanging requests
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        break; // Success, exit the loop
      } catch (fetchError) {
        attempts++;
        if (attempts >= MAX_RETRIES) throw fetchError;
        
        // Exponential backoff
        const backoffTime = 500 * Math.pow(2, attempts);
        await new Promise(r => setTimeout(r, backoffTime));
      }
    }
    
    if (!serverResponse || !serverResponse.ok) {
      const status = serverResponse?.status || 502;
      const statusText = serverResponse?.statusText || 'Bad Gateway';
      
      endMeasurement(perfMark, { 
        metadata: { 
          errorMessage: `Server responded with ${status} ${statusText}`,
          success: false
        } 
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to get response from chat server',
          message: `I apologize, but I'm having trouble connecting to my language processing system. Please try again in a moment.`
        },
        { status: 502 }
      );
    }
    
    // Read the response from the chat server
    const data = await serverResponse.json() as ChatResponse;
    
    // End performance measurement
    endMeasurement(perfMark, { 
      metadata: { 
        success: true,
        characterId: requestData.characterId
      } 
    });
    
    // Return the response to the client
    return NextResponse.json(data);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    endMeasurement(perfMark, { 
      metadata: { 
        errorMessage,
        success: false
      } 
    });
    
    return NextResponse.json(
      { 
        error: 'Server Error', 
        message: `An error occurred while processing your request: ${errorMessage}`
      },
      { status: 500 }
    );
  }
}
