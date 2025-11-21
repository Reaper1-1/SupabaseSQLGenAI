# Better Man Project - Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - The app integrates with Supabase Auth and includes:
- **Email/Password** sign up and login
- **Apple Sign-In** (iOS requirement for apps with authentication)
- **Google Sign-In** for cross-platform support
- Login screen with clean, minimal design emphasizing spiritual growth
- Profile screen with:
  - User-customizable avatar (generate 3 faith-themed preset avatars with subtle, reverent designs)
  - Display name field
  - Email display (read-only)
- Account management under Settings > Account with:
  - Log out (with confirmation dialog)
  - Delete account (double confirmation: first warning, then final confirmation)
- Privacy policy & terms of service links (placeholder URLs)

### Navigation
**Tab Navigation** (5 tabs with center action):
1. **Home** - Daily progress dashboard and overview
2. **Devotional** - Daily spiritual content and completion tracking
3. **Agents** (Center Tab, Primary Action) - AI coaching chat interface
4. **Progress** - Historical stats, streaks, and insights
5. **Profile** - User settings and account management

### Screen Specifications

#### 1. Home Screen
**Purpose**: Quick daily overview and actionable items for spiritual growth

**Layout**:
- Transparent header with greeting text: "Good morning, [Name]" (dynamic based on time)
- Main content: ScrollView
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- Daily progress card showing completion checkmarks for:
  - Devotional, Study, Journal, Challenge
- Prayer minutes counter (circular progress indicator)
- Verses read counter
- Quick action buttons to incomplete tasks
- Recent agent conversation snippets (2-3 preview cards)

#### 2. Devotional Screen
**Purpose**: Complete daily spiritual practices

**Layout**:
- Default navigation header with title "Daily Devotional"
- Main content: ScrollView with form-like structure
- Safe area: top = Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- Devotional content card (expandable)
- Study completion toggle
- Journal entry text area (auto-save)
- Challenge acceptance checkbox
- Submit button at bottom (inside ScrollView, above safe area)

#### 3. Agents Screen (Primary)
**Purpose**: Engage with AI coaching agents

**Layout**:
- Custom header with agent selector (horizontal scrollable list of agent cards)
- Main content: Chat messages (FlatList, inverted)
- Text input field (fixed at bottom)
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl + 60 (for input)

**Components**:
- Agent cards: "Breakup Coach", "Journal Coach", "Prayer Coach", "Habits Coach"
- Chat bubbles (user messages right-aligned, agent left-aligned)
- Typing indicator when agent is responding
- Text input with send button (Material Design style with rounded corners)

#### 4. Progress Screen
**Purpose**: View historical data and streaks

**Layout**:
- Default header with title "Progress"
- Main content: ScrollView
- Safe area: top = Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- Calendar heatmap showing daily completions
- Streak counter with flame icon
- Weekly/monthly stats cards
- Line charts for prayer minutes and verses read trends
- Personal best badges

#### 5. Profile Screen
**Purpose**: Manage account and app settings

**Layout**:
- Transparent header
- Main content: ScrollView with section list style
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- Avatar picker (modal with 3 preset options)
- Display name field (editable with save button)
- Settings sections:
  - Notifications preferences
  - Theme (Light/Dark/Auto)
  - Account (nested screen with logout/delete)
  - Privacy policy & terms links

#### Modal Screens
**Agent Selection Modal**: Full screen modal for choosing which agent to chat with (alternative to header selector if screen space is limited)

**Calendar Detail**: Tap on calendar heatmap to see detailed breakdown of a specific day

## Design System

### Color Palette
**Primary Theme: Serene & Grounded**
- Primary: Deep Navy Blue (#1A365D) - Represents stability and trust
- Secondary: Warm Gold (#D4A574) - Spiritual growth and achievement
- Accent: Soft Teal (#4A9B9B) - Peace and reflection
- Background Light: Off-White (#F7F7F7)
- Background Dark: Charcoal (#1F1F1F)
- Text Primary: Dark Gray (#2D3748)
- Text Secondary: Medium Gray (#718096)
- Success: Olive Green (#6B8E23)
- Warning: Amber (#F59E0B)
- Error: Muted Red (#DC2626)

### Typography
- **Headings**: SF Pro Display (iOS) / Roboto (Android), Bold, 24-32px
- **Body**: SF Pro Text (iOS) / Roboto (Android), Regular, 16px
- **Captions**: SF Pro Text (iOS) / Roboto (Android), Regular, 14px
- **Button Text**: SF Pro Text (iOS) / Roboto (Android), Semibold, 16px

### Visual Design
- **Icons**: Feather icons from @expo/vector-icons
  - No emojis, use icons for all navigation and actions
  - Home: home, Devotional: book-open, Agents: message-circle, Progress: trending-up, Profile: user
- **Cards**: Rounded corners (12px), subtle elevation
- **Buttons**: 
  - Primary: Filled with Primary color, white text, rounded 8px
  - Secondary: Outline style with Primary border, rounded 8px
  - All buttons have press feedback (slight scale down to 0.96)
- **Floating Action Button** (if using 4-tab alternative):
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2
  - Positioned center-bottom, overlapping tab bar
- **Progress Indicators**: Circular progress rings with Primary color fill
- **Chat Bubbles**: 
  - User messages: Primary color background, white text, right-aligned
  - Agent messages: Light gray background, dark text, left-aligned
  - Max width: 80% of screen
  - Rounded corners: 16px with tail on appropriate side

### Critical Assets
1. **Faith-Themed Avatars** (3 variations):
   - Abstract geometric pattern with soft gradients (blues and golds)
   - Minimalist mountain silhouette (representing spiritual journey)
   - Sunrise/light rays design (representing enlightenment)
2. **Agent Icons** (4 unique):
   - Breakup Coach: Heart with gentle crack line
   - Journal Coach: Pen and paper silhouette
   - Prayer Coach: Hands in prayer position
   - Habits Coach: Checkmark with circular arrow
3. **Achievement Badges** (5 types):
   - 7-day streak, 30-day streak, 100-day streak
   - First devotional completion
   - First agent conversation

### Accessibility
- Minimum touch target: 44x44px
- Color contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Dynamic type support (iOS) for user font size preferences
- Screen reader labels for all interactive elements
- Haptic feedback for important actions (completion checkmarks, streak milestones)
- Dark mode support with inverted color palette

### Interaction Design
- Pull-to-refresh on Home, Devotional, and Progress screens
- Smooth transitions between tabs (fade + slight scale)
- Loading states: Skeleton screens for initial data load, spinners for actions
- Success animations: Subtle confetti or checkmark animation when completing daily tasks
- Empty states: Encouraging messages with illustrations for first-time users
- Swipe gestures: Swipe left on agent chat to see conversation history drawer