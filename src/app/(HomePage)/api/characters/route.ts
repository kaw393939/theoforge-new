import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { startMeasurement, endMeasurement } from '@/lib/performanceMonitoring';
import { CharacterData } from '@/lib/characterUtils.client';
import { LRUCache } from '@/lib/cacheSystem';

// Cache for loaded character data
const characterCache = new LRUCache<string, CharacterData>({
  max: 50,
  ttl: 1000 * 60 * 10 // 10 minutes
});

// Directory containing character data files
const charactersDirectory = path.join(process.cwd(), 'public/characters');

/**
 * Format character name by capitalizing first letter
 */
function formatCharacterName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Generate a short bio for a character based on available data
 */
function generateCharacterBio(character: CharacterData): string {
  if (character.background?.full_bio) {
    return character.background.full_bio;
  }
  
  if (character.background?.short_bio) {
    return character.background.short_bio;
  }
  
  if (character.shortBio) {
    return character.shortBio;
  }
  
  return `${formatCharacterName(character.name)} is an AI character created with TheoForge's Genesis Engine.`;
}

/**
 * Generate default conversation topics if none are provided
 */
function generateDefaultConversationTopics(characterName: string, character: CharacterData): string[] {
  const name = formatCharacterName(characterName);
  
  // Default topics based on character role
  if (character.title?.toLowerCase().includes('professor') || 
      character.title?.toLowerCase().includes('teacher')) {
    return [
      `Ask ${name} about their area of expertise`,
      `Discuss recent developments in ${name}'s field`,
      `Get ${name}'s opinion on educational methods`
    ];
  }
  
  if (character.title?.toLowerCase().includes('writer') || 
      character.title?.toLowerCase().includes('author')) {
    return [
      `Talk to ${name} about their creative process`,
      `Discuss literary influences and inspiration`,
      `Get writing advice from ${name}`
    ];
  }
  
  // Generic fallback topics
  return [
    `Learn more about ${name}'s background`,
    `Discuss ${name}'s interests and experiences`,
    `Ask ${name} for their perspective on current events`
  ];
}

/**
 * Get all characters from the directory
 */
function getAllCharactersFromDisk(): CharacterData[] {
  try {
    // Get all JSON files in the characters directory
    const files = fs.readdirSync(charactersDirectory)
      .filter(file => file.endsWith('.json'));
    
    // Parse each file and create character objects
    const characters: CharacterData[] = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(charactersDirectory, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const characterData = JSON.parse(fileContent);
        
        // Extract character ID from filename
        const id = path.basename(file, '.json');
        
        // Create character object
        const character: CharacterData = {
          id,
          name: characterData.name || formatCharacterName(id),
          title: characterData.title || '',
          shortBio: characterData.shortBio || characterData.background?.short_bio || '',
          imagePath: `/characters/${id}.png`,
          ...characterData
        };
        
        characters.push(character);
      } catch (error) {
        console.error(`Error parsing character file ${file}:`, error);
      }
    }
    
    return characters;
  } catch (error) {
    console.error('Error reading characters directory:', error);
    return [];
  }
}

/**
 * GET handler for /api/characters
 * Returns a list of all available characters with their basic information
 */
export async function GET() {
  const perfMark = startMeasurement('get_all_characters_api');
  
  try {
    // Get all characters from the disk
    const charactersRaw = getAllCharactersFromDisk();
    
    // Process characters to include all necessary client-side fields
    const characters = charactersRaw.map(char => ({
      id: char.id,
      name: char.name, 
      title: char.title || '',
      shortBio: char.shortBio || char.background?.short_bio || 
        `${char.name} is an advanced AI character created with our Genesis Engine technology.`,
      fullBio: generateCharacterBio(char),
      imagePath: `/characters/${char.id}.png`,
      conversationTopics: char.conversationTopics || char.conversation_starters || 
        generateDefaultConversationTopics(char.name, char),
      systemPrompt: char.systemPrompt || '',
      background: char.background,
      cognitive_profile: char.cognitive_profile,
      emotional_profile: char.emotional_profile,
      social_profile: char.social_profile,
      philosophical_stance: char.philosophical_stance,
      speech_patterns: char.speech_patterns
    }));
    
    endMeasurement(perfMark, { 
      metadata: { 
        success: true, 
        count: characters.length 
      } 
    });
    
    return NextResponse.json(characters);
  } catch (error) {
    console.error('Error in characters API route:', error);
    
    endMeasurement(perfMark, { 
      metadata: { 
        errorMessage: error instanceof Error ? error.message : String(error), 
        success: false 
      } 
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch characters',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
