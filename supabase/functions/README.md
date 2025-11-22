# Supabase Edge Functions - Better Man Project

## Overview
This directory contains the Supabase Edge Functions for the Better Man Project, providing serverless AI agent interactions with memory persistence.

## Structure
```
supabase/functions/
├── README.md          # This file
└── agent-router/      # Main edge function for agent interactions
    └── index.ts       # Function implementation
```

## Agent Router Function

The `agent-router` edge function handles all AI agent interactions for the Better Man Project. It:
- Routes messages to appropriate AI agents (11 specialized coaches)
- Maintains conversation history in database
- Persists agent-specific memory for personalized responses
- Integrates with OpenAI API for intelligent responses

### Available Agents
1. **Devotional Guide** - Scripture study and discipleship
2. **Journal Coach** - Emotional processing and reflection
3. **Breakup Coach** - Recovery from toxic relationships
4. **Habits Coach** - Building consistent routines
5. **Breakthrough Coach** - Confronting internal battles
6. **Bible Study Agent** - Deep biblical analysis
7. **Prayer Coach** - Developing prayer life
8. **Leadership Mentor** - Leadership development
9. **Emotional Intelligence Coach** - Emotional awareness
10. **Workflow Meta Agent** - Orchestrates other agents
11. **Builder Handoff Agent** - Technical translation

## Deployment Instructions

### Prerequisites
1. Set up environment variables in `.env`:
```bash
# Copy the example file
cp .env.example .env

# Fill in these required values:
SUPABASE_MANAGEMENT_ACCESS_TOKEN=<from dashboard/account/tokens>
SUPABASE_PROJECT_REF=<from project URL>
SUPABASE_SERVICE_ROLE_KEY=<from project settings/api>
SUPABASE_DB_URL=<from project settings/database>
BASE44_API_KEY=<your Base44 API key>
OPENAI_API_KEY=<your OpenAI API key>
```

2. Ensure Node.js is installed (v16+)
3. Install dependencies (if not already installed):
```bash
npm install axios dotenv form-data
```

### Deployment Steps

#### 1. Build the Edge Function
```bash
# Build and prepare the function for deployment
node scripts/buildEdgeFunction.ts

# Or with Deno installed for optimal bundling:
deno run -A scripts/buildEdgeFunction.ts
```

#### 2. Deploy to Supabase
```bash
# Deploy the agent-router function
node scripts/deployAgentRouter.ts
```

#### 3. Set Secrets
```bash
# Interactive mode - prompts for each secret
node scripts/setSecrets.ts

# Or bulk update from .env file
node scripts/setSecrets.ts bulk

# List current secrets
node scripts/setSecrets.ts list
```

#### 4. Test the Deployment
```bash
# Run the test script (created during build)
node supabase/functions/agent-router/test.js
```

Or test with curl:
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/agent-router \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "agentName": "devotional_guide",
    "message": "What does it mean to walk in faith?"
  }'
```

## Database Requirements

The edge function requires these database tables (should already exist):

### conversation_history
```sql
CREATE TABLE conversation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  agent_name VARCHAR(100) NOT NULL,
  user_message TEXT NOT NULL,
  agent_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### agent_memory
```sql
CREATE TABLE agent_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  agent_name VARCHAR(100) NOT NULL,
  memory_data JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, agent_name)
);
```

## API Reference

### Request Format
```typescript
{
  userId: string;        // Unique user identifier
  agentName: string;     // One of the agent names (e.g., 'devotional_guide')
  message: string;       // User's message to the agent
  conversationId?: string; // Optional conversation thread ID
}
```

### Response Format
```typescript
{
  response: string;      // Agent's response message
  agentName: string;     // Display name of the agent
  entities: string[];    // Database entities this agent works with
  memoryUpdated: boolean; // Whether agent memory was updated
}
```

### Error Response
```typescript
{
  error: string;         // Error message
  details?: string;      // Additional error details
}
```

## Security

- JWT verification is enabled by default (`verify_jwt: true`)
- Service role key is used for database operations
- All secrets are stored securely via Management API
- CORS is configured for cross-origin requests

## Monitoring

Check function logs in Supabase Dashboard:
1. Go to Functions section
2. Click on `agent-router`
3. View Logs tab for real-time and historical logs

## Troubleshooting

### Function not responding
1. Check if secrets are set: `node scripts/setSecrets.ts list`
2. Verify deployment status in Supabase Dashboard
3. Check function logs for errors

### Database errors
1. Ensure tables exist with correct schema
2. Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
3. Check database connection string format

### OpenAI API errors
1. Verify OPENAI_API_KEY is valid
2. Check OpenAI API quota and limits
3. Review error details in function logs

## Local Development

For local testing without deployment:
1. Use the Express server in `/server` directory
2. Run `npm run dev` for local development
3. Test agents via the mobile app or API client

## Support

For issues or questions:
1. Check function logs in Supabase Dashboard
2. Review error messages from API responses
3. Verify all environment variables are set correctly
4. Ensure database tables exist with correct schema