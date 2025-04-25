import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { formatCharacterName } from '@/lib/characterUtils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

// Character data interface
interface CharacterData {
  id: string;
  name: string;
  title?: string;
  shortBio?: string;
  systemPrompt: string;
}

// Message interface
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Load character data based on ID
async function loadCharacterData(characterId: string): Promise<CharacterData | null> {
  try {
    const charactersDir = path.join(process.cwd(), 'public/characters');
    const filePath = path.join(charactersDir, `${characterId}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Character file not found: ${filePath}`);
      return null;
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Format the character name with capitalized first letter
    const name = formatCharacterName(data.name || characterId);
    
    // Extract or generate a short bio
    const shortBio = data.background?.short_bio || 
                     data.shortBio || 
                     `AI character specialized in ${data.professional_profile?.primary_occupation || 'various topics'}.`;
    
    // Construct a more comprehensive system prompt
    const systemPrompt = data.systemPrompt || 
                        `You are ${name}, ${data.demographics?.occupation || data.professional_profile?.primary_occupation || ''}. 
                        ${data.background?.short_bio || shortBio || ''}
                        ${data.cognitive_profile?.cognitive_style ? `Your cognitive style: ${data.cognitive_profile.cognitive_style}` : ''}
                        ${data.speech_patterns?.communication_style ? `Your communication style: ${data.speech_patterns.communication_style}` : ''}
                        Always respond as ${name} would, maintaining character consistency.
                        You are engaging with a Fortune 100 executive. Keep responses insightful, nuanced, and concise.`;
    
    return {
      id: characterId,
      name,
      title: data.demographics?.occupation || 
             data.professional_profile?.primary_occupation || 
             data.title || '',
      shortBio,
      systemPrompt
    };
  } catch (error) {
    console.error('Error loading character data:', error);
    return null;
  }
}

// Update character metrics
async function updateCharacterMetrics(characterId: string) {
  try {
    const metricsDir = path.join(process.cwd(), 'data/metrics');
    
    // Ensure metrics directory exists
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }
    
    const metricsPath = path.join(metricsDir, `${characterId}.json`);
    let metrics = { usageCount: 0, lastUsed: '' };
    
    // Load existing metrics if available
    if (fs.existsSync(metricsPath)) {
      try {
        const existingMetrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
        metrics = { ...metrics, ...existingMetrics };
      } catch (e) {
        console.error('Error parsing existing metrics:', e);
      }
    }
    
    // Update metrics
    metrics.usageCount += 1;
    metrics.lastUsed = new Date().toISOString();
    
    // Save updated metrics
    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('Error updating character metrics:', error);
    return { success: false };
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { characterId, message, conversationHistory = [], stream = true } = await req.json();
    
    if (!characterId || !message) {
      return NextResponse.json(
        { error: 'Character ID and message are required' },
        { status: 400 }
      );
    }
    
    // Load character data
    const character = await loadCharacterData(characterId);
    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }
    
    // Update usage metrics (non-blocking)
    updateCharacterMetrics(characterId).catch(error => 
      console.error('Failed to update character metrics:', error)
    );
    
    // Prepare messages for the LLM
    const messages: Message[] = [
      { role: 'system', content: character.systemPrompt }
    ];
    
    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }
    
    // Add the current message
    messages.push({ role: 'user', content: message });
    
    // Create the completion with streaming
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Set up streaming response
    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              // Send chunk with proper SSE format
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          
          // Signal end of stream
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error: any) {
          // Handle streaming errors
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: error.message || 'Unknown error' })}\n\n`)
          );
          controller.close();
        }
      }
    });
    
    // Return the streaming response
    return new Response(streamResponse, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error: any) {
    console.error('Character chat error:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
