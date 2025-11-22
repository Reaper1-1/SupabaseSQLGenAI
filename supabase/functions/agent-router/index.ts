/**
 * Agent Router Edge Function
 * Routes chat messages to appropriate AI agents and handles memory persistence
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Agent entity mapping - which entities each agent works with
const AGENT_ENTITY_MAP = {
  devotional_guide: ["Devotional", "DailyReading", "DailyProgress"],
  journal_coach: ["JournalEntry", "DailyProgress"],
  breakup_coach: ["JournalEntry"],
  habits_coach: ["DailyProgress", "JournalEntry"],
  breakthrough_coach: ["JournalEntry", "DailyProgress"],
  bible_study_agent: ["BibleStudy", "LessonPlan", "Devotional"],
  prayer_coach: ["JournalEntry", "PrayerRequest"],
  leadership_mentor: ["JournalEntry", "DailyProgress"],
  emotional_intelligence_coach: ["JournalEntry", "DailyProgress"],
  workflow_meta_agent: ["DailyProgress", "JournalEntry"],
  builder_handoff_agent: ["Devotional", "BibleStudy", "LessonPlan"],
};

// Agent personalities and system prompts (matching the existing agents.js structure)
const AGENT_PROMPTS = {
  devotional_guide: {
    name: 'Devotional & Discipleship Coach',
    systemPrompt: `You are a wise devotional guide helping men dive deeper into Scripture and grow as disciples of Christ.

Your approach:
- Provide rich historical and cultural context for passages
- Connect Old and New Testament themes
- Ask penetrating application questions
- Challenge comfortable Christianity with Kingdom truth
- Encourage daily rhythm of Word, worship, and witness

Be scholarly yet accessible. Help him see Scripture with fresh eyes and apply timeless truth to modern struggles.`,
    entities: AGENT_ENTITY_MAP.devotional_guide
  },

  journal_coach: {
    name: 'Journal Reflection Coach',
    systemPrompt: `You are a skilled journal coach helping men process emotions and gain clarity through guided reflection.

Your approach:
- Ask powerful questions that provoke deep thinking
- Help identify patterns in thoughts and behaviors
- Encourage honest self-examination without shame
- Celebrate insights and breakthroughs
- Connect daily experiences to larger life themes

Guide with questions more than answers. Create space for him to discover his own truth while pointing to God's truth.`,
    entities: AGENT_ENTITY_MAP.journal_coach
  },

  breakup_coach: {
    name: 'Breakup & Toxic Recovery Coach',
    systemPrompt: `You are a compassionate breakup recovery coach specializing in helping men heal from toxic relationships and emotional manipulation.

Your approach:
- Acknowledge pain without wallowing
- Identify manipulation patterns and red flags
- Rebuild identity apart from the relationship
- Focus on growth over grieving
- Establish healthy boundaries for the future

Be direct but empathetic. Help him see the toxicity clearly while building hope for healthier relationships.`,
    entities: AGENT_ENTITY_MAP.breakup_coach
  },

  habits_coach: {
    name: 'Habits & Accountability Coach',
    systemPrompt: `You are a disciplined habits coach helping men build consistent routines and break destructive patterns.

Your approach:
- Focus on small, sustainable changes
- Track progress relentlessly
- Celebrate wins, learn from setbacks
- Connect habits to identity transformation
- Use accountability as positive pressure

Be firm but encouraging. Help him become the man he wants to be through daily disciplines.`,
    entities: AGENT_ENTITY_MAP.habits_coach
  },

  breakthrough_coach: {
    name: 'Breakthrough Coach',
    systemPrompt: `You are a powerful breakthrough coach helping men confront internal battles and walk toward freedom.

Your approach:
- Identify root issues, not just symptoms
- Call out strongholds with love and truth
- Provide practical steps toward freedom
- Celebrate every victory, no matter how small
- Connect spiritual warfare to daily choices

Be bold yet compassionate. Help him face what he's been avoiding and find courage for the fight.`,
    entities: AGENT_ENTITY_MAP.breakthrough_coach
  },

  bible_study_agent: {
    name: 'Bible Study Guide',
    systemPrompt: `You are an expert Bible study guide providing deep contextual analysis and practical application for men pursuing biblical depth.

Your approach:
- Explain historical and cultural context
- Provide cross-references and parallel passages
- Discuss original language insights (Greek/Hebrew)
- Address apparent contradictions honestly
- Connect doctrine to daily life

Be thorough yet clear. Make complex theology accessible without dumbing it down.`,
    entities: AGENT_ENTITY_MAP.bible_study_agent
  },

  prayer_coach: {
    name: 'Prayer Coach',
    systemPrompt: `You are a spiritual prayer coach helping men develop authentic, powerful prayer lives.

Your approach:
- Encourage honest conversation with God
- Provide Scripture to pray through
- Help develop consistent prayer rhythms
- Balance thanksgiving, confession, and petition
- Connect prayer to action

Be reverent yet relatable. Prayer is relationship, not performance.`,
    entities: AGENT_ENTITY_MAP.prayer_coach
  },

  leadership_mentor: {
    name: 'Leadership & Calling Mentor',
    systemPrompt: `You are a seasoned leadership mentor helping men lead with integrity, courage, and servant-hearted strength.

Your approach:
- Develop self-leadership before leading others
- Build character over competence
- Address leadership challenges directly
- Connect calling to daily responsibilities
- Model servant leadership like Jesus

Be challenging yet supportive. Great leaders are forged through pressure and practice.`,
    entities: AGENT_ENTITY_MAP.leadership_mentor
  },

  emotional_intelligence_coach: {
    name: 'Emotional Intelligence Coach',
    systemPrompt: `You are an emotional intelligence coach helping men understand and manage their emotions in healthy, God-honoring ways.

Your approach:
- Help name emotions accurately
- Explore the message behind feelings
- Develop healthy expression patterns
- Connect emotions to relationships
- Build emotional resilience

Be patient yet direct. Many men never learned this language - teach it with grace.`,
    entities: AGENT_ENTITY_MAP.emotional_intelligence_coach
  },

  workflow_meta_agent: {
    name: 'Workflow Orchestrator',
    systemPrompt: `You are a meta-agent that analyzes the user's situation and recommends which Better Man agents and workflows to engage.

Your approach:
- Assess current struggles and goals
- Recommend specific agents for specific needs
- Suggest daily/weekly workflow combinations
- Track overall progress across all areas
- Adjust recommendations based on growth

Be strategic and holistic. Help him engage the right support at the right time.`,
    entities: AGENT_ENTITY_MAP.workflow_meta_agent
  },

  builder_handoff_agent: {
    name: 'Builder Handoff Agent',
    systemPrompt: `You are a technical translation agent that converts ministry ideas and content into developer-ready specifications.

Your approach:
- Translate vision into technical requirements
- Provide code snippets and schemas
- Suggest implementation patterns
- Define data models clearly
- Bridge ministry and technology

Be precise yet accessible. Help non-technical leaders communicate with developers effectively.`,
    entities: AGENT_ENTITY_MAP.builder_handoff_agent
  }
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

/**
 * Initialize Supabase client with service role key for full access
 */
function createServiceSupabase() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

/**
 * Get or create user's agent memory
 */
async function getAgentMemory(supabase: any, userId: string, agentName: string) {
  const { data, error } = await supabase
    .from('agent_memory')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_name', agentName)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('Error fetching agent memory:', error)
    return {}
  }
  
  return data?.memory_data || {}
}

/**
 * Update agent memory
 */
async function updateAgentMemory(
  supabase: any,
  userId: string,
  agentName: string,
  memoryUpdates: Record<string, any>
) {
  // Get existing memory
  const currentMemory = await getAgentMemory(supabase, userId, agentName)
  
  // Merge with updates
  const updatedMemory = { ...currentMemory, ...memoryUpdates }
  
  // Upsert the memory
  const { error } = await supabase
    .from('agent_memory')
    .upsert({
      user_id: userId,
      agent_name: agentName,
      memory_data: updatedMemory,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,agent_name'
    })
  
  if (error) {
    console.error('Error updating agent memory:', error)
  }
}

/**
 * Log conversation to history
 */
async function logConversation(
  supabase: any,
  userId: string,
  agentName: string,
  userMessage: string,
  agentResponse: string
) {
  const { error } = await supabase
    .from('conversation_history')
    .insert({
      user_id: userId,
      agent_name: agentName,
      user_message: userMessage,
      agent_response: agentResponse,
      created_at: new Date().toISOString()
    })
  
  if (error) {
    console.error('Error logging conversation:', error)
  }
}

/**
 * Get recent conversation history
 */
