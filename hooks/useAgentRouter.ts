import { useState, useCallback, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { AgentId, AGENT_IDS } from '@/lib/agentRouterClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for the agent router
interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AgentMemory {
  [key: string]: any;
}

interface AgentRouterHook {
  sendMessage: (agentId: AgentId, message: string) => Promise<string>;
  getConversationHistory: (agentId: AgentId) => Promise<AgentMessage[]>;
  getAgentMemory: (agentId: AgentId) => Promise<AgentMemory>;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
  isSupabaseConnected: boolean;
  isBase44Enabled: boolean;
}

// Check if Base44 and Supabase are configured
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const BASE44_ENABLED = process.env.EXPO_PUBLIC_BASE44_ENABLED === 'true';
const AGENT_ROUTER_URL = process.env.EXPO_PUBLIC_AGENT_ROUTER_URL;

// Mock responses for when services are not configured
const MOCK_RESPONSES: Record<AgentId, string[]> = {
  [AGENT_IDS.DEVOTIONAL_GUIDE]: [
    "Let's explore God's Word together. What scripture or spiritual theme is on your heart today?",
    "The Bible speaks directly to your situation. Which area of your faith journey would you like to strengthen?",
    "God's wisdom is timeless. What questions about His Word can I help you understand?"
  ],
  [AGENT_IDS.JOURNAL_COACH]: [
    "That's worth exploring deeper. What emotions come up when you sit with that thought?",
    "Journaling reveals patterns. What recurring themes do you notice in your life lately?",
    "Your story matters. What moment from today deserves to be captured and reflected upon?"
  ],
  [AGENT_IDS.BREAKUP_COACH]: [
    "Healing takes time and intention. What specific pain point are you working through today?",
    "Every ending is also a beginning. What new strength are you discovering in yourself?",
    "You're not alone in this journey. What support do you need most right now?"
  ],
  [AGENT_IDS.HABITS_COACH]: [
    "Small actions compound into transformation. What's one micro-habit you can start today?",
    "Consistency beats perfection. How can we make your desired behavior easier to maintain?",
    "Every day is a chance to vote for who you're becoming. What identity are you building?"
  ],
  [AGENT_IDS.BREAKTHROUGH_COACH]: [
    "Breakthroughs happen at the edge of comfort. What fear are you ready to face?",
    "Your limitations are often just untested assumptions. Which belief needs challenging?",
    "God has equipped you for victory. What battle are you being called to fight?"
  ],
  [AGENT_IDS.BIBLE_STUDY_AGENT]: [
    "Let's dig into the context and meaning. Which passage would you like to explore?",
    "Scripture has layers of wisdom. What connections are you seeing between verses?",
    "The Word is living and active. How is this passage speaking to your current situation?"
  ],
  [AGENT_IDS.PRAYER_COACH]: [
    "Prayer is conversation with God. What's really on your heart right now?",
    "Let's bring this before the Lord together. How can I support your prayer life?",
    "God hears every word, even the unspoken ones. What burden can we lift up?"
  ],
  [AGENT_IDS.LEADERSHIP_MENTOR]: [
    "Leadership starts with self-leadership. What example are you setting today?",
    "Great leaders serve others first. Who needs your strength right now?",
    "Vision creates movement. What future are you building toward?"
  ],
  [AGENT_IDS.EMOTIONAL_INTELLIGENCE_COACH]: [
    "Emotions are data, not directives. What is this feeling trying to tell you?",
    "Self-awareness precedes self-mastery. What pattern are you noticing?",
    "Empathy builds bridges. How can you better understand others' perspectives?"
  ],
  [AGENT_IDS.WORKFLOW_META_AGENT]: [
    "I can analyze your needs and recommend the right support. What's your primary goal?",
    "Let's find the perfect coach for your situation. What area needs the most attention?",
    "Based on your patterns, I see opportunities for growth. Shall we explore them?"
  ],
  [AGENT_IDS.BUILDER_HANDOFF_AGENT]: [
    "I'll help translate your vision into actionable requirements. What are you looking to build?",
    "Let's break down your idea into technical components. What's the core functionality?",
    "From concept to implementation, I'll guide the process. What's your end goal?"
  ]
};

export function useAgentRouter(): AgentRouterHook {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const isSupabaseConnected = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  const isBase44Enabled = BASE44_ENABLED && !!AGENT_ROUTER_URL;

  // Initialize user ID from AsyncStorage or generate one
  useEffect(() => {
    const initUserId = async () => {
      try {
        let storedUserId = await AsyncStorage.getItem('userId');
        if (!storedUserId) {
          // Generate a UUID-like ID for the user
          storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem('userId', storedUserId);
        }
        setUserId(storedUserId);
      } catch (err) {
        console.error('Error initializing user ID:', err);
        setUserId(`temp_${Date.now()}`);
      }
    };
    initUserId();
  }, []);

  // Send message to agent
  const sendMessage = useCallback(async (agentId: AgentId, message: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // If Base44 is enabled and we have the edge function URL, use it
      if (isBase44Enabled && isSupabaseConnected && AGENT_ROUTER_URL) {
        const { data, error: fnError } = await supabase.functions.invoke('agent-router', {
          body: {
            userId: userId || 'anonymous',
            agentId,
            message,
            timestamp: new Date().toISOString(),
            sessionId: await AsyncStorage.getItem('sessionId') || `session_${Date.now()}`
          }
        });

        if (fnError) throw fnError;
        
        // Log to conversation history
        if (isSupabaseConnected) {
          await supabase.from('conversation_history').insert([
            { user_id: userId, agent_name: agentId, role: 'user', content: message },
            { user_id: userId, agent_name: agentId, role: 'assistant', content: data.response }
          ]);
        }

        return data.response;
      }

      // Fallback to mock responses
      const responses = MOCK_RESPONSES[agentId] || ["I'm here to help. Tell me more."];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Store in local storage for mock mode
      const history = await getConversationHistory(agentId);
      history.push(
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: randomResponse, timestamp: new Date() }
      );
      await AsyncStorage.setItem(`chat_${agentId}`, JSON.stringify(history));

      return randomResponse;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Agent router error:', err);
      
      // Return fallback response even on error
      const responses = MOCK_RESPONSES[agentId] || ["I'm here to help. Tell me more."];
      return responses[0];
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSupabaseConnected, isBase44Enabled]);

  // Get conversation history
  const getConversationHistory = useCallback(async (agentId: AgentId): Promise<AgentMessage[]> => {
    try {
      if (isSupabaseConnected && userId) {
        const { data, error } = await supabase
          .from('conversation_history')
          .select('role, content, created_at')
          .eq('user_id', userId)
          .eq('agent_name', agentId)
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;

        return data.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at)
        }));
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(`chat_${agentId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Error fetching history:', err);
      return [];
    }
  }, [userId, isSupabaseConnected]);

  // Get agent memory
  const getAgentMemory = useCallback(async (agentId: AgentId): Promise<AgentMemory> => {
    try {
      if (isSupabaseConnected && userId) {
        const { data, error } = await supabase
          .from('agent_memory')
          .select('memory_key, memory_value')
          .eq('user_id', userId)
          .eq('agent_name', agentId);

        if (error) throw error;

        const memory: AgentMemory = {};
        data.forEach(item => {
          memory[item.memory_key] = item.memory_value;
        });
        return memory;
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(`memory_${agentId}`);
      return stored ? JSON.parse(stored) : {};
    } catch (err) {
      console.error('Error fetching memory:', err);
      return {};
    }
  }, [userId, isSupabaseConnected]);

  return {
    sendMessage,
    getConversationHistory,
    getAgentMemory,
    isLoading,
    error,
    userId,
    isSupabaseConnected,
    isBase44Enabled
  };
}