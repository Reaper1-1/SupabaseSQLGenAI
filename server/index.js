const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { handleAgentChat } = require('./chat');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      timestamp: result.rows[0].now,
      message: 'Better Man Project API is running' 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// User management
app.post('/api/users/create', async (req, res) => {
  const { email, displayName } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO user_profiles (email, display_name) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name RETURNING *',
      [email, displayName || 'Brother']
    );
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by email
app.get('/api/users/:email', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_profiles WHERE email = $1',
      [req.params.email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Daily workflows endpoints
app.get('/api/workflows/:userId/:date', async (req, res) => {
  const { userId, date } = req.params;
  
  try {
    let result = await pool.query(
      'SELECT * FROM daily_workflows WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    
    if (result.rows.length === 0) {
      // Create new workflow for today if doesn't exist
      result = await pool.query(
        'INSERT INTO daily_workflows (user_id, date) VALUES ($1, $2) RETURNING *',
        [userId, date]
      );
    }
    
    res.json({ workflow: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workflows/update', async (req, res) => {
  const { userId, date, updates } = req.body;
  
  try {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 4}`)
      .join(', ');
    
    const values = [userId, date, new Date(), ...Object.values(updates)];
    
    const result = await pool.query(
      `UPDATE daily_workflows 
       SET ${setClause}, updated_at = $3 
       WHERE user_id = $1 AND date = $2 
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json({ workflow: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get progress stats
app.get('/api/progress/stats/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get current streak
    const streakResult = await pool.query(`
      WITH consecutive_days AS (
        SELECT 
          date,
          date - INTERVAL '1 day' * ROW_NUMBER() OVER (ORDER BY date) as group_date
        FROM daily_workflows
        WHERE user_id = $1
          AND (devotional_completed = true 
               OR study_completed = true 
               OR journal_completed = true 
               OR challenge_completed = true)
        ORDER BY date DESC
      )
      SELECT 
        COUNT(*) as current_streak,
        MIN(date) as streak_start,
        MAX(date) as streak_end
      FROM consecutive_days
      GROUP BY group_date
      ORDER BY MAX(date) DESC
      LIMIT 1
    `, [userId]);
    
    // Get total days active
    const totalDaysResult = await pool.query(`
      SELECT COUNT(DISTINCT date) as total_days
      FROM daily_workflows
      WHERE user_id = $1
        AND (devotional_completed = true 
             OR study_completed = true 
             OR journal_completed = true 
             OR challenge_completed = true)
    `, [userId]);
    
    // Get this week's stats
    const weekStatsResult = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE devotional_completed = true) as devotionals_completed,
        COUNT(*) FILTER (WHERE study_completed = true) as studies_completed,
        COUNT(*) FILTER (WHERE journal_completed = true) as journals_completed,
        COUNT(*) FILTER (WHERE challenge_completed = true) as challenges_completed,
        SUM(prayer_minutes) as total_prayer_minutes,
        SUM(verses_read) as total_verses_read
      FROM daily_workflows
      WHERE user_id = $1
        AND date >= CURRENT_DATE - INTERVAL '7 days'
    `, [userId]);
    
    res.json({
      currentStreak: streakResult.rows[0]?.current_streak || 0,
      totalDays: totalDaysResult.rows[0]?.total_days || 0,
      weekStats: weekStatsResult.rows[0] || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Conversation history endpoints
app.get('/api/conversations/:userId/:agentName', async (req, res) => {
  const { userId, agentName } = req.params;
  const limit = parseInt(req.query.limit) || 20;
  
  try {
    const result = await pool.query(
      `SELECT * FROM conversation_history 
       WHERE user_id = $1 AND agent_name = $2 
       ORDER BY created_at DESC 
       LIMIT $3`,
      [userId, agentName, limit]
    );
    
    res.json({ messages: result.rows.reverse() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/conversations/save', async (req, res) => {
  const { userId, agentName, role, content, metadata = {} } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO conversation_history (user_id, agent_name, role, content, metadata) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, agentName, role, content, JSON.stringify(metadata)]
    );
    
    res.json({ message: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Main agent chat endpoint
app.post('/api/agent/chat', handleAgentChat);

// Agent memory endpoints
app.get('/api/memory/:userId/:agentName', async (req, res) => {
  const { userId, agentName } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM agent_memory WHERE user_id = $1 AND agent_name = $2',
      [userId, agentName]
    );
    
    const memory = {};
    result.rows.forEach(row => {
      memory[row.memory_key] = row.memory_value;
    });
    
    res.json({ memory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/memory/update', async (req, res) => {
  const { userId, agentName, memoryKey, memoryValue, metadata = {} } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO agent_memory (user_id, agent_name, memory_key, memory_value, metadata) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (user_id, agent_name, memory_key) 
       DO UPDATE SET memory_value = EXCLUDED.memory_value, 
                     metadata = EXCLUDED.metadata,
                     updated_at = NOW()
       RETURNING *`,
      [userId, agentName, memoryKey, memoryValue, JSON.stringify(metadata)]
    );
    
    res.json({ memory: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Better Man Project API running on port ${PORT}`);
});