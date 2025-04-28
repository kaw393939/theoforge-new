// Call a specific function based on prompt in messages and a list of callable functions in tools
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const { messages, tools } = await request.json()
    // Must be a model that uses tools instead of functions arguments
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      tools: tools,
      tool_choice: "auto"
    })

    return NextResponse.json(completion)
  } catch (err: any) {
    console.error('[OpenAI API]', err)
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    )
  }
}