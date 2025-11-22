// lib/agentRouterClient.js
// Client wrapper for calling the Supabase Edge Function from React Native

import { supabase } from './supabase';

export const AGENT_IDS = {
  DEVOTIONAL_GUIDE: 'devotional_guide',
  JOURNAL_COACH: 'journal_coach',
  BREAKUP_COACH: 'breakup_coach',
  HABITS_COACH: 'habits_coach',
  BREAKTHROUGH_COACH: 'breakthrough_coach',
  BIBLE_STUDY_AGENT: 'bible_study_agent',
  PRAYER_COACH: 'prayer_coach',
  LEADERSHIP_MENTOR: 'leadership_mentor',
  EMOTIONAL_INTELLIGENCE_COACH: 'emotional_intelligence_coach',
  WORKFLOW_META_AGENT: 'workflow_meta_agent',
  BUILDER_HANDOFF_AGENT: 'builder_handoff_agent'
};

/**
 * Calls the Supabase Edge Function: agent-router
 * - Automatically injects current user_id
 * - Works in React Native with Expo
 */
export async function callAgentRouter({
  agent_id,
  message,
  context = {},
  metadata = {}
}) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('Auth state:', { user, authError });
      // For demo/development, use a demo user ID
      const demoUserId = '00000000-0000-0000-0000-000000000001';
      
      const body = {
        user_id: demoUserId,
        agent_id,
        message,
        context,
        metadata: { ...metadata, demo: true }
      };

      // Try edge function first if Supabase is configured
      if (supabase.supabaseUrl && supabase.supabaseUrl !== 'YOUR_SUPABASE_URL') {
        const { data, error } = await supabase.functions.invoke('agent-router', {
          body
        });

        if (!error && data) {
          return data;
        }
      }

      // Fallback to mock response for development
      return getMockAgentResponse(agent_id, message);
    }

    // Authenticated user path
    const body = {
      user_id: user.id,
      agent_id,
      message,
      context,
      metadata
    };

    const { data, error } = await supabase.functions.invoke('agent-router', {
      body
    });

    if (error) {
      console.error('Edge function error:', error);
      // Fallback to mock response
      return getMockAgentResponse(agent_id, message);
    }

    return data;
  } catch (error) {
    console.error('Agent router error:', error);
    // Fallback to mock response
    return getMockAgentResponse(agent_id, message);
  }
}

// Mock responses for development/fallback
function getMockAgentResponse(agentId, message) {
  const mockResponses = {
    devotional_guide: "Brother, today's devotion reminds us that God's strength is made perfect in our weakness. Let's reflect on 2 Corinthians 12:9 together. What specific area of weakness are you bringing before the Lord today?",
    
    journal_coach: "That's a powerful insight you've shared. Let's dig deeper - what emotion is sitting beneath that thought? Take a moment to name it without judgment. Your growth comes from honest self-examination, brother.",
    
    breakup_coach: "I hear the pain in your words, brother. This relationship loss is real, and your grief is valid. Remember: you're not rebuilding to win her back, you're rebuilding to become the man God designed you to be. What's one thing you can do today to invest in your own growth?",
    
    habits_coach: "Consistency beats perfection every time. You've identified the habit you want to build - now let's make it stupidly simple to start. What's the absolute smallest version of this habit you could do tomorrow morning? We're talking 2-minute commitment max.",
    
    breakthrough_coach: "That limiting belief has been running your life from the shadows for too long. Let's expose it to the light. When did you first start believing this about yourself? And more importantly - what evidence do you have that it's actually FALSE?",
    
    bible_study_agent: "Excellent question about that passage. The Greek word used here is 'agape' - unconditional love. This isn't just feeling; it's committed action. How might viewing love as action rather than emotion change how you approach your relationships this week?",
    
    prayer_coach: "Brother, your prayer warrior journey is strengthening. Remember, prayer isn't about perfect words - it's about honest connection with the Father. What burden are you carrying that you haven't yet surrendered in prayer? Let's bring it to the throne together.",
    
    leadership_mentor: "Leadership starts with self-leadership. You can't take others where you haven't been yourself. What area of your personal life needs discipline before you can authentically lead others there? Be specific.",
    
    emotional_intelligence_coach: "Emotional strength isn't about suppressing feelings - it's about understanding and channeling them wisely. That anger you mentioned? It's often fear in disguise. What are you actually afraid of losing in this situation?",
    
    workflow_meta_agent: "I notice you're making solid progress on your spiritual disciplines. Your devotional consistency is at 80%, but your journaling has dropped to 40%. What's the main friction point keeping you from your evening reflection time?",
    
    builder_handoff_agent: "Technical implementation noted. Your app architecture is solid and the agent integration is working well. The Base44 connection will activate once you add your API credentials. Focus on one agent at a time for best results."
  };

  return {
    ok: true,
    agent_id: agentId,
    reply: mockResponses[agentId] || `[${agentId}]: ${message} (received)`,
    debug: { mock: true }
  };
}