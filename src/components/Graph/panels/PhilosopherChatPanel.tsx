/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterData } from '@/lib/characterUtils';
import Image from 'next/image';
import Button from '@/components/Common/Button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ArrowRightIcon, ExclamationCircleIcon, LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Tooltip, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import Paragraph from '@/components/Common/Paragraph';

// Message interface
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
}

type Theme = 'light' | 'dark';

// Philosopher Chat
export default function PhilosopherChatPanel({
  selectedCharacter,
  onClose,
}: {
  selectedCharacter: CharacterData;
  onClose: () => void;
}) {
  // All messages for each philosopher
  const [philosopherMessages, setPhisolopherMessages] = useState<Record<string, Message[]>>({})
  const [selectedPhilosopherMessages, setSelectedPhilosopherMessages] = useState<Message[]>([]);
  const [conversationTopics, setConversationTopics] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userIdenticon, setUserIdenticon] = useState<string>('');
  const [imgSrc, setImgSrc] = useState(`/characters/${selectedCharacter.id}.png`);
  const [theme, setTheme] = useState<Theme>('light');
  const [storageLoaded, setStorageLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load local storage
  useEffect(() => {
    const storedData = localStorage.getItem("philosopherConversation");
    if (storedData) {
      try {
        setPhisolopherMessages(JSON.parse(storedData));
        setStorageLoaded(true);
      } catch {
        console.error("Failed to parse local storage");
      }
    } else {
      localStorage.setItem("philosopherConversation", JSON.stringify({}));
      setStorageLoaded(true);
    }
  }, []);
  
  // Handle character change
  useEffect(() => {
    // Set conversation topics
    setConversationTopics(selectedCharacter.conversationTopics || []);
    // Set philosopher image
    setImgSrc(`/characters/${selectedCharacter.id}.png`);
  }, [selectedCharacter]);
  
  // Set messages to those of the selected philosopher
  useEffect(() => {
    if (storageLoaded && !philosopherMessages[selectedCharacter.name]) {
      setPhisolopherMessages(prev => ({
        ...prev,
        [selectedCharacter.name]: [{
          id: `intro_${Date.now()}`,
          content: `Hello, I'm ${selectedCharacter.name}${selectedCharacter.title ? `, ${selectedCharacter.title}` : ''}. What would you like to discuss today?`,
          role: 'assistant',
          timestamp: new Date().toISOString(),
        }]
      }));
    }
    setSelectedPhilosopherMessages(philosopherMessages[selectedCharacter.name] || []);
    if (storageLoaded) {
      localStorage.setItem("philosopherConversation", JSON.stringify(philosopherMessages));
    }
  }, [philosopherMessages, selectedCharacter, storageLoaded]);
  
  // Scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [selectedPhilosopherMessages]);
  
  // Generate a random profile icon for the user
  useEffect(() => {
    const text = `user_${Date.now()}`
    // Create a hash from the text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Use hash to generate a color
    const hue = Math.abs(hash) % 360;
    const saturation = 60 + (Math.abs(hash) % 30);
    const lightness = 45 + (Math.abs(hash) % 10);
    
    // Create SVG with a unique pattern based on the hash
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <rect width="40" height="40" fill="hsl(${hue}, ${saturation}%, ${lightness}%)" />
        <g fill="rgba(255, 255, 255, 0.5)">
          ${Array.from({length: 5}).map((_, i) => 
            Array.from({length: 5}).map((_, j) => {
              // Use the hash to determine if this cell should be filled
              const shouldFill = ((hash >> (i * 5 + j)) & 1) === 1;
              return shouldFill ? `<rect x="${j*8}" y="${i*8}" width="8" height="8" />` : '';
            }).join('')
          ).join('')}
        </g>
      </svg>
    `;
    setUserIdenticon(`data:image/svg+xml;base64,${btoa(svg)}`);
  }, []);
  
  // Scroll to bottom of messages - only when appropriate
  useEffect(() => {

  }, []);
  
  const handleSendMessage = async (manualInput?: string) => {
    const textToSend = manualInput || input.trim();
    if (!textToSend) return;
    
    // Clear input field
    setInput('');
    
    // Create user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: textToSend,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    
    // Add message to state
    const updatedMessages = [...selectedPhilosopherMessages, userMessage];
    setPhisolopherMessages(prev => ({
      ...prev,
      [selectedCharacter.name]: updatedMessages
    }));
    
    setIsStreaming(true);
    try {
      // Extract previous messages for context (last 10 messages)
      const context: Message[] = (philosopherMessages[selectedCharacter.name] || []).slice(-10);
      
      const apiMessages = context.map(
        m => ({
          role: m.role,
          content: m.content
        })
      );
      
      // Make the fetch request
      const streamResponse = await fetch('/api/characters/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          characterId: selectedCharacter.id,
          message: textToSend,
          conversationHistory: apiMessages,
          stream: true
        })
      })
      if (!streamResponse.ok) throw new Error(await streamResponse.text());

      const reader = streamResponse.body!.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";
      const assistantMessage: Message = {
        id: `assistant_streaming`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      };
      setPhisolopherMessages(prev => ({
        ...prev,
        [selectedCharacter.name]: [...updatedMessages, assistantMessage]
      }));

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        // Process each chunk
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          const content = line.replace(/^data: /, '').trim();
          if (!content || content === '[DONE]') continue;

          try {
            const msg = JSON.parse(content);
            if (msg.error) {
              console.error('Stream error:', msg.error);
              return;
            }
            if (msg.content) {
              aiResponse += msg.content;
              setPhisolopherMessages(prev => {
                const messages = [...prev[selectedCharacter.name]];
                messages[messages.length - 1] = {
                  ...messages[messages.length - 1],
                  content: aiResponse
                };
                return {
                  ...prev,
                  [selectedCharacter.name]: messages
                };
              });
            }
          } catch (error) {
            console.error('Error parsing chunk:', error);
            continue;
          }
        }
      }
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      setErrorMessage("Error generating AI response");
    }
    setIsStreaming(false);
  }
  
  // Allow sending message with Enter key (without Shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Send suggestions message
  const handleQuickReply = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSendMessage(suggestion), 100);
  };
  
  // Handle image loading
  const handleImageLoad = useCallback((characterId: string) => {
    setIsImageLoading(prev => ({
      ...prev,
      [characterId]: false
    }));
  }, []);

  // Set image loading state
  const setImageLoading = useCallback((characterId: string) => {
    setIsImageLoading(prev => ({
      ...prev,
      [characterId]: true
    }));
  }, []);
  
  const renderMessage = (msg: Message) => {
    return (
      <div key={msg.id} className={`flex space-x-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        {msg.role === 'assistant' && (
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <Image
              src={imgSrc}
              alt={selectedCharacter.name}
              width={32}
              height={32}
              className="object-cover"
              onError={() => setImgSrc('/images/default-avatar.svg')}
              priority
            />
          </div>
        )}
        <div 
          className={`max-w-[85%] p-4 rounded-xl shadow-md ${
            msg.role === 'user' 
              ? 'bg-primary text-white ml-2 shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm'
          }`}
        >
          {msg === selectedPhilosopherMessages[selectedPhilosopherMessages.length - 1] && isStreaming 
            ? <p className="whitespace-pre-wrap">{msg.content}<span className="animate-pulse">▌</span></p>
            : <p className="whitespace-pre-wrap">{msg.content}</p>
          }
          <Paragraph 
            variant="body1" 
            className={`mt-1 text-xs ${
              msg.role === 'user' 
                ? 'text-teal-100 dark:text-teal-200' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Paragraph>
        </div>
        {msg.role === 'user' && (
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <Image
              src={userIdenticon}
              alt={"User Icon"}
              width={32}
              height={32}
              className="object-cover"
              onError={() => setImgSrc('/images/default-avatar.svg')}
              priority
            />
          </div>
        )}
      </div>
    )
  }
  
  return (
    <Card className={`${theme === "dark" && "dark"} fixed bottom-4 right-4 w-96 py-0 gap-0 h-[calc(100vh-100px)] rounded-lg`}>
      <CardHeader className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm p-4 rounded-lg rounded-b-none">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3">
              <Image
                src={imgSrc}
                alt={selectedCharacter.name}
                width={40}
                height={40}
                className={`object-cover object-center ${isImageLoading[selectedCharacter.id] ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                onError={() => setImgSrc('/images/default-avatar.svg')}
                onLoad={() => handleImageLoad(selectedCharacter.id)}
                onLoadStart={() => setImageLoading(selectedCharacter.id)}
                priority
              />
              {isImageLoading[selectedCharacter.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <h2 className="text-lg font-semibold font-poppins text-gray-900 dark:text-white">{selectedCharacter.name}</h2>
          </div>
          <div className="flex gap-1 items-center">
            <TooltipProvider>
              <Tooltip>
                <button
                  onClick={() => {
                    setTheme(theme === "light" ? "dark" : "light");
                    dispatchEvent(new CustomEvent("themeChange", {detail: theme === 'light' ? 'dark' as Theme : 'light' as Theme}));
                  }}
                  className="h-8 w-8 rounded-full hover:bg-white/20 transition-all justify-items-center"
                >
                  <LightBulbIcon className="h-5 w-5" color="teal"/>
                </button>
                <TooltipContent>Change Theme</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Add Close Button */}
            <button
              onClick={onClose}
              className="ml-2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition"
              aria-label="Close panel"
              type="button"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </CardHeader>
      {/* Main chat area */}
      <CardContent className="overflow-y-auto h-96 p-4 bg-white dark:bg-gray-900 relative scroll-smooth space-y-4">
          <div className="space-y-4 pb-4">
            {selectedPhilosopherMessages.map((msg) => 
              renderMessage(msg)
            )}
          </div>
        <div ref={messagesEndRef} />
        {/* Suggestions */}
        {!isStreaming && (
          <div className="pt-2 flex flex-col gap-4 items-center">
            {conversationTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(topic)}
                className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-md 
                    bg-white dark:bg-gray-800 hover:bg-primary/5 dark:hover:bg-primary/10 
                    text-gray-800 dark:text-gray-100 transition-all duration-200 
                    border border-gray-200 dark:border-gray-600 
                    shadow-sm hover:shadow-md transform hover:-translate-y-px
                    font-poppins`}
              >
                <span className="font-medium mr-2">{topic}</span>
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <ArrowRightIcon className="w-3.5 h-3.5 text-primary dark:text-primary-light" />
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg shadow-sm">
        {/* Message input */}
        <div className="w-full flex space-x-2">
          <input
            type="text"
            autoComplete="invalid"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Send a message to ${selectedCharacter.name}...`}
            disabled={isStreaming}
            className="flex-1 p-2 px-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white disabled:opacity-50"
            aria-label="Message input"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!input.trim() || isStreaming}
            className="p-2 rounded-full disabled:opacity-50"
            onClick={() => handleSendMessage()}
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </CardFooter>
      
      {/* Error toast message */}
      {errorMessage && (
        <div className="fixed top-24 left-8 z-50 mb-5 p-4 rounded-lg flex items-start bg-red-50 text-red-900 border border-red-200">
          <div className="flex-shrink-0 mr-3">
            <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
          </div>
          <div className="w-64 truncate">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
          >
            <XMarkIcon className="w-5 h-5 text-red-500 hover:text-red-700"/>
          </button>
        </div>
      )}
    </Card>
  );
}
