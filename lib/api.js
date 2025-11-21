import axios from 'axios';
import supabase, { isSupabaseConfigured } from './supabase';
import * as agentMemory from './services/agentMemory';

// Use Replit domain for web, localhost for native development
const getApiUrl = () => {
  // Check if running in Replit environment
  if (typeof window !== 'undefined' && window.location.hostname.includes('replit')) {
    // Use the current domain but on port 3001 for backend
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3001/api`;
  }
  // Fallback for local development
  return 'http://localhost:3001/api';
};

const API_URL = getApiUrl();

// Create a mock user for demo purposes
// In production, this would come from authentication
const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'demo@betterman.app',
  displayName: 'Brother'
};

// Configuration flags
const USE_SUPABASE = isSupabaseConfigured();
const ENABLE_SUPABASE_EDGE_FUNCTIONS = false; // Set to true when edge functions are deployed

class BetterManAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Export agent memory functions for direct access
    this.agentMemory = agentMemory;
    
    // Log current mode
    console.log(`BetterManAPI initialized in ${USE_SUPABASE ? 'Supabase' : 'Mock'} mode`);
    
    // Initialize demo user
    this.initUser();
  }
  
  async initUser() {
    try {
      await this.createUser(DEMO_USER.email, DEMO_USER.displayName);
    } catch (error) {
      console.log('User initialization:', error.message);
    }
  }
  
  // User management
  async createUser(email, displayName) {
    try {
      const response = await this.client.post('/users/create', { email, displayName });
      return response.data.user;
    } catch (error) {
      console.error('Create user error:', error);
      return DEMO_USER;
    }
  }
  
  async getUser(email) {
    try {
      const response = await this.client.get(`/users/${email}`);
      return response.data.user;
    } catch (error) {
      console.error('Get user error:', error);
      return DEMO_USER;
    }
  }
  
  // Agent chat
  async sendChatMessage(agentName, message) {
    // Check if we should use Supabase edge functions
    if (USE_SUPABASE && ENABLE_SUPABASE_EDGE_FUNCTIONS && supabase) {
      try {
        // Stub for calling Supabase edge function
        // This will be implemented when edge functions are deployed
        console.log('Would call Supabase edge function for chat:', { agentName, message });
        
        // For now, fall through to try Express backend or use mock
        // When ready, uncomment and implement:
        /*
        const { data, error } = await supabase.functions.invoke('agent-chat', {
          body: {
            userId: DEMO_USER.id,
            agentName,
            message
          }
        });
        
        if (error) throw error;
        return data.response;
        */
      } catch (error) {
        console.error('Supabase edge function error:', error);
        // Fall through to try Express backend
      }
    }
    
    // Try Express backend
    try {
      const response = await this.client.post('/agent/chat', {
        userId: DEMO_USER.id,
        agentName,
        message
      });
      return response.data.response;
    } catch (error) {
      console.error('Chat error:', error);
      // Return a fallback response
      return this.getFallbackResponse(agentName);
    }
  }
  
  // Helper method to call Supabase edge functions (when ready)
  async callSupabaseFunction(functionName, body) {
    if (!USE_SUPABASE || !supabase) {
      throw new Error('Supabase not configured');
    }
    
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Supabase function ${functionName} error:`, error);
      throw error;
    }
  }
  
  // Get conversation history
  async getConversationHistory(agentName, limit = 20) {
    try {
      const response = await this.client.get(`/conversations/${DEMO_USER.id}/${agentName}?limit=${limit}`);
      return response.data.messages;
    } catch (error) {
      console.error('Get history error:', error);
      return [];
    }
  }
  
  // Daily workflows
  async getDailyWorkflow(date = new Date().toISOString().split('T')[0]) {
    try {
      const response = await this.client.get(`/workflows/${DEMO_USER.id}/${date}`);
      return response.data.workflow;
    } catch (error) {
      console.error('Get workflow error:', error);
      return {
        devotional_completed: false,
        study_completed: false,
        journal_completed: false,
        challenge_completed: false,
        prayer_minutes: 0,
        verses_read: 0
      };
    }
  }
  
  async updateDailyWorkflow(updates, date = new Date().toISOString().split('T')[0]) {
    try {
      const response = await this.client.post('/workflows/update', {
        userId: DEMO_USER.id,
        date,
        updates
      });
      return response.data.workflow;
    } catch (error) {
      console.error('Update workflow error:', error);
      return null;
    }
  }
  
  // Progress stats
  async getProgressStats() {
    try {
      const response = await this.client.get(`/progress/stats/${DEMO_USER.id}`);
      return response.data;
    } catch (error) {
      console.error('Get stats error:', error);
      return {
        currentStreak: 0,
        totalDays: 0,
        weekStats: {}
      };
    }
  }
  
  // Agent memory
  async getAgentMemory(agentName) {
    try {
      const response = await this.client.get(`/memory/${DEMO_USER.id}/${agentName}`);
      return response.data.memory;
    } catch (error) {
      console.error('Get memory error:', error);
      return {};
    }
  }
  
  // Fallback responses when API is unavailable
  getFallbackResponse(agentName) {
    const responses = {
      devotional_guide: "Welcome to your daily walk with Scripture. I'm here to help you dive deeper into God's Word. What passage or theme would you like to explore today?",
      journal_coach: "That's worth exploring deeper. What emotions come up when you sit with that thought? Sometimes the most powerful insights come from the questions we're afraid to ask ourselves.",
      breakup_coach: "I understand you're going through something difficult. Remember, healing isn't linear—every day you choose to move forward is a victory. What specific challenge are you facing today?",
      habits_coach: "Consistency is your superpower. Even showing up today, right now, is building the foundation for who you're becoming. What's one small win you can create in the next hour?",
      breakthrough_coach: "Every stronghold can fall with truth and action. You don't have to fight alone. What battle are you ready to face today?",
      bible_study_agent: "Let's dig into Scripture together. I can provide context and help you see connections you might have missed. What would you like to study?",
      prayer_coach: "God meets us exactly where we are. Your honesty in prayer is more valuable than perfect words. What's really on your heart right now?",
      leadership_mentor: "Leadership starts with leading yourself well. Every great leader faced challenges like yours. What leadership situation are you navigating?",
      emotional_intelligence_coach: "Understanding your emotions is the first step to mastering them. There's strength in feeling deeply. What are you experiencing right now?",
      workflow_meta_agent: "I'm here to analyze your needs and recommend the right support. Tell me about your current challenges and goals.",
      builder_handoff_agent: "I'll help translate your vision into technical requirements. What feature or system are you looking to build?"
    };
    
    return responses[agentName] || "I'm here to support you. Tell me more about what's on your mind today.";
  }
}

export default new BetterManAPI();