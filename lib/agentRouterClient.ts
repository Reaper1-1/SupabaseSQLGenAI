// Better Man Project — Agent Router client for mobile (Expo/React Native)
// Enhanced version with full TypeScript support and Supabase integration

import supabase from "./supabase";

// Keep this in sync with your edge function's AgentId union
export type AgentId =
  | "devotional_guide"
  | "journal_coach"
  | "breakup_coach"
  | "habits_coach"
  | "breakthrough_coach"
  | "bible_study_agent"
  | "prayer_coach"
  | "leadership_mentor"
  | "emotional_intelligence_coach"
  | "workflow_meta_agent"
  | "builder_handoff_agent";

// Edge function URL - set this in your environment
const AGENT_ROUTER_URL =
  process.env.EXPO_PUBLIC_AGENT_ROUTER_URL ??
  process.env.AGENT_ROUTER_URL ??
  "";

// Shapes must match your edge function
export interface AgentRouterRequest {
  agent_id: AgentId;
  message: string;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AgentRouterResponse {
  ok: boolean;
  agent_id: AgentId;
  reply: string;
  error?: string;
  details?: string;
}

/**
 * Rich mock responses for development/testing when Supabase is not configured
 */
const MOCK_RESPONSES: Record<AgentId, (message: string) => string> = {
  devotional_guide: (msg) => 
    `Brother, I hear you asking about "${msg}". Let's dive into Scripture together. The Word speaks to this directly - remember that God's promises are Yes and Amen in Christ. What specific verse or biblical principle would you like to explore deeper regarding this?`,
  
  journal_coach: (msg) =>
    `I notice you're processing "${msg}". That's significant. What emotions are coming up as you sit with this? Take a moment to explore what's beneath the surface - what is your heart really trying to tell you here?`,
  
  breakup_coach: (msg) =>
    `I hear the weight in "${msg}", brother. Relationship pain cuts deep, especially when it touches on our identity and worth. You're not alone in this valley. What specific aspect of this loss is hitting you the hardest right now?`,
  
  habits_coach: (msg) =>
    `"${msg}" - I see you're ready to level up. Excellence is built through small, consistent actions. Let's get tactical: What's one micro-habit you could implement TODAY that moves you 1% closer to the man you're becoming?`,
  
  breakthrough_coach: (msg) =>
    `"${msg}" - You're confronting something real here. Every stronghold begins with a lie we've believed. What false narrative has been playing on repeat in your mind about this situation? Let's expose it to truth.`,
  
  bible_study_agent: (msg) =>
    `Regarding "${msg}" - let's examine this systematically. The original Greek/Hebrew context often reveals layers we miss in English. What specific passage are you wrestling with? I can help you dig into the historical context and cross-references.`,
  
  prayer_coach: (msg) =>
    `Your heart is speaking: "${msg}". Prayer is simply being real with the God who already knows. No performance needed. What are you actually feeling toward God about this situation - even if it's anger or disappointment?`,
  
  leadership_mentor: (msg) =>
    `"${msg}" touches on true leadership - which starts with self-leadership. Before you can influence others, you must master yourself. What area of personal integrity needs attention before you can lead others through this?`,
  
  emotional_intelligence_coach: (msg) =>
    `You're expressing "${msg}". Most men never learned to name what they feel. This is courage. Can you identify the specific emotion underneath - is it fear, shame, anger, sadness, or something else? Naming it is the first step to freedom.`,
  
  workflow_meta_agent: (msg) =>
    `Analyzing your situation: "${msg}". Based on this, I recommend starting with the Breakthrough Coach to address root issues, then the Habits Coach for practical implementation. Would you like me to create a personalized 7-day action plan?`,
  
  builder_handoff_agent: (msg) =>
    `Technical requirement identified: "${msg}". Let me translate this into actionable specifications. What's the core problem this feature solves for users? Understanding the 'why' will shape the 'how' we build it.`
};

/**
 * Calls the Supabase edge function `agent-router`.
 * Automatically:
 *  - fetches current user via Supabase Auth (or uses demo user)
 *  - attaches user_id, agent_id, message, context, metadata
 *  - lets the edge function log conversation + memory
 *  - falls back to rich mock responses when Supabase not configured
 */
export async function callAgentRouter(
  payload: AgentRouterRequest,
): Promise<AgentRouterResponse> {
  
  // Check if Supabase is configured and we have an edge function URL
  const isSupabaseConfigured = AGENT_ROUTER_URL && 
    !AGENT_ROUTER_URL.includes('YOUR_') && 
    supabase;

  if (!isSupabaseConfigured) {
    // Use rich mock responses for development
    console.log("Using mock mode - Supabase not configured");
    
    const mockReply = MOCK_RESPONSES[payload.agent_id]?.(payload.message) || 
      "I'm here to help you become the man God created you to be. Share what's on your heart.";
    
    return {
      ok: true,
      agent_id: payload.agent_id,
      reply: mockReply
    };
  }

  try {
    // Try to get authenticated user from Supabase
    let userId = "00000000-0000-0000-0000-000000000001"; // Demo user fallback
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!authError && user) {
      userId = user.id;
    } else {
      console.log("Using demo user - not authenticated");
    }

    const body = {
      user_id: userId,
      agent_id: payload.agent_id,
      message: payload.message,
      context: payload.context ?? {},
      metadata: payload.metadata ?? {},
    };

    const res = await fetch(AGENT_ROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Could add JWT token here if needed for additional security
      },
      body: JSON.stringify(body),
    });

    let json: AgentRouterResponse;
    try {
      json = (await res.json()) as AgentRouterResponse;
    } catch (e) {
      console.error("Failed to parse agent-router response", e);
      throw new Error("Invalid response from agent router");
    }

    if (!res.ok || !json.ok) {
      console.error("Agent router error:", json);
      throw new Error(json.error || "Agent router call failed");
    }

    return json;
    
  } catch (error) {
    console.error("Error calling agent router:", error);
    
    // Fallback to mock response on error
    const mockReply = MOCK_RESPONSES[payload.agent_id]?.(payload.message) || 
      "I'm having trouble connecting right now, but I'm still here. Try sharing again in a moment.";
    
    return {
      ok: true,
      agent_id: payload.agent_id,
      reply: mockReply
    };
  }
}

/**
 * Helper function to get conversation history from edge function
 * This would call a separate endpoint or use Supabase directly
 */
export async function getConversationHistory(agentId: AgentId): Promise<Array<{
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}>> {
  // For now, return empty array - implement when needed
  return [];
}