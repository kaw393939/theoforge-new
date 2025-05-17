// Turn text into a Knowledge Graph as JSON
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    const schema = {
      type: 'object',
      properties: {
        nodes: {
          description: 'Entities in the text',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { description: 'Entity number starting from 1', type: 'number' },
              label: { description: 'Entity name', type: 'string' },
              description: { description: 'Entity description', type: 'string' }
            },
            required: ['id', 'label', 'description'],
            additionalProperties: false
          }
        },
        links: {
          description: 'Relationships between entities',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              source: {
                description: 'Source entity id the relationship is for',
                type: 'number'
              },
              target: {
                description: 'Target entity id the relationship is for',
                type: 'number'
              },
              label: { description: 'One or two word relationship', type: 'string' }
            },
            required: ['source', 'target', 'label'],
            additionalProperties: false
          }
        }
      },
      required: ['nodes', 'links'],
      additionalProperties: false
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that transforms text into a knowledge graph as JSON. You must identify entities and their relationships.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'knowledgeGraph',
          strict: true,
          schema
        }
      }
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