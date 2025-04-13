'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import {
  PaperAirplaneIcon,
  XMarkIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  TrashIcon,
  UserCircleIcon,
  LockClosedIcon,
  ChevronDoubleRightIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  IconButton,
  Button,
  Tooltip,
  Chip,
  Badge
} from "@material-tailwind/react";
import { getGuestId } from '@/lib/guestIdentifier';
import { API_URL } from '@/utils/axiosConfig';
import axios from 'axios';

interface Question {
  id: string;
  question: string;
}

// Guest info collected
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
  // Additional info not in database
  sessionCount: number,
  questionsAnswered: Question[]
}

interface Interaction {
  event: string,
  timestamp: string,
}

// Guest stored in database
interface Guest {
  additional_notes?: string;
  budget?: string;
  company?: string;
  contact_info?: string;
  created_at?: string;
  current_tech?: string[];
  first_visit_timestamp?: string;
  id: string | null;
  industry?: string;
  interaction_events?: string[];
  interaction_history?: Interaction[];
  name?: string;
  page_views?: string[];
  pain_points?: string[];
  project_type?: string[];
  session_id?: string;
  status?: 'NEW' | 'CONTACTED' | 'CONVERTED';
  timeline?: string;
  updated_at?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isQuestion?: boolean;
  questionId?: string;
}

type Theme = 'light' | 'dark';

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

// AI setup
const AI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const SYSTEM_PROMPT = "You are a helpful, friendly AI assistant for Theoforge, a company that specializes in ETL Solutions, Knowledge Graphs, and Custom LLM Training. Your goal is to be helpful, gather information about the guest to better assist them, and ultimately help convert them to customers. Ask questions one at a time to learn about their needs. Be concise but friendly.";
const apiKey = process.env.VITE_OPENAI_API_KEY || '';

// Questions to ask guests
const GUEST_QUESTIONS: Question[] = [
  { id: 'intro', question: "Hello! I'm your AI assistant from Theoforge. Before we get started, could you tell me about you and your company?"},
  { id: 'name', question: "Before we continue, may I know your name?" },
  { id: 'company', question: "Could you tell me what company are you with?" },
  { id: 'industry', question: "What industry are you in?"},
  { id: 'project_type', question: "What type of projects are you interested in?"},
  { id: 'budget', question: "What is your current budget?"},
  { id: 'timeline', question: "Please tell me more about the timeline of your project."},
  { id: 'contact_info', question: "May I get your contact info?"},
  { id: 'pain_points', question: "What specific data or AI challenges is your company facing that brought you here today?" },
  { id: 'current_tech', question: "What tech is your company into?" },
  { id: 'additional_notes', question: "Is there any additional info that might be helpful to know about you or your company?"}
];

// Generate a unique ID for messages
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Initial welcome message
const INITIAL_MESSAGES: Message[] = [
  {
    id: generateId(),
    role: 'system',
    content: SYSTEM_PROMPT,
    timestamp: new Date().toISOString()
  },
  {
    id: generateId(),
    role: 'assistant',
    content: GUEST_QUESTIONS[0].question,
    timestamp: new Date().toISOString()
  }
];

export function ChatBox({ 
  isOpen, 
  onClose,
}: ChatBoxProps) {
  // Guest identification
  const guestId = useRef<string | null>(null);
  const CHAT_STORAGE_KEY = useRef<string | null>(null);
  const GUEST_INFO_KEY = useRef<string | null>(null);
  const initialized = useRef(false);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  
  // Guest info state
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({id: '', sessionCount: 0, questionsAnswered: []});

  // Chat state management
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [theme, setTheme] = useState<Theme>('light');

  // UI state for resizing and minimization
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatSize, setChatSize] = useState({ width: 380, height: 580 });
  const [isResizing, setIsResizing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 0, height: 0 });
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages, isOpen, isMinimized]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  // Filter out system messages for display
  useEffect(() => {
    setVisibleMessages(messages.filter(msg => msg.role !== 'system'));
  }, [messages]);

  const loadGuest = async() => {
    // Create guest if new user
    guestId.current = await getGuestId();
    if(guestId.current) {
      try {
        // Load guest info
        const res = await axios.get(`${API_URL}/guests/${guestId.current}`);
        const guest: Guest = res.data;
        // Make sure guest exists on backend(sync)
        if(guest && guest.id === guestId.current){
          CHAT_STORAGE_KEY.current = 'chat_'+guest.id;
          GUEST_INFO_KEY.current = 'guest_'+guest.id;
          const storedGuestInfo = localStorage.getItem(GUEST_INFO_KEY.current);
          const remoteGuestInfo = {
            id: guest.id,
            name: guest.name,
            company: guest.company,
            industry: guest.industry,
            project_type: guest.project_type,
            budget: guest.budget,
            timeline: guest.timeline,
            contact_info: guest.contact_info,
            pain_points: guest.pain_points,
            current_tech: guest.current_tech,
            additional_notes: guest.additional_notes
          }
          // Load guest info
          if (storedGuestInfo) {
            try {
              const data: GuestInfo = JSON.parse(storedGuestInfo);
              setGuestInfo({
                ...remoteGuestInfo,
                sessionCount: data.sessionCount + 1,
                questionsAnswered: data.questionsAnswered
              });
            } catch (error) {
              console.error("Failed to parse guest info:", error);
            }
          } else {
            localStorage.setItem(GUEST_INFO_KEY.current, JSON.stringify({
              ...remoteGuestInfo,
              sessionCount: guestInfo.sessionCount + 1,
              questionsAnswered: guestInfo.questionsAnswered
            }));
          }
          // Load chat history
          const stored = localStorage.getItem(CHAT_STORAGE_KEY.current);
          if (stored) {
            try {
              const data = JSON.parse(stored);
              if (Array.isArray(data) && data.length > 0) {
                // Ensure we have a system prompt
                if (!data.some(msg => msg.role === 'system')) {
                  data.unshift({
                    id: generateId(),
                    role: 'system',
                    content: SYSTEM_PROMPT,
                    timestamp: new Date().toISOString()
                  });
                }
                setMessages(data);
                if(data.length > 2) setShowIntroduction(false);
              }
            } catch (error) {
              console.error("Failed to parse chat history:", error);
            }
          } else {
            localStorage.setItem(CHAT_STORAGE_KEY.current, JSON.stringify(messages));
          }
          setIsStorageLoaded(true);
        } else {
          throw Error('Out of sync with backend');
        }
      } catch {
        console.error('Failed to retrieve guest');
        // If out of sync, remove guest and recreate when guest returns
        if(guestId.current) {
          localStorage.removeItem('theoforge_guest_id');
          localStorage.removeItem('chat_'+guestId.current);
          localStorage.removeItem('guest_'+guestId.current);
        }
      }
    }
  }
  
  // Load chat history and guest info on mount
  useEffect(() => {
    // Prevent react strict mode remount from making API call twice in development
    if(!initialized.current){
      initialized.current = true;
      loadGuest();
    }
  }, []);

  // Persist chat history on every update
  useEffect(() => {
    if (isStorageLoaded) {
      try {
        if (CHAT_STORAGE_KEY.current) localStorage.setItem(CHAT_STORAGE_KEY.current, JSON.stringify(messages));
        else console.warn('Could not load messages');
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
    }
  }, [messages]);
  
  // Persist and sync guest info with backend with every update
  useEffect(() => {
    if (isStorageLoaded) {
      try {
        axios.put(`${API_URL}/guests/${guestId.current}`, guestInfo);
        if(GUEST_INFO_KEY.current) localStorage.setItem(GUEST_INFO_KEY.current, JSON.stringify(guestInfo));
        else console.warn('No guest info key');
      } catch (e) {
        console.warn("Could not save guest info:", e);
      }
    }
  }, [guestInfo]);

  // RESIZING HANDLERS
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = { ...chatSize };
    
    // Add event listeners
    const handleMouseMove = (e: MouseEvent) => handleResize(e);
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing) return;
    const deltaW = e.clientX - startPosRef.current.x;
    const deltaH = e.clientY - startPosRef.current.y;
    setChatSize({
      width: Math.max(320, startSizeRef.current.width + deltaW),
      height: Math.max(400, startSizeRef.current.height + deltaH)
    });
  };

  // Toggle minimization of the chatbox
  const toggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  // Get AI response using sendMessage
  const getAIResponse = async (context: Message[], updatedMessages: Message[]): Promise<string> => {
    setIsThinking(true);
    setError(null);
    
    try {      
      // Prepare messages for the API
      const apiMessages = context.map(m => ({ 
        role: m.role, 
        content: m.content 
      }));
      
      // COLLECT GUEST INFO
      // Add this context to the first system message
      apiMessages[0].content = `You are an AI assistant that collects information about guests and generates JSON.
      The following info has already been filled out.
      info: """${JSON.stringify(guestInfo)}"""
      Examine the messages for information about the guest and correct the info if needed.`;
      apiMessages[0].role = 'system';
      
      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: apiMessages,
          max_tokens: 500,
          temperature: 0.7,
          response_format: {
            "type": "json_schema",
            "json_schema": {
              "name": "guestInfo",
              "strict": true,
              "schema": {
                "type": "object",
                "properties":{
                  "name": {
                    "description": "Guest's full name",
                    "type": ["string", "null"]
                  },
                  "company": {
                    "description": "Company associated with the guest",
                    "type": ["string", "null"]
                  },
                  "industry": {
                    "description": "Industry of the guest",
                    "type": ["string", "null"]
                  },
                  "project_type": {
                    "description": "Type of project guest is interested in",
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "budget": {
                    "description": "Estimated budget for the project",
                    "type": ["string", "null"]
                  },
                  "timeline": {
                    "description": "Project timeline",
                    "type": ["string", "null"]
                  },
                  "contact_info": {
                    "description": "Guest's contact information",
                    "type": ["string", "null"]
                  },
                  "pain_points": {
                    "description": "Challenges or problems the guest is facing",
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "current_tech": {
                    "description": "Guest's current technology stack",
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "additional_notes": {
                    "description": "Any additional notes",
                    "type": ["string", "null"]
                  }
                },
                "required": ["name", "company", "industry", "project_type", "budget", "timeline", "contact_info", "pain_points", "current_tech", "additional_notes"],
                "additionalProperties": false
              }
            }
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `API Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setGuestInfo(JSON.parse(data.choices[0].message.content));
      
      // Create response
      // Add system prompt and context to the first system message
      apiMessages[0].content = `${SYSTEM_PROMPT}
      The following guest info has been collected.
      info: """${JSON.stringify(guestInfo)}"""`;
      apiMessages[0].role = 'system';
      // Use openai streaming api
      const streamResponse = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: apiMessages,
          max_tokens: 500,
          temperature: 0.7,
          stream: true
        })
      });
      if (!streamResponse.body){
        throw new Error('Failed to get response body');
      }
      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiResponse = "";
      // Read until stream is done
      while(true) {
        const {done, value} = await reader.read();
        if(done) {
          break;
        }
        // While streaming, decode the stream
        const decodedChunk = decoder.decode(value);
        const lines = decodedChunk.split("\n");
        // Parse the result
        const parsedLines = lines.map(
          (line) => line.replace(/^data: /, "").trim()
        ).filter(
          (line) => line !== "" && line !== "[DONE]"
        ).map((line) => JSON.parse(line));
        for (const parsedLine of parsedLines) {
          // Extract the content
          const content = parsedLine.choices[0].delta.content;
          if (content) {
            setMessages([...updatedMessages, {
              id: generateId(),
              role: 'assistant',
              content: aiResponse+content,
              timestamp: new Date().toISOString()
            }]);
            aiResponse+=content;
          }
        }
      }
      return 'Done'
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      setError(error.message || "Failed to get response from AI service");
      return "I'm sorry, I encountered an error while processing your request. Please try again later.";
    } finally {
      setIsThinking(false);
    }
  };

  // Clear the chat history
  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages(INITIAL_MESSAGES);
      setShowIntroduction(true);
      try {
        if(CHAT_STORAGE_KEY.current) localStorage.removeItem(CHAT_STORAGE_KEY.current);
      } catch (e) {
        console.warn("Could not access localStorage:", e);
      }
    }
  };

  // Handler for sending text messages
  const handleSend = async (manualInput?: string) => {
    const textToSend = manualInput || input.trim();
    if (!textToSend) return;
    
    // Hide introduction once user starts chatting
    if (showIntroduction) {
      setShowIntroduction(false);
    }
    
    setInput('');
    
    // Create a new user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };
    
    // Update messages state with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Context limitation - use last 15 messages for context (including system prompt)
    const context = updatedMessages.slice(-15);
    
    // Ensure system prompt is included
    if (!context.some(msg => msg.role === 'system')) {
      context.unshift({
        id: generateId(),
        role: 'system',
        content: SYSTEM_PROMPT,
        timestamp: new Date().toISOString()
      });
    }
    
    // Get AI response
    await getAIResponse(context, updatedMessages);
  };

  // Allow sending message with Enter key (without Shift)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick replies/suggestions
  const handleQuickReply = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(text), 100);
  };

  // Render the minimized chat button
  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={toggleMinimize}
          className={`bg-teal-500 text-white p-4 rounded-full shadow-lg hover:bg-teal-600 transition transform hover:scale-105 flex items-center justify-center`}
          aria-label="Open chat"
        >
          <Badge content={visibleMessages.length > 2 ? "1" : "0"} color="red">
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
          </Badge>
          <span className="sr-only">Open chat</span>
        </button>
      </div>
    );
  }

  // Determine theme-based classes
  const themeClasses = theme === 'dark' 
    ? {
        card: "bg-gray-900 border-gray-800",
        header: `bg-gradient-to-r from-teal-800 to-teal-900`,
        body: "bg-gray-900",
        message: {
          user: `bg-teal-600 text-white`,
          assistant: "bg-gray-800 text-gray-100",
          question: "bg-indigo-700 text-white border border-indigo-400",
          timestamp: {
            user: `text-teal-200`,
            assistant: "text-gray-400",
            question: "text-indigo-200"
          }
        },
        input: "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400",
        buttons: "text-gray-300 hover:bg-gray-700",
        quickReplies: "bg-gray-800 border-gray-700 text-white",
        footer: "border-gray-800"
      }
    : {
        card: "bg-white border-gray-200",
        header: `bg-gradient-to-r from-teal-500 to-teal-600`,
        body: "bg-white",
        message: {
          user: `bg-teal-500 text-white`,
          assistant: "bg-gray-100 text-gray-800",
          question: "bg-indigo-500 text-white border border-indigo-300",
          timestamp: {
            user: `text-teal-100`,
            assistant: "text-gray-500",
            question: "text-indigo-100"
          }
        },
        input: "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500",
        buttons: "text-gray-700 hover:bg-gray-100",
        quickReplies: "bg-gray-50 border-gray-200 text-gray-700",
        footer: "border-gray-200"
      };

  // Quick reply suggestions based on context
  const getSuggestions = () => {
    if (visibleMessages.length <= 1) {
      return [
        `Tell me about Theoforge`,
        "What services do you offer?",
        "How can I schedule a demo?"
      ];
    }
    
    if (guestInfo.pain_points?.length) {
      return [
        `How do you handle ${guestInfo.pain_points[0]}?`,
        "What are your pricing options?",
        "Can you share some case studies?"
      ];
    }
    
    return [
      "Tell me about your Knowledge Graph solutions",
      "What makes your ETL solutions unique?",
      "Do you offer custom LLM training?"
    ];
  };

  return (
    <div
      ref={resizeRef}
      className="fixed bottom-4 right-4 z-50 shadow-xl rounded-xl overflow-hidden transition-all duration-300"
      style={{ width: `${chatSize.width}px`, height: `${chatSize.height}px` }}
    >
      <Card className={`w-full h-full flex flex-col border rounded-xl ${themeClasses.card}`}>
        {/* Header */}
        <CardHeader 
          floated={false}
          className={`sticky top-0 z-20 px-6 pt-4 pb-6 m-0 rounded-b-none shadow-md ${themeClasses.header}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative mr-3">
                <img 
                  src={"/logo.png"} 
                  alt={`Theoforge Logo`} 
                  className="h-9 w-9 rounded-full border-2 border-white shadow-sm" 
                />
                {guestInfo.name && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                )}
              </div>
              <div>
                <Typography className="text-white text-lg font-bold flex items-center">
                  Theoforge AI
                </Typography>
              </div>
            </div>
            <div className="flex gap-1">
              <Tooltip content="Change theme">
                <IconButton
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  variant="text"
                  color="white"
                  className="h-8 w-8 rounded-full hover:bg-white/20 transition-all"
                  size="sm"
                >
                  <LightBulbIcon className="h-4 w-4" />
                </IconButton>
              </Tooltip>
              <Tooltip content="Clear chat history">
                <IconButton
                  onClick={clearChat}
                  variant="text"
                  color="white"
                  className="h-8 w-8 rounded-full hover:bg-white/20 transition-all"
                  size="sm"
                >
                  <TrashIcon className="h-4 w-4" />
                </IconButton>
              </Tooltip>
              <Tooltip content="Minimize">
                <IconButton
                  onClick={toggleMinimize}
                  variant="text"
                  color="white"
                  className="h-8 w-8 rounded-full hover:bg-white/20 transition-all" size="sm"
                >
                  <MinusIcon className="h-4 w-4" />
                </IconButton>
                </Tooltip>
              <Tooltip content={chatSize.width > 400 ? "Smaller size" : "Larger size"}>
                <IconButton
                  onClick={() => setChatSize(
                    chatSize.width > 400 
                      ? { width: 380, height: 520 } 
                      : { width: 480, height: 600 }
                  )}
                  variant="text"
                  color="white"
                  className="h-8 w-8 rounded-full hover:bg-white/20 transition-all"
                  size="sm"
                >
                  {chatSize.width > 400 ? (
                    <ArrowsPointingInIcon className="h-4 w-4" />
                  ) : (
                    <ArrowsPointingOutIcon className="h-4 w-4" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip content="Close">
                <IconButton
                  onClick={onClose}
                  variant="text"
                  color="white"
                  className="h-8 w-8 rounded-full hover:bg-white/20 transition-all"
                  size="sm"
                >
                  <XMarkIcon className="h-4 w-4" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        
        {/* Message Container */}
        <CardBody 
          ref={chatContainerRef} 
          className={`h-full flex-grow overflow-y-auto p-6 space-y-4 ${themeClasses.body}`}
        >
          {/* Introduction Panel - only shown at first */}
          {showIntroduction && (
            <div className={`mb-6 p-4 rounded-lg border border-teal-100 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-100`}>
              <div className="flex items-center mb-3">
                <SparklesIcon className={`h-5 w-5 text-teal-500 mr-2`} />
                <Typography variant="h6" className="font-semibold">Welcome to Theoforge AI Assistant</Typography>
              </div>
              <Typography variant="small" className="mb-3">
                I'm here to help answer your questions about our services and solutions. Feel free to ask about:
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <div className={`p-2 rounded border border-teal-200 bg-white/80 dark:bg-gray-800/80 flex items-center`}>
                  <div className={`mr-2 p-1 rounded-full bg-teal-100 dark:bg-teal-900`}>
                    <ChevronDoubleRightIcon className={`h-3 w-3 text-teal-500`} />
                  </div>
                  <Typography variant="small" className="font-medium">ETL Solutions</Typography>
                </div>
                <div className={`p-2 rounded border border-teal-200 bg-white/80 dark:bg-gray-800/80 flex items-center`}>
                  <div className={`mr-2 p-1 rounded-full bg-teal-100 dark:bg-teal-900`}>
                    <ChevronDoubleRightIcon className={`h-3 w-3 text-teal-500`} />
                  </div>
                  <Typography variant="small" className="font-medium">Knowledge Graphs</Typography>
                </div>
                <div className={`p-2 rounded border border-teal-200 bg-white/80 dark:bg-gray-800/80 flex items-center`}>
                  <div className={`mr-2 p-1 rounded-full bg-teal-100 dark:bg-teal-900`}>
                    <ChevronDoubleRightIcon className={`h-3 w-3 text-teal-500`} />
                  </div>
                  <Typography variant="small" className="font-medium">Custom LLM Training</Typography>
                </div>
                <div className={`p-2 rounded border border-teal-200 bg-white/80 dark:bg-gray-800/80 flex items-center`}>
                  <div className={`mr-2 p-1 rounded-full bg-teal-100 dark:bg-teal-900`}>
                    <ChevronDoubleRightIcon className={`h-3 w-3 text-teal-500`} />
                  </div>
                  <Typography variant="small" className="font-medium">Case Studies & Pricing</Typography>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <LockClosedIcon className="h-3 w-3 mr-1 text-gray-400" />
                <Typography variant="small" className="text-xs text-gray-500">
                  Your conversations are stored locally on your device only
                </Typography>
              </div>
            </div>
          )}
          
          {/* Guest info chip - only show once info is collected */}
          {guestInfo.name && (
            <div className="flex justify-center mb-4">
              <Chip
                value={
                  <div className="flex items-center gap-2">
                    <UserCircleIcon className="h-4 w-4" />
                    <span>{guestInfo.name+(guestInfo.company ? " from "+guestInfo.company : "")}</span>
                  </div>
                }
                color="teal"
                variant="ghost"
                className="px-3 py-1.5"
              />
            </div>
          )}
          
          {visibleMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] p-4 rounded-xl shadow-md ${
                  msg.role === 'user' 
                    ? themeClasses.message.user 
                    : msg.isQuestion
                      ? themeClasses.message.question
                      : themeClasses.message.assistant
                }`}
              >
                {msg === visibleMessages[visibleMessages.length - 1] && isThinking 
                  ? <Typography className="text-sm whitespace-pre-wrap">{msg.content}<span className="animate-pulse">▌</span></Typography>
                  : <Typography className="text-sm whitespace-pre-wrap">{msg.content}</Typography>
                }
                <Typography 
                  variant="small" 
                  className={`mt-1 text-xs ${
                    msg.role === 'user' 
                      ? themeClasses.message.timestamp.user 
                      : msg.isQuestion
                        ? themeClasses.message.timestamp.question
                        : themeClasses.message.timestamp.assistant
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </div>
            </div>
          ))}
          
          {error && (
            <div className="flex justify-center">
              <div className="max-w-[90%] p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <Typography variant="small" className="font-medium">{error}</Typography>
                    <Button 
                      variant="text" 
                      size="sm" 
                      color="red" 
                      className="p-0 mt-1" 
                      onClick={() => setError(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Replies */}
          {!isThinking && (
            <div className="pt-2 flex flex-wrap gap-2 justify-center">
              {getSuggestions().map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="sm"
                  color="teal"
                  className={`px-3 py-1.5 cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors`}
                  onClick={() => handleQuickReply(suggestion)}
                >{suggestion}</Button>
              ))}
            </div>
          )}
          
          <div ref={messageEndRef} />
        </CardBody>
        
        {/* Footer / Input */}
        <CardFooter className={`p-4 border-t ${themeClasses.footer}`}>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={"Type your message..."}
              className={`flex-grow border rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 ${themeClasses.input}`}
              disabled={isThinking}
            />
            
            <Button 
              onClick={() => handleSend()} 
              color="teal"
              variant="gradient"
              className="p-2 rounded-full shadow-md"
              disabled={isThinking || !input.trim()}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </Button>
          </div>
          
          {visibleMessages.length > 1 && (
            <div className="mt-2 text-center">
              <Typography variant="small" className="text-gray-500 dark:text-gray-400 text-xs flex items-center justify-center gap-1">
                <LockClosedIcon className="h-3 w-3" />
                Messages are saved locally on this device
              </Typography>
            </div>
          )}
        </CardFooter>
      </Card>
      
      {/* Resize Handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize bg-transparent flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity"
        aria-label="Resize chat window"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <rect x="0" y="8" width="2" height="2" />
          <rect x="4" y="8" width="2" height="2" />
          <rect x="8" y="8" width="2" height="2" />
          <rect x="4" y="4" width="2" height="2" />
          <rect x="8" y="4" width="2" height="2" />
          <rect x="8" y="0" width="2" height="2" />
        </svg>
      </div>
    </div>
  );
}
