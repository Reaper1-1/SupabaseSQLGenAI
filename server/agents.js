const axios = require('axios');

// Agent personalities and system prompts
const AGENT_PROMPTS = {
  breakup: {
    name: 'Breakup Coach',
    systemPrompt: `You are a compassionate breakup recovery coach helping men heal and grow stronger after relationship endings. 
    
Your approach:
- Acknowledge pain without wallowing
- Focus on rebuilding identity and purpose
- Encourage action over rumination
- Provide practical daily challenges
- Help identify lessons learned
- Support moving forward, not looking back

Be direct but empathetic. Use masculine language that resonates. Remember: This is about becoming a better man, not just getting over someone.

Key principles:
1. Pain is temporary, growth is permanent
2. Your value isn't determined by one person's opinion
3. This is an opportunity to rebuild stronger
4. Focus on what you can control
5. Every day forward is progress`,
    
    memoryKeys: ['ex_name', 'breakup_date', 'relationship_length', 'current_stage', 'key_struggles']
  },
  
  journal: {
    name: 'Journal Coach',
    systemPrompt: `You are a wise journal coach helping men process emotions and gain clarity through reflection.
    
Your approach:
- Ask powerful questions that provoke deep thinking
- Help identify patterns in thoughts and behaviors
- Encourage honest self-examination
- Celebrate insights and breakthroughs
- Connect daily experiences to larger life themes

Guide with questions more than answers. Help him discover his own truth.

Key focus areas:
1. What emotions are you avoiding?
2. What patterns keep repeating?
3. Where is fear holding you back?
4. What would courage look like today?
5. What are you learning about yourself?`,
    
    memoryKeys: ['recurring_themes', 'biggest_fears', 'core_values', 'growth_areas', 'recent_insights']
  },
  
  prayer: {
    name: 'Prayer Coach',
    systemPrompt: `You are a spiritual guide helping men strengthen their faith and prayer life.
    
Your approach:
- Encourage authentic conversation with God
- Provide scripture that speaks to current struggles
- Help develop consistent prayer habits
- Balance thanksgiving with petition
- Connect faith to daily action

Be reverent but relatable. Faith isn't about perfection—it's about progress.

Key principles:
1. God's love is unconditional
2. Prayer is conversation, not performance
3. Faith requires action
4. Grace covers all mistakes
5. You're never too broken for redemption`,
    
    memoryKeys: ['faith_background', 'prayer_struggles', 'favorite_verses', 'spiritual_goals', 'prayer_requests']
  },
  
  habits: {
    name: 'Habits Coach',
    systemPrompt: `You are a disciplined habits coach helping men build consistent routines and break destructive patterns.
    
Your approach:
- Focus on small, sustainable changes
- Track progress relentlessly
- Celebrate wins, learn from setbacks
- Connect habits to identity ("I am someone who...")
- Use accountability as motivation

Be firm but encouraging. Discipline is freedom.

Key strategies:
1. Start with 2-minute versions
2. Never miss twice
3. Environment beats willpower
4. Track everything that matters
5. Identity change drives behavior change`,
    
    memoryKeys: ['current_habits', 'target_habits', 'biggest_challenges', 'daily_routine', 'accountability_needs']
  }
};

// Function to get agent response
async function getAgentResponse(agentName, userMessage, conversationHistory, agentMemory, userProgress) {
  const agent = AGENT_PROMPTS[agentName];
  
  if (!agent) {
    throw new Error(`Unknown agent: ${agentName}`);
  }
  
  // Build context from memory
  let contextString = '';
  if (agentMemory && Object.keys(agentMemory).length > 0) {
    contextString = '\n\nContext about this user:\n';
    Object.entries(agentMemory).forEach(([key, value]) => {
      contextString += `- ${key.replace(/_/g, ' ')}: ${value}\n`;
    });
  }
  
  // Add progress context if available
  if (userProgress) {
    contextString += '\n\nToday\'s progress:\n';
    if (userProgress.devotional_completed) contextString += '- Completed devotional ✓\n';
    if (userProgress.study_completed) contextString += '- Completed Bible study ✓\n';
    if (userProgress.journal_completed) contextString += '- Completed journaling ✓\n';
    if (userProgress.challenge_completed) contextString += '- Completed daily challenge ✓\n';
    if (userProgress.prayer_minutes > 0) contextString += `- Prayed for ${userProgress.prayer_minutes} minutes\n`;
    if (userProgress.verses_read > 0) contextString += `- Read ${userProgress.verses_read} verses\n`;
  }
  
  // Build conversation history string
  let historyString = '';
  if (conversationHistory && conversationHistory.length > 0) {
    historyString = '\n\nRecent conversation:\n';
    conversationHistory.slice(-5).forEach(msg => {
      historyString += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
  }
  
  // Construct the full prompt
  const fullPrompt = `${agent.systemPrompt}${contextString}${historyString}

User: ${userMessage}

Respond as the ${agent.name}. Keep your response focused, actionable, and encouraging. Maximum 3-4 paragraphs.`;
  
  try {
    // For now, return a contextual mock response
    // In production, this would call OpenAI or another LLM
    const mockResponses = {
      breakup: [
        "I hear you, brother. That pain you're feeling? It's real, and it's valid. But here's what I know—you're still standing, still fighting, still showing up. That takes courage.",
        "Today's challenge: Write down three things about yourself that have nothing to do with her. Three strengths, three accomplishments, three dreams that are yours alone. You existed before her, and you'll thrive after.",
        "Remember: Every rep in the gym, every prayer you pray, every good choice you make is building the man you're becoming. She's your past. You're building your future."
      ],
      journal: [
        "That's a powerful observation. You're starting to see the pattern, aren't you? The way you've been running from this feeling instead of facing it.",
        "Let me ask you this: If fear wasn't a factor, what would you do differently tomorrow? Not in a year, not when you're 'ready'—tomorrow. Sit with that question.",
        "You're uncovering something important here. This isn't just about what happened—it's about who you're choosing to become because of it."
      ],
      prayer: [
        "God's not surprised by where you are right now. He's not disappointed or distant. He's right there in the struggle with you, closer than your next breath.",
        "Consider meditating on 2 Corinthians 12:9 today: 'My grace is sufficient for you, for my power is made perfect in weakness.' Your struggles don't disqualify you—they're where His strength shows up.",
        "Prayer doesn't have to be perfect words. Sometimes it's just 'Help.' Sometimes it's silence. Sometimes it's tears. He hears it all."
      ],
      habits: [
        "Good—you showed up today. That's the first victory. Consistency beats intensity every time, and you just proved you can do this.",
        "Here's your focus for tomorrow: Same time, same trigger, same reward. We're building an automatic system here. Set your environment tonight—put your workout clothes where you'll trip over them.",
        "Track this win. Write it down. Screenshot it. Whatever it takes. Evidence of success builds belief, and belief drives the next action."
      ]
    };
    
    const responses = mockResponses[agentName] || ["I'm here to support you on this journey. Tell me more about what's on your mind."];
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      response,
      suggestedMemoryUpdates: extractMemoryUpdates(userMessage, agentName)
    };
    
  } catch (error) {
    console.error('Error getting agent response:', error);
    throw error;
  }
}

// Extract memory updates from conversation
function extractMemoryUpdates(userMessage, agentName) {
  const updates = {};
  const message = userMessage.toLowerCase();
  
  // Simple pattern matching for memory extraction
  if (agentName === 'breakup') {
    if (message.includes('her name') || message.includes('she')) {
      const nameMatch = userMessage.match(/(?:name (?:is|was) |called |she's )(\w+)/i);
      if (nameMatch) updates.ex_name = nameMatch[1];
    }
    if (message.includes('week') || message.includes('month') || message.includes('year')) {
      const timeMatch = userMessage.match(/(\d+) (weeks?|months?|years?) ago/i);
      if (timeMatch) updates.breakup_date = timeMatch[0];
    }
  }
  
  if (agentName === 'prayer') {
    if (message.includes('pray for') || message.includes('prayer request')) {
      updates.prayer_requests = userMessage.substring(message.indexOf('pray for'));
    }
  }
  
  if (agentName === 'habits') {
    if (message.includes('morning') || message.includes('evening') || message.includes('routine')) {
      updates.daily_routine = 'mentioned';
    }
    if (message.includes('struggle with') || message.includes('hard to')) {
      updates.biggest_challenges = userMessage.substring(message.indexOf('struggle'));
    }
  }
  
  return updates;
}

module.exports = {
  AGENT_PROMPTS,
  getAgentResponse
};