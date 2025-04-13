import React from 'react';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import CharacterChatInterface from '@/components/Forge/CharacterChat/CharacterChatInterface';
import { CharacterData, formatCharacterName } from '@/lib/characterUtils';
import { generateDefaultConversationTopics } from '@/lib/characterUtils';
import { loadContentMetadata, createMetadata } from '@/lib/metadataUtils';

// Generate metadata for the page with Open Graph properties
export async function generateMetadata(): Promise<Metadata> {
  // Load the character chat markdown content
  const contentPath = path.join(process.cwd(), 'src/content/forge/character-chat.md');
  const contentMetadata = await loadContentMetadata(contentPath);
  
  // Use the content metadata to generate proper Open Graph metadata
  return createMetadata(contentMetadata, '/forge');
}

// Server-side function to load characters
async function loadCharacters(): Promise<CharacterData[]> {
  try {
    const charactersDirectory = path.join(process.cwd(), 'public/characters');
    
    // Check if the directory exists
    if (!fs.existsSync(charactersDirectory)) {
      console.error('Characters directory not found:', charactersDirectory);
      return fallbackCharacters;
    }
    
    // Read all JSON files in the directory
    const files = fs.readdirSync(charactersDirectory)
      .filter(file => file.endsWith('.json'));
    
    // Parse each file and build character data
    const characters = files.map(file => {
      try {
        const filePath = path.join(charactersDirectory, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        const characterId = path.basename(file, '.json');
        
        // Format the character name with capitalized first letter
        const name = formatCharacterName(data.name || characterId);
        
        // Extract or generate a short bio
        const shortBio = data.background?.short_bio || 
                         data.shortBio || 
                         `AI character specialized in ${data.professional_profile?.primary_occupation || 'various topics'}.`;
        
        // Special case handling for title extraction
        let title = '';
        if (characterId.toLowerCase() === 'dracula') {
          // For Dracula, use his socioeconomic_status as title
          title = data.demographics?.socioeconomic_status || 'Transylvanian Nobleman';
        } else {
          // For other characters, use the standard title extraction
          title = data.demographics?.occupation || 
                 data.professional_profile?.primary_occupation || 
                 data.title || '';
        }
        
        // Extract or generate system prompt
        const systemPrompt = data.systemPrompt || 
                            `You are ${name}, ${data.demographics?.occupation || data.professional_profile?.primary_occupation || ''}. 
                            ${data.background?.short_bio || shortBio || ''}
                            ${data.cognitive_profile?.cognitive_style ? `Your cognitive style: ${data.cognitive_profile.cognitive_style}` : ''}
                            ${data.speech_patterns?.communication_style ? `Your communication style: ${data.speech_patterns.communication_style}` : ''}
                            Always respond as ${name} would, maintaining character consistency.`;
        
        // Extract or generate conversation topics
        const conversationTopics = data.conversationTopics || 
                                  data.conversation_starters || 
                                  generateDefaultConversationTopics(name, data as any);
        
        // Build the character data object
        return {
          id: characterId,
          name,
          title,
          shortBio,
          systemPrompt,
          conversationTopics,
          background: data.background,
          cognitive_profile: data.cognitive_profile,
          emotional_profile: data.emotional_profile,
          social_profile: data.social_profile,
          philosophical_stance: data.philosophical_stance,
          speech_patterns: data.speech_patterns
        };
      } catch (error) {
        console.error(`Error loading character file ${file}:`, error);
        return null;
      }
    }).filter(Boolean) as CharacterData[];
    
    return characters.length > 0 ? characters : fallbackCharacters;
  } catch (error) {
    console.error('Error loading characters:', error);
    return fallbackCharacters;
  }
}

// Fallback characters in case API fails
const fallbackCharacters: CharacterData[] = [
  {
    id: 'sample-character-1',
    name: 'Professor Albert',
    title: 'AI Research Expert',
    shortBio: 'Professor of AI and Machine Learning with expertise in neural networks.',
    systemPrompt: 'You are Professor Albert, an expert in AI research. You speak in a formal, academic tone and enjoy discussing complex topics in simple terms.',
    conversationTopics: [
      'Tell me about the latest developments in AI research',
      'How do neural networks function?',
      'What are the ethical implications of advanced AI?',
      'How might AI transform business operations?',
      'What safeguards should we implement for AI systems?'
    ]
  },
  {
    id: 'sample-character-2',
    name: 'Luna',
    title: 'Creative Writer',
    shortBio: 'A creative fiction writer who specializes in fantasy worlds.',
    systemPrompt: 'You are Luna, a creative fiction writer. You respond with vivid descriptions and love to explore imaginative ideas.',
    conversationTopics: [
      'Help me create a fantasy character',
      'What makes a compelling story?',
      'Tell me about worldbuilding techniques',
      'How do you overcome creative blocks?',
      'What storytelling methods work best for business contexts?'
    ]
  }
];

export default async function CharacterChatPage() {
  // Load characters on the server side
  const characters = await loadCharacters();
  
  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden bg-white dark:bg-gray-900">
      <CharacterChatInterface 
        initialCharacters={characters} 
        title="Interactive Character Chat"
        subtitle="Converse with AI characters powered by our Genesis Engine"
      />
    </div>
  );
}
