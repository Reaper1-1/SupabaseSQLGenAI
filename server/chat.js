const { getAgentResponse } = require('./agents');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Main chat endpoint handler
async function handleAgentChat(req, res) {
  const { userId, agentName, message } = req.body;
  
  if (!userId || !agentName || !message) {
    return res.status(400).json({ 
      error: 'Missing required fields: userId, agentName, message' 
    });
  }
  
  try {
    // Get user's conversation history with this agent
    const historyResult = await pool.query(
      `SELECT role, content FROM conversation_history 
       WHERE user_id = $1 AND agent_name = $2 
       ORDER BY created_at ASC 
       LIMIT 10`,
      [userId, agentName]
    );
    
    const conversationHistory = historyResult.rows;
    
    // Get agent's memory about this user
    const memoryResult = await pool.query(
      `SELECT memory_key, memory_value FROM agent_memory 
       WHERE user_id = $1 AND agent_name = $2`,
      [userId, agentName]
    );
    
    const agentMemory = {};
    memoryResult.rows.forEach(row => {
      agentMemory[row.memory_key] = row.memory_value;
    });
    
    // Get today's progress for context
    const today = new Date().toISOString().split('T')[0];
    const progressResult = await pool.query(
      'SELECT * FROM daily_workflows WHERE user_id = $1 AND date = $2',
      [userId, today]
    );
    
    const userProgress = progressResult.rows[0] || null;
    
    // Save user message to history
    await pool.query(
      `INSERT INTO conversation_history (user_id, agent_name, role, content) 
       VALUES ($1, $2, 'user', $3)`,
      [userId, agentName, message]
    );
    
    // Get agent response
    const { response, suggestedMemoryUpdates } = await getAgentResponse(
      agentName,
      message,
      conversationHistory,
      agentMemory,
      userProgress
    );
    
    // Save agent response to history
    await pool.query(
      `INSERT INTO conversation_history (user_id, agent_name, role, content) 
       VALUES ($1, $2, 'assistant', $3)`,
      [userId, agentName, response]
    );
    
    // Update agent memory if there are suggested updates
    if (suggestedMemoryUpdates && Object.keys(suggestedMemoryUpdates).length > 0) {
      for (const [key, value] of Object.entries(suggestedMemoryUpdates)) {
        await pool.query(
          `INSERT INTO agent_memory (user_id, agent_name, memory_key, memory_value) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (user_id, agent_name, memory_key) 
           DO UPDATE SET memory_value = EXCLUDED.memory_value, updated_at = NOW()`,
          [userId, agentName, key, value]
        );
      }
    }
    
    res.json({
      response,
      memoryUpdated: Object.keys(suggestedMemoryUpdates || {}).length > 0
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { handleAgentChat };