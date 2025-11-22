#!/usr/bin/env node
/**
 * Test script for the agent-router edge function
 * Tests both local and deployed versions
 */

import 'dotenv/config';

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_PROJECT_REF || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_PROJECT_REF or EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const EDGE_FUNCTION_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/agent-router`;

interface TestPayload {
  user_id: string;
  agent_id: string;
  message: string;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

async function testHealthCheck() {
  console.log('\n📋 Testing Health Check (GET)...');
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    const data = await response.json();
    console.log('✅ Health check response:', data);
    return response.ok;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}

async function testAgentChat(payload: TestPayload) {
  console.log(`\n💬 Testing Agent Chat with ${payload.agent_id}...`);
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Agent response:', {
        agent_id: data.agent_id,
        reply: data.reply?.substring(0, 100) + '...',
        ok: data.ok,
      });
    } else {
      console.error('❌ Agent chat failed:', data);
    }
    
    return response.ok;
  } catch (error) {
    console.error('❌ Agent chat error:', error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Better Man Project Edge Function');
  console.log('URL:', EDGE_FUNCTION_URL);
  console.log('=' .repeat(50));
  
  const tests = [];
  
  // Test health check
  tests.push(await testHealthCheck());
  
  // Test each agent type
  const testCases: TestPayload[] = [
    {
      user_id: 'test-user-001',
      agent_id: 'devotional_guide',
      message: 'Help me understand Romans 8:28',
      context: { mood: 'curious' },
      metadata: { client: 'test-script' },
    },
    {
      user_id: 'test-user-001',
      agent_id: 'journal_coach',
      message: "I've been feeling stuck lately",
      context: { recent_theme: 'stagnation' },
    },
    {
      user_id: 'test-user-001',
      agent_id: 'breakup_coach',
      message: 'How do I stop checking her social media?',
      context: { relationship_stage: '2 months since breakup' },
    },
    {
      user_id: 'test-user-001',
      agent_id: 'habits_coach',
      message: 'I keep missing my morning workout',
      context: { habit_streak: 0 },
    },
    {
      user_id: 'test-user-001',
      agent_id: 'prayer_coach',
      message: 'I struggle with consistency in prayer',
    },
  ];
  
  for (const testCase of testCases) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    tests.push(await testAgentChat(testCase));
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  const passed = tests.filter(Boolean).length;
  const total = tests.length;
  
  if (passed === total) {
    console.log(`✅ All tests passed! (${passed}/${total})`);
  } else {
    console.log(`⚠️ Some tests failed: ${passed}/${total} passed`);
  }
  
  console.log('\n💡 Next steps:');
  console.log('1. Check Supabase dashboard for conversation_history entries');
  console.log('2. Verify agent_memory table has been updated');
  console.log('3. Configure BASE44_AGENT_API_URL for real AI responses');
}

// Run tests
runTests().catch(console.error);