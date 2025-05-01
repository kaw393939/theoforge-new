// Stream an OpenAI response given the context
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}


interface GuestInfo {
  id: string | null;
  name?: string;
  company?: string;
  industry?: string;
  project_type?: string[];
  budget?: string;
  timeline?: string;
  contact_info?: string;
  pain_points?: string[];
  current_tech?: string[];
  additional_notes?: string;
  status?: 'NEW' | 'CONTACTED' | 'CONVERTED';
  // Additional info not in database
  sessionCount: number;
  questionsAsked: string[];
}

export async function POST(request: Request) {
  try {
    const { guestInfo, messages, context }: { guestInfo: GuestInfo, messages: Message[], context: string} = await request.json()
    
    // AI setup
    const SYSTEM_PROMPT = "You are TheoForge's AI assistant a company that specializes in Engineering Empowerment, Technology Strategy & Leadership, Workforce Training, Knowledge Graphs, and custom AI platforms. Be friendly, accurate, and focus on helping users find the right information or solution.";
    
    // Add system prompt and context to the first system message
    messages[0].content = `${SYSTEM_PROMPT}
    The following guset info has been collected.
    guest info: """${guestInfo}""".
    Use if following context if it is provided and useful.
    context: """${context}""".
    `;
    messages[0].role = 'system';
    
    // Get OpenAI stream response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    });
    
    const body = new ReadableStream({
      async start(controller) {
        try {
          // Send each chunk of the stream
          for await (const chunk of stream) {
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
            )
          }
          // Stream completion
          controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`))
        } catch (err: any) {
          controller.enqueue(
            new TextEncoder().encode(
              `event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`
            )
          )
        } finally {
          controller.close()
        }
      },
    });

    // Return stream response
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('[OpenAI API]', err);
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    )
  }
}
