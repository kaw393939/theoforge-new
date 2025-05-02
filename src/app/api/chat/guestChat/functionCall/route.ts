// Call a specific function based on prompt in messages and a list of callable functions in tools
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const { message, guestInfo } = await request.json();
    // Setup functions for the AI to call
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "contactTheoforge",
          description: "Trigger this function if the user is asking to contact Theoforge company.",
          parameters: { type: "object", properties: {} },
        }
      },
      {
        type: "function" as const,
        function: {
          name: "getTheoforgeInfo",
          description: "Retrieves relevant data if the user wants information about the Theoforge company.",
          parameters: {
            type: "object",
            properties: {
              contextType: {
                type: "string",
                description: "The type of context to retrieve. Must be one of the predefined values.",
                enum: [
                  "services",
                  "forge",
                  "engineeringEmpowerment",
                  "technologyStrategy",
                  "workforceTraining",
                  "genesisEngine",
                  "characterChat",
                  "aiOrchestrationPlatform",
                  "modelContextProtocol",
                  "knowledgeGraph",
                  "theoforge"
                ]
              }
            },
            required: ["contextType"]
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "collectGuestInfo",
          description: "Collects and updates structured information about a guest during a chat conversation.",
          parameters: {
            type: "object",
            properties: {
              name: { type: ["string", "null"], description: "Guest's full name" },
              company: { type: ["string", "null"], description: "Company associated with the guest" },
              industry: { type: ["string", "null"], description: "Industry of the guest" },
              project_type: {
                type: "array",
                items: { type: "string" },
                description: "Type of project guest is interested in or working on"
              },
              budget: { type: ["string", "null"], description: "Estimated budget for the project" },
              timeline: { type: ["string", "null"], description: "Project timeline" },
              contact_info: { type: ["string", "null"], description: "Guest's contact information" },
              pain_points: {
                type: "array",
                items: { type: "string" },
                description: "Challenges or problems the guest is facing"
              },
              current_tech: {
                type: "array",
                items: { type: "string" },
                description: "Guest's current technology stack"
              },
              additional_notes: { type: ["string", "null"], description: "Any short and important additional notes" }
            },
            required: [
              "name", "company", "industry", "project_type",
              "budget", "timeline", "contact_info",
              "pain_points", "current_tech", "additional_notes"
            ],
            additionalProperties: false
          }
        }
      }
    ];
    // Setup message context and prompt
    const systemPrompt = `
    You are a helpful AI that assists in chatting with website guests.

    Current collected guest information (if any):
    ${guestInfo}

    Based on the guest's latest message, you MUST either:

    1. Call the "contactTheoforge" tool if the guest requests to contact Theoforge.
    2. Call the "getTheoforgeInfo" tool if the guests requests information about Theoforge.
    3. Otherwise, call the "collectGuestInfo" tool to update the collected guest information.

    Important rules:
    - ONLY update guest information if the user clearly provides their own details.
    - DO NOT mistake references to external companies, products, technologies, or people as the guest’s personal or company information.
    - If information is ambiguous or not clearly about the guest, DO NOT update any fields.
    - The guest's additional info must be under 100 characters.
    - You MUST call exactly one tool based on the guest's latest message.
    - Do not generate plain text responses to the guest directly.
    - Only call the "contactTheoforge" tool if the guest explicitly expresses a desire to contact Theoforge or Keith Williams, the host of the site. Mentions of wanting to talk to other people, companies, or general contacts should NOT trigger this tool.
    - Only call the "getTheoforgeInfo" tool if the guest asks a question about the website, Theoforge
    - If the intended recipient is unclear, DO NOT call the "contactTheoforge" tool.
    `;
    // OpenAI function calling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
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