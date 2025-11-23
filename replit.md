# Better Man Project

## Overview

The Better Man Project is a mobile-first spiritual growth and personal development application built with React Native and Expo. It provides daily devotional content, AI-powered coaching agents, progress tracking, and habit formation tools specifically designed for men seeking spiritual and personal transformation. The app emphasizes faith-based guidance, emotional processing, and practical habit development through an intuitive tab-based interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native 0.81.5 with Expo SDK 54
- **React Version**: 19.1.0 (using experimental React Compiler)
- **Build Tool**: Expo with new architecture enabled
- **State Management**: React hooks and local component state
- **Styling**: StyleSheet API with custom theme system

**Navigation Structure**: Bottom tab navigation (5 tabs) with nested stack navigators
- **Home Tab**: Daily progress dashboard with quick actions
- **Devotional Tab**: Daily spiritual content and completion tracking
- **Agents Tab** (Center/Primary): AI coaching chat interface with multiple specialized agents
- **Progress Tab**: Historical statistics, streaks, and insights visualization
- **Profile Tab**: User settings and account management

**Design System**:
- Custom theming with light/dark mode support via `useTheme` hook
- Elevation-based background colors (0-3 levels for depth perception)
- Consistent spacing scale (xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32)
- Typography system (h1-h4, body, small, link variants)
- Faith-themed color palette (primary: navy #1A365D, secondary: gold #D4A574, accent: teal #4A9B9B)
- Platform-specific optimizations (iOS blur effects, Android edge-to-edge)

**Key UI Components**:
- `AgentCard`: Selectable cards for different AI coaching agents
- `ChatBubble`: Message display with user/agent differentiation
- `ChecklistItem`: Daily task completion tracking
- `ProgressRing`: Circular progress indicators
- `StatCard`: Metric display cards
- `Button`: Animated pressable with spring physics
- `ErrorBoundary`: App-wide error handling with fallback UI

**Screen Layouts**: All screens use custom wrapper components that handle safe areas, keyboard avoidance, and consistent spacing:
- `ScreenScrollView`: Standard scrollable content
- `ScreenKeyboardAwareScrollView`: Input-focused screens with keyboard handling
- `ScreenFlatList`: List-based content with proper insets

**Path Aliasing**: Uses `@/` prefix via Babel module resolver for cleaner imports

**Animation**: React Native Reanimated 4.1.1 for performant native-driven animations with spring physics configurations

**Gesture Handling**: React Native Gesture Handler 2.28.0 for native touch interactions

### Backend Architecture

**API Server**: Express 5.1.0 REST API with CORS enabled
- **Port**: 3001 (configurable via environment)
- **Database Client**: node-postgres (pg) 8.16.3
- **Environment Management**: dotenv for configuration

**API Structure**:
- `/api/health`: Health check endpoint with database connectivity verification
- `/api/users/*`: User profile management (create, retrieve, update)
- `/api/workflow/*`: Daily task completion tracking
- `/api/progress/*`: Statistics and streak calculation
- `/api/agents/chat`: AI agent conversation handling
- `/api/conversation/*`: Chat history retrieval

**Agent System**: Four specialized AI coaching agents with distinct personalities and system prompts:
1. **Breakup Coach**: Relationship recovery and emotional healing
2. **Journal Coach**: Deep reflection and pattern recognition through guided questions
3. **Prayer Coach**: Spiritual guidance and prayer support
4. **Habits Coach**: Behavior change and consistency building

Each agent maintains:
- Conversation history (last 10 messages for context)
- Persistent memory (key-value storage for user-specific insights)
- Context awareness (daily progress integration)

**Demo Mode**: Includes hardcoded demo user for development/testing without full authentication

### Data Architecture

**Database**: PostgreSQL (expected via environment variable `DATABASE_URL`)

**Schema Design** (from attached SQL):

1. **user_profiles**
   - Primary key: `id` (UUID, references auth.users)
   - Fields: email (unique), display_name, avatar_url
   - Timestamps: created_at, updated_at (auto-updating)
   - RLS Policy: Users can only view their own profile

2. **daily_workflows**
   - Tracks daily completion status for spiritual practices
   - Fields: devotional_completed, study_completed, journal_completed, challenge_completed
   - Metrics: prayer_minutes, verses_read
   - Composite key: (user_id, date)

3. **conversation_history**
   - Stores chat messages between users and AI agents
   - Fields: role (user/assistant), content, agent_name
   - Indexed by user_id and agent_name for fast retrieval
   - Ordered by created_at for chronological display

4. **agent_memory**
   - Key-value storage for agent-specific user insights
   - Fields: memory_key, memory_value, agent_name
   - Enables personalized coaching based on past interactions
   - Composite unique constraint: (user_id, agent_name, memory_key)

**Row-Level Security**: Enabled on all tables with policies ensuring users can only access their own data

**Automatic Timestamps**: Uses `moddatetime` trigger for updated_at fields

### External Dependencies

**Authentication**: Designed for Supabase Auth integration (not yet implemented)
- Planned OAuth providers: Apple Sign-In (iOS requirement), Google Sign-In
- Email/password authentication
- User management linked to auth.users table via UUID foreign key

**AI Service**: Base44 AI Integration (via Supabase Edge Functions)
- Edge function URL configured via EXPO_PUBLIC_AGENT_ROUTER_URL
- TypeScript client with full type safety (`lib/agentRouterClient.ts`)
- Agent responses generated with conversation history (last 5 messages) and memory context
- System prompts define agent personalities and coaching approaches
- Automatic fallback to rich mock responses when not configured
- Smart mode detection: Live mode with Supabase, Mock mode for development

**Deployment**: Replit-optimized configuration
- Environment variables: REPLIT_DEV_DOMAIN, REPLIT_INTERNAL_APP_DOMAIN
- Custom Expo packager proxy settings for Replit hosting
- Static web build capability with QR code landing page

**Third-Party Services**:
- Expo services: Splash screen, web browser, linking, haptics, font loading
- Platform-specific: expo-blur (iOS), expo-glass-effect (iOS 18+)
- Development tools: axios for HTTP requests

**Platform Support**:
- iOS: Full support with native tab navigator option (iOS 18+)
- Android: Full support with edge-to-edge display
- Web: Partial support (fallbacks for keyboard handling and blur effects)

**Privacy & Legal**: Placeholder privacy policy and terms of service links required before production deployment