import { NextRequest, NextResponse } from 'next/server';
import { getCharacterById, CharacterData } from '@/lib/characterUtils';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { startMeasurement, endMeasurement } from '@/lib/performanceMonitoring';
import { withFallback } from '@/lib/apiUtils';

// Define proper types
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Fallback function for when the OpenAI API is unavailable
 * Simulates a character response with realistic typing delays
 */
async function* simulateResponseForFallback(messages: ChatMessage[], character: CharacterData) {
  const userMessage = messages[messages.length - 1].content;
  
  // Prepare a response based on character's personality
  let response = `As ${character.name}, I would respond to "${userMessage}" in a manner consistent with my personality.`;

  // Sample responses based on basic character personality
  if (character.id === 'caesar') {
    response = `Indeed, your words interest me. As a leader of Rome, I have faced many such situations. The conquest of Gaul taught me that ${userMessage.toLowerCase().includes('war') ? 'in war, boldness often brings victory.' : 'decisive action is the path to greatness.'}

Let us discuss this further, as strategy and diplomacy are subjects I have mastered through years of campaign.`;
  } else if (character.id === 'brandon') {
    response = `Thanks for reaching out! I've been thinking about ${userMessage.toLowerCase().includes('technology') ? 'technology innovations' : 'similar topics'} recently.

In my experience working with startups, I've found that ${userMessage.toLowerCase().includes('business') ? 'business challenges often require creative solutions.' : 'open communication leads to the best outcomes.'} What do you think?`;
  }

  // Simulate streaming by sending one character at a time with realistic typing
  for (let i = 0; i < response.length; i++) {
    const chunk = response[i];
    
    // Add random slight delays to simulate typing
    const delay = Math.floor(Math.random() * 30) + 10; // 10-40ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    yield chunk;
  }
}

/**
 * Function that uses LangChain to generate streaming AI responses
 * Handles fallback to simulation if API is unavailable
 */
async function* generateAIStreamingResponse(messages: ChatMessage[], character: CharacterData) {
  // Start measuring LLM response time
  const llmPerformanceMark = startMeasurement('llm_response_generation', {
    characterId: character.id,
    messageLength: messages[messages.length - 1].content.length
  });
  
  try {
    const userMessage = messages[messages.length - 1].content;
    const chatHistory = messages
      .slice(0, -1)
      .map(msg => `${msg.role === 'user' ? 'Human' : character.name}: ${msg.content}`)
      .join('\n');
    
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('exceeded') || apiKey.startsWith('sk-') === false) {
      console.warn('Valid OpenAI API key not available, using fallback response generator');
      endMeasurement(llmPerformanceMark, { 
        reportToAnalytics: true,
        metadata: { 
          fallback: true,
          reason: 'invalid_api_key'
        }
      });
      yield* simulateResponseForFallback(messages, character);
      return;
    }
    
    // Configure the LLM with streaming enabled
    const model = new ChatOpenAI({
      modelName: process.env.LLM_MODEL || "gpt-3.5-turbo",
      temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
      streaming: true,
      openAIApiKey: apiKey,
      timeout: 15000, // 15 second timeout
    });
    
    // Create a prompt template for the character
    const systemTemplate = `You are ${character.name}${character.title ? ', ' + character.title : ''}. 
${character.shortBio || ''}

Your cognitive style: ${character.cognitive_profile?.cognitive_style || 'Not specified'}
Your dominant emotions: ${Array.isArray(character.emotional_profile?.dominant_emotions) 
  ? character.emotional_profile.dominant_emotions.join(', ') 
  : character.emotional_profile?.dominant_emotions || 'Not specified'}
Your social orientation: ${character.social_profile?.social_orientation || 'Not specified'}

Always stay in character and respond as ${character.name} would. Use first-person perspective.

Previous conversation:
${chatHistory}`;
    
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(systemTemplate),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);
    
    // Set up the chain
    const chain = chatPrompt.pipe(model).pipe(new StringOutputParser());
    
    // Generate streaming response
    const stream = await chain.stream({
      input: userMessage
    });
    
    // Process and yield each chunk
    for await (const chunk of stream) {
      yield chunk;
    }
    
    // End performance measurement with success
    endMeasurement(llmPerformanceMark, { 
      reportToAnalytics: true,
      metadata: { success: true }
    });
  } catch (error: any) {
    // Log error and record performance metrics
    console.error('Error generating AI response:', error);
    console.log('Falling back to simulated response');
    
    endMeasurement(llmPerformanceMark, { 
      reportToAnalytics: true,
      metadata: { 
        error: error.message || String(error),
        fallback: true,
        reason: 'api_error'
      }
    });
    
    // Fall back to simulated response
    yield* simulateResponseForFallback(messages, character);
  }
}

/**
 * Validate request parameters
 */
function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }
  
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return { valid: false, error: 'Messages array is required and cannot be empty' };
  }
  
  if (!body.characterId || typeof body.characterId !== 'string') {
    return { valid: false, error: 'Character ID is required and must be a string' };
  }
  
  return { valid: true };
}

/**
 * Main handler for chat API requests
 */
export async function POST(request: NextRequest) {
  // Start measuring overall API performance
  const apiPerformanceMark = startMeasurement('chat_api', {
    url: request.url
  });
  
  try {
    // Create a unique request ID for tracking
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const requestPerfMark = startMeasurement('chat_request', {
      requestId
    });
    
    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequest(body);
    
    if (!validation.valid) {
      endMeasurement(requestPerfMark, { 
        reportToAnalytics: true,
        metadata: { validationError: true }
      });
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { messages, characterId } = body;
    
    // Load character data
    const characterPerfMark = startMeasurement('character_load', {
      characterId
    });
    
    const character = getCharacterById(characterId);
    
    if (!character) {
      endMeasurement(characterPerfMark, { 
        reportToAnalytics: true,
        metadata: { errorMessage: 'Character not found' }
      });
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    endMeasurement(characterPerfMark, { reportToAnalytics: true });
    
    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const streamingResponse = generateAIStreamingResponse(messages, character);
          
          for await (const chunk of streamingResponse) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          
          controller.close();
          endMeasurement(requestPerfMark, { 
            reportToAnalytics: true, 
            metadata: { success: true, streaming: true }
          });
        } catch (error: any) {
          console.error('Error generating streaming response:', error);
          controller.error(error);
          endMeasurement(requestPerfMark, { 
            reportToAnalytics: true, 
            metadata: { 
              errorMessage: error.message || String(error), 
              streaming: true 
            }
          });
        }
      }
    });

    // Return the streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
    });
  } catch (error: any) {
    // Log the error and finish performance measurement
    console.error('Error processing chat request:', error);
    endMeasurement(apiPerformanceMark, { 
      metadata: { 
        errorMessage: error.message || String(error),
        success: false 
      }
    });
    
    // Return a friendly error message
    return NextResponse.json(
      { 
        error: 'An error occurred while processing your request. Please try again.',
        _debug: process.env.NODE_ENV === 'development' ? error.message || String(error) : undefined
      },
      { status: 500 }
    );
  }
}