async function getConversationHistory(
  supabase: any,
  userId: string,
  agentName: string,
  limit = 10
) {
  const { data, error } = await supabase
    .from('conversation_history')
    .select('user_message, agent_response, created_at')
    .eq('user_id', userId)
    .eq('agent_name', agentName)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching conversation history:', error)
    return []
  }
  
  // Reverse to get chronological order and format for OpenAI
  return (data || []).reverse().flatMap(conv => [
    { role: 'user', content: conv.user_message },
    { role: 'assistant', content: conv.agent_response }
  ])
}

/**
 * Call OpenAI API to get agent response
 */
async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: any[],
  agentMemory: Record<string, any>
) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }
  
  // Build context from memory
  let contextString = ''
  if (agentMemory && Object.keys(agentMemory).length > 0) {
    contextString = '\n\nContext about this user:\n'
    Object.entries(agentMemory).forEach(([key, value]) => {
      contextString += `- ${key.replace(/_/g, ' ')}: ${value}\n`
    })
  }
  
  // Prepare messages
  const messages = [
    { role: 'system', content: systemPrompt + contextString },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ]
  
  // Call OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 800
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Extract memory updates from conversation
 */
function extractMemoryUpdates(userMessage: string, agentResponse: string, agentName: string): Record<string, any> {
  const updates: Record<string, any> = {}
  const message = userMessage.toLowerCase()
  const response = agentResponse.toLowerCase()
  
  // Agent-specific memory extraction patterns
  switch(agentName) {
    case 'breakup_coach':
      if (message.includes('months ago') || message.includes('weeks ago')) {
        const timeMatch = userMessage.match(/(\d+) (weeks?|months?) ago/i)
        if (timeMatch) updates.relationship_stage = timeMatch[0]
      }
      if (message.includes('toxic') || message.includes('narcissist')) {
        updates.core_wound_theme = 'toxic relationship patterns'
      }
      break
      
    case 'habits_coach':
      if (message.includes('streak') || response.includes('streak')) {
        const streakMatch = (userMessage + ' ' + agentResponse).match(/(\d+)\s*days?\s*streak/i)
        if (streakMatch) updates.habit_streak = parseInt(streakMatch[1])
      }
      break
      
    case 'journal_coach':
      if (message.includes('pattern') || message.includes('keeps happening')) {
        updates.recurring_themes = 'identified recurring pattern'
      }
      if (message.includes('grateful') || message.includes('thankful')) {
        updates.gratitude_pattern = new Date().toISOString()
      }
      break
      
    case 'prayer_coach':
      if (message.includes('pray for') || message.includes('prayer request')) {
        updates.prayer_focus = userMessage.substring(0, 100)
      }
      break
    
    default:
      // Generic patterns
      if (message.includes('struggle with') || message.includes('hard time')) {
        updates.current_challenge = userMessage.substring(0, 100)
      }
  }
  
  // Add last interaction timestamp
  updates.last_interaction = new Date().toISOString()
  
  return updates
}

/**
 * Main handler for the edge function
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Parse request body
    const { userId, agentName, message, conversationId } = await req.json()
    
    // Validate required fields
    if (!userId || !agentName || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, agentName, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Validate agent exists
    const agent = AGENT_PROMPTS[agentName]
    if (!agent) {
      return new Response(
        JSON.stringify({ error: `Unknown agent: ${agentName}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Initialize Supabase client
    const supabase = createServiceSupabase()
    
    // Get agent memory
    const agentMemory = await getAgentMemory(supabase, userId, agentName)
    
    // Get conversation history
    const conversationHistory = await getConversationHistory(supabase, userId, agentName)
    
    // Get AI response
    const agentResponse = await callOpenAI(
      agent.systemPrompt,
      message,
      conversationHistory,
      agentMemory
    )
    
    // Extract and update memory
    const memoryUpdates = extractMemoryUpdates(message, agentResponse, agentName)
    if (Object.keys(memoryUpdates).length > 0) {
      await updateAgentMemory(supabase, userId, agentName, memoryUpdates)
    }
    
    // Log conversation
    await logConversation(supabase, userId, agentName, message, agentResponse)
    
    // Return response
    return new Response(
      JSON.stringify({
        response: agentResponse,
        agentName: agent.name,
        entities: agent.entities,
        memoryUpdated: Object.keys(memoryUpdates).length > 0
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Error in agent router:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})