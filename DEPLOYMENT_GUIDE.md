# Better Man Project - Edge Function Deployment Guide

## 🚀 Quick Start

Your Better Man Project is now equipped with a complete Supabase edge function deployment infrastructure!

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Expo Frontend  │────▶│  Supabase Edge Func  │────▶│   Base44    │
│  (React Native) │     │   (agent-router)     │     │  AI Agents  │
└─────────────────┘     └──────────────────────┘     └─────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │  Supabase Tables │
                        │  - agent_memory  │
                        │  - conversation_ │
                        │    history      │
                        └──────────────────┘
```

## 📦 What's Been Created

### 1. **Edge Function** (`supabase/functions/agent-router/`)
- Complete agent-router with all 11 specialized coaches
- Entity mappings and memory patterns
- OpenAI/Base44 integration ready
- Conversation history and memory persistence

### 2. **Deployment Scripts** (`scripts/`)
- `deployAgentRouter.ts` - Deploy your edge function
- `setSecrets.ts` - Manage API keys and secrets
- `buildEdgeFunction.ts` - Build the function bundle
- `testDeployment.ts` - Validate your deployment

### 3. **Management Client** (`lib/supabaseManagement.ts`)
- Full CRUD operations for edge functions
- TypeScript-typed API client
- Error handling and logging

## 🔧 Setup Instructions

### Step 1: Environment Configuration

Add these to your `.env.local`:

```bash
# Supabase Project Details
SUPABASE_PROJECT_REF=your-project-ref          # Find in Supabase dashboard URL
SUPABASE_MANAGEMENT_ACCESS_TOKEN=sbp_xxx...    # Create in Account Settings > Access Tokens
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# API Keys for Edge Function
BASE44_API_KEY=your-base44-key                 # From Base44
OPENAI_API_KEY=sk-xxx...                       # From OpenAI
```

### Step 2: Set Secrets

```bash
# Set all required secrets
npm run set-secrets

# Or set individually
npm run set-secrets -- --secret BASE44_API_KEY=xxx
```

### Step 3: Build & Deploy

```bash
# Build the edge function
npm run build:edge

# Deploy to Supabase
npm run deploy:edge

# Test the deployment
npm run test:edge
```

## 🎯 Your 11 AI Coaches

All agents are configured with masculine-focused prompts and entity mappings:

1. **Devotional Guide** - Scripture depth & discipleship
2. **Journal Coach** - Emotional processing & patterns
3. **Breakup Coach** - Toxic relationship recovery
4. **Habits Coach** - Consistency & accountability
5. **Breakthrough Coach** - Stronghold breaker
6. **Bible Study Agent** - Theological depth
7. **Prayer Coach** - Spiritual warfare
8. **Leadership Mentor** - Servant leadership
9. **Emotional Intelligence** - Healthy masculinity
10. **Workflow Orchestrator** - Meta-guidance
11. **Builder Handoff** - Technical translation

## 🔑 Memory Patterns

Each agent tracks specific memory keys:

```javascript
// Example: Breakup Coach
- relationship_stage: "3 months no contact"
- last_relapse_note: "Checked her Instagram"
- core_wound_theme: "abandonment fear"

// Example: Habits Coach
- habit_streak: "14 days gym"
- last_missed_reason: "work travel"
- primary_focus_habit: "morning routine"
```

## 📊 Database Schema

Your edge function works with:

```sql
-- conversation_history
- user_id, agent_name, role, content
- metadata: { agent_entities: [...] }

-- agent_memory
- user_id, agent_name, memory_key, memory_value
- importance: 0.0 to 1.0
```

## 🚦 Testing Your Deployment

Once deployed, your edge function will be available at:
```
https://[project-ref].supabase.co/functions/v1/agent-router
```

Test with:
```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/agent-router \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"agent_name": "journal_coach", "message": "I feel stuck"}'
```

## 📱 Frontend Integration

The frontend is already configured to use Supabase when credentials are provided:

```javascript
// Automatic detection in lib/api.js
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  // Uses Supabase edge functions
} else {
  // Falls back to mock responses
}
```

## 🎉 Ready to Deploy!

Your infrastructure is production-ready. Just add your credentials and run the deployment scripts. The app will automatically switch from mock mode to live Supabase mode.

## Need Help?

- Check logs: `npm run list-functions`
- View secrets: `npm run list-secrets`
- Test locally: `npm run test:edge`

The Better Man Project is ready to transform men's lives with AI-powered spiritual coaching!