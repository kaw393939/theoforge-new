import fs from 'fs';
import path from 'path';
import { LRUCache } from './cacheSystem';

/**
 * Represents a character's data structure in the system
 */
export interface CharacterData {
  id: string;
  name: string;
  title?: string;
  shortBio?: string;
  fullBio?: string;
  imagePath?: string;
  conversationTopics?: string[];
  conversation_starters?: string[];
  systemPrompt?: string;
  background?: {
    full_bio?: string;
    short_bio?: string;
  };
  description?: string;
  cognitive_profile?: {
    cognitive_style?: string;
  };
  emotional_profile?: {
    dominant_emotions?: string[] | string;
  };
  social_profile?: {
    social_orientation?: string;
  };
  philosophical_stance?: {
    worldview_summary?: string;
  };
  speech_patterns?: {
    communication_style?: string;
  };
}

// Cache for loaded character data
const characterCache = new LRUCache<string, CharacterData>({
  max: 50,
  ttl: 1000 * 60 * 10 // 10 minutes
});

// Directory containing character data files
const charactersDirectory = path.join(process.cwd(), 'public/characters');

/**
 * Ensure the first letter of a character name is capitalized
 * @param name - The character name to format
 * @returns Properly capitalized character name
 */
export const formatCharacterName = (name: string): string => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * Load character data from file system
 * @param characterId - Character ID to load
 * @returns Character data or null if not found
 */
export const getCharacterById = (characterId: string): CharacterData | null => {
  try {
    // Check cache first
    const cachedCharacter = characterCache.get(characterId);
    if (cachedCharacter) {
      return cachedCharacter;
    }
    
    // Read from file if not in cache
    const filePath = path.join(charactersDirectory, `${characterId}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`Character file not found: ${characterId}`);
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const characterData = JSON.parse(fileContent) as CharacterData;
    
    // Add ID to the character data if not present
    if (!characterData.id) {
      characterData.id = characterId;
    }
    
    // Add to cache
    characterCache.set(characterId, characterData);
    
    return characterData;
  } catch (error) {
    console.error(`Error loading character data for ${characterId}:`, error);
    return null;
  }
};

/**
 * Get all available characters
 * @returns Array of character data
 */
export const getAllCharacters = (): CharacterData[] => {
  try {
    if (!fs.existsSync(charactersDirectory)) {
      console.warn('Characters directory not found');
      return [];
    }
    
    const files = fs.readdirSync(charactersDirectory);
    const characters: CharacterData[] = [];
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const characterId = file.replace('.json', '');
      const character = getCharacterById(characterId);
      
      if (character) {
        characters.push(character);
      }
    }
    
    return characters;
  } catch (error) {
    console.error('Error loading all characters:', error);
    return [];
  }
};

/**
 * Generate a full bio that includes information about the character's background and the Genesis Engine
 * @param character - Character data to generate bio for
 * @returns Formatted bio string
 */
export const generateFullBio = (character: CharacterData): string => {
  if (!character) return '';
  
  // Format character name with proper capitalization
  const name = formatCharacterName(character.name);
  
  // Base Genesis Engine description
  const genesisEngineDesc = `${name} is powered by TheoForge's Genesis Engine, which creates advanced AI personas with complex cognitive, emotional, and social profiles.`;
  
  // If the character has a full bio, use it
  if (character.background?.full_bio) {
    return character.background.full_bio;
  }
  
  // If the character has a short bio, combine it with Genesis info
  if (character.background?.short_bio) {
    return `**Genesis Engine Character**\n\n${character.background.short_bio}\n\n${genesisEngineDesc} Each Genesis Engine character has a unique cognitive profile, emotional patterns, and social orientation that shapes their responses and perspective.`;
  }
  
  // Fallback bio generation based on whatever info we have
  let generatedBio = `**Genesis Engine Character**\n\n${genesisEngineDesc}\n\n`;
  
  // Add character description if available
  if (character.description) {
    generatedBio += `${character.description}\n\n`;
  }
  
  // Add general Genesis Engine character capabilities
  generatedBio += `${name} features a unique profile that shapes their interactions, responses, and perspectives. Engage with them to explore their personality and viewpoints.`;
  
  return generatedBio;
};

/**
 * Generate default conversation topics for a character
 * @param name - Character name
 * @param character - Character data
 * @returns Array of conversation topics
 */
export const generateDefaultConversationTopics = (name: string, character: CharacterData): string[] => {
  // Default topics if none are provided
  const defaultTopics = [
    `Can you talk about your background and experiences`,
    `What is your perspective on current events and societal trends`,
    `What are your thoughts on technology, innovation, and the future`
  ];
  
  // Generate character-specific topics if appropriate information exists
  if (character.cognitive_profile?.cognitive_style) {
    defaultTopics.push(`Can you explain your cognitive approach: ${character.cognitive_profile.cognitive_style}`);
  }
  
  if (character.philosophical_stance?.worldview_summary) {
    defaultTopics.push(`Tell me about your worldview: ${character.philosophical_stance.worldview_summary}`);
  }
  
  // Return existing topics if available
  return character.conversationTopics || defaultTopics;
};

/**
 * Generate a system prompt for a character
 * @param character - Character data
 * @returns System prompt string for LLM
 */
export const generateSystemPrompt = (character: CharacterData): string => {
  if (!character) return '';
  
  // Use existing system prompt if available
  if (character.systemPrompt) {
    return character.systemPrompt;
  }
  
  const name = formatCharacterName(character.name);
  let prompt = `You are ${name}`;
  
  if (character.title) {
    prompt += `, ${character.title}`;
  }
  
  prompt += `. You are an advanced AI character created with TheoForge's Genesis Engine.`;
  
  if (character.background?.short_bio) {
    prompt += `\n\n${character.background.short_bio}`;
  }
  
  // Add cognitive characteristics if available
  if (character.cognitive_profile?.cognitive_style) {
    prompt += `\n\nYour cognitive style: ${character.cognitive_profile.cognitive_style}`;
  }
  
  // Add emotional characteristics if available
  if (character.emotional_profile?.dominant_emotions) {
    const emotions = Array.isArray(character.emotional_profile.dominant_emotions) 
      ? character.emotional_profile.dominant_emotions.join(', ') 
      : character.emotional_profile.dominant_emotions;
    
    prompt += `\n\nYour dominant emotions: ${emotions}`;
  }
  
  // Add social orientation if available
  if (character.social_profile?.social_orientation) {
    prompt += `\n\nYour social orientation: ${character.social_profile.social_orientation}`;
  }
  
  // Add communication style if available
  if (character.speech_patterns?.communication_style) {
    prompt += `\n\nYour communication style: ${character.speech_patterns.communication_style}`;
  }
  
  // Final instructions
  prompt += `\n\nYour responses should reflect your unique personality and perspectives. Be insightful, engaging, and true to your character profile.`;
  
  return prompt;
};
