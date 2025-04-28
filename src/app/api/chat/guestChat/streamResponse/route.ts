// Stream an OpenAI response given the context
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  const { messages } = await request.json()
  
  // Get OpenAI stream response
  let stream
  try {
    stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    })
  } catch (err: any) {
    console.error('[OpenAI API]', err)
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    )
  }
  
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
  })

  // Return stream response
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
