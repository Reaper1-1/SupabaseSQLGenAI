import axios from 'axios';

// Use localhost for mobile development
const API_URL = 'http://localhost:3001/api';

// Create a mock user for demo purposes
// In production, this would come from authentication
const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'demo@betterman.app',
  displayName: 'Brother'
};

class BetterManAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
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
      breakup: "I understand you're going through something difficult. Remember, healing isn't linear—every day you choose to move forward is a victory. What specific challenge are you facing today?",
      journal: "That's worth exploring deeper. What emotions come up when you sit with that thought? Sometimes the most powerful insights come from the questions we're afraid to ask ourselves.",
      prayer: "God meets us exactly where we are. Your honesty in prayer is more valuable than perfect words. What's really on your heart right now?",
      habits: "Consistency is your superpower. Even showing up today, right now, is building the foundation for who you're becoming. What's one small win you can create in the next hour?"
    };
    
    return responses[agentName] || "I'm here to support you. Tell me more about what's on your mind today.";
  }
}

export default new BetterManAPI();