# Worknoon Chat Frontend - Implementation Plan

## Overview
Real-time chat frontend for the Worknoon eCommerce platform. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Socket.IO client.

## Tech Stack
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling (utility-first) |
| **Socket.IO Client** | Real-time messaging |
| **Axios** | HTTP client for API calls |
| **React Context** | State management (Auth, Theme, Socket) |
| **React Hook Form** | Form handling + validation |
| **React Hot Toast** | Toast notifications |
| **Framer Motion** | Animations |

## Design System
- **Color Palette**: Clean blues + whites (inspired by Dribbble)
- **Dark Mode**: CSS variables toggle via ThemeContext
- **Typography**: Inter font (Google Fonts)
- **Responsive**: Mobile-first, sidebar collapses on mobile
- **Accessibility**: ARIA labels, keyboard navigation, focus management

---

## Page Structure

```
/                          → Redirect to /inbox or /login based on auth
├── /login                 → Login form
├── /signup                → Registration form
├── /inbox                 → Main chat (conversation list + active chat)
│   └── /inbox/[id]        → Specific conversation
├── /profile               → User profile settings
└── /admin                 → Admin dashboard (role-based)
    ├── /admin/users       → User management
    ├── /admin/conversations → All conversations
    └── /admin/analytics   → Chat analytics
```

---

## Project Structure

```
worknoon-chat-frontend/
├── public/
│   ├── favicon.ico
│   └── images/
│       ├── logo.svg
│       └── avatar-placeholder.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout (providers, fonts)
│   │   ├── page.tsx                  # Landing redirect
│   │   ├── globals.css               # Tailwind + custom styles
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx            # Auth layout (centered card)
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login page
│   │   │   └── signup/
│   │   │       └── page.tsx          # Signup page
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Dashboard layout (sidebar + header)
│   │   │   ├── inbox/
│   │   │   │   ├── page.tsx          # Inbox (conversation list)
│   │   │   │   └── [conversationId]/
│   │   │   │       └── page.tsx      # Specific conversation
│   │   │   └── profile/
│   │   │       └── page.tsx          # Profile settings
│   │   │
│   │   └── admin/
│   │       ├── layout.tsx            # Admin layout
│   │       ├── dashboard/
│   │       │   └── page.tsx          # Admin dashboard
│   │       ├── users/
│   │       │   └── page.tsx          # User management
│   │       └── conversations/
│   │           └── page.tsx          # All conversations
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx         # Login form with validation
│   │   │   ├── SignupForm.tsx        # Registration form
│   │   │   └── AuthGuard.tsx         # Route protection wrapper
│   │   │
│   │   ├── chat/
│   │   │   ├── ConversationList.tsx  # Sidebar conversation list
│   │   │   ├── ConversationItem.tsx  # Single conversation row
│   │   │   ├── ChatWindow.tsx        # Main chat area
│   │   │   ├── ChatHeader.tsx        # Conversation header with user info
│   │   │   ├── MessageBubble.tsx     # Individual message
│   │   │   ├── MessageInput.tsx      # Message compose area
│   │   │   ├── TypingIndicator.tsx   # "User is typing..." animation
│   │   │   ├── OnlineStatus.tsx      # Green/gray dot indicator
│   │   │   ├── EmptyState.tsx        # No conversation selected
│   │   │   └── FileAttachment.tsx    # File preview component
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Main navigation sidebar
│   │   │   ├── Header.tsx            # Top header bar
│   │   │   ├── MobileNav.tsx         # Mobile bottom navigation
│   │   │   └── Layout.tsx            # Dashboard layout wrapper
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx            # Reusable button component
│   │   │   ├── Input.tsx             # Form input with label/error
│   │   │   ├── Avatar.tsx            # User avatar with online status
│   │   │   ├── Modal.tsx             # Reusable modal
│   │   │   ├── Badge.tsx             # Unread count badge
│   │   │   ├── Skeleton.tsx          # Loading skeleton
│   │   │   ├── Dropdown.tsx          # Dropdown menu
│   │   │   └── ThemeToggle.tsx       # Dark/light mode toggle
│   │   │
│   │   └── admin/
│   │       ├── UserTable.tsx         # Users data table
│   │       ├── ConversationTable.tsx # Conversations data table
│   │       └── StatCard.tsx          # Analytics stat card
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx           # Auth state + JWT management
│   │   ├── ThemeContext.tsx          # Dark/light mode
│   │   └── SocketContext.tsx         # Socket.IO connection management
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               # Auth helper hook
│   │   ├── useSocket.ts             # Socket connection hook
│   │   ├── useConversations.ts      # Conversations CRUD hook
│   │   ├── useMessages.ts           # Messages CRUD hook
│   │   └── useOnlineStatus.ts       # Online/offline detection
│   │
│   ├── services/
│   │   ├── api.ts                   # Axios instance with interceptors
│   │   └── socket.ts                # Socket.IO client setup
│   │
│   ├── types/
│   │   ├── auth.ts                  # User, LoginPayload, RegisterPayload
│   │   ├── chat.ts                  # Conversation, Message, Participant
│   │   └── common.ts               # API response types
│   │
│   └── utils/
│       ├── helpers.ts               # Format date, truncate, etc.
│       ├── constants.ts             # API URLs, config constants
│       └── validators.ts            # Form validation rules
│
├── tailwind.config.ts               # Tailwind theme configuration
├── tsconfig.json
├── next.config.js
├── package.json
├── postcss.config.js
├── .env.local                       # Environment variables
└── README.md
```

---

## Implementation Phases

### Phase 1: Foundation & Auth (Day 1)
```javascript
Tasks:
├── Initialize Next.js 14 project with TypeScript + Tailwind
├── Configure Tailwind theme (colors, fonts, dark mode)
├── Create global CSS with CSS custom properties for theming
├── Set up environment variables (.env.local)
├── Build types (auth.ts, chat.ts, common.ts)
├── Create API service (Axios instance with JWT interceptor)
├── Build AuthContext
│   ├── login/logout functions
│   ├── JWT storage (localStorage)
│   ├── Auto-refresh token mechanism
│   └── isAuthenticated state
├── Build UI components (Button, Input, Avatar, Modal)
├── Build theme toggle (ThemeContext + ThemeToggle)
├── Create auth pages
│   ├── LoginForm + /login page
│   └── SignupForm + /signup page
├── Build AuthGuard component
└── Implement (auth) layout with centered card design
```

### Phase 2: Dashboard Layout (Day 1-2)
```javascript
Tasks:
├── Build Sidebar component
│   ├── Navigation links (Inbox, Profile, Admin)
│   ├── User info section (avatar, name, role badge)
│   ├── Collapsible on mobile
│   └── Active route highlighting
├── Build Header component
│   ├── Search bar (optional)
│   ├── Notifications bell + badge
│   ├── Theme toggle button
│   └── User dropdown menu
├── Create (dashboard) layout
│   ├── Sidebar + Header + main content area
│   └── Mobile responsive (sidebar → hamburger menu)
├── Create admin layout
│   └── Same as dashboard but with admin nav items
└── Loading skeletons for all pages
```

### Phase 3: Socket.IO Integration (Day 2)
```javascript
Tasks:
├── Build SocketContext
│   ├── Connect to Socket.IO server with JWT auth
│   ├── Auto-reconnect with exponential backoff
│   ├── Track connection state (connected/disconnected/reconnecting)
│   ├── Handle "connect_error" events
│   └── Clean up on unmount
├── Build useSocket hook
│   ├── Join/leave conversation rooms
│   ├── Listen for incoming messages
│   ├── Typing indicator events
│   └── Online status updates
├── Build socket service
│   ├── Socket.IO client configuration
│   ├── Event listeners setup
│   └── Reconnection strategy
└── Offline fallback
    ├── Detect online/offline status
    └── Queue messages when offline
```

### Phase 4: Chat Interface (Day 2-3)
```javascript
Tasks:
├── Build ConversationList
│   ├── Fetch conversations from API
│   ├── Real-time update via Socket.IO
│   ├── Search/filter conversations
│   ├── Unread badge counts
│   ├── Show last message preview
│   └── Online status dots
├── Build ChatWindow
│   ├── Display messages with sender info
│   ├── Auto-scroll to bottom on new messages
│   ├── Load more on scroll to top (pagination)
│   ├── Date separators between messages
│   └── Scroll to bottom button
├── Build MessageBubble
│   ├── Different styles for sent/received
│   ├── Timestamp display
│   ├── Read status indicator (✓✓)
│   ├── File attachment preview
│   └── User avatar + name
├── Build MessageInput
│   ├── Text area with auto-resize
│   ├── Send on Enter / Shift+Enter for newline
│   ├── File upload button
│   ├── Emoji picker (optional)
│   └── Character limit indicator
├── Build TypingIndicator
│   ├── Animated dots
│   └── Show user name
├── Build OnlineStatus
│   ├── Green dot for online
│   └── Last seen time for offline
└── Build EmptyState
    └── "Select a conversation" placeholder
```

### Phase 5: Inbox Page (Day 3)
```javascript
Tasks:
├── Create /inbox page
│   ├── Desktop: Split view (sidebar + chat)
│   ├── Mobile: List view → tap → chat view
│   ├── Conversation list on left (35% width)
│   └── Active chat on right (65% width)
├── Create /inbox/[conversationId] page
│   ├── Load specific conversation
│   ├── Mark messages as read on view
│   └── Scroll to last unread message
├── Real-time message updates
│   ├── New message appears instantly
│   ├── Conversation moves to top on new message
│   └── Unread count updates live
└── Handling edge cases
    ├── Empty conversation
    ├── Network error handling
    └── Reconnect + sync missed messages
```

### Phase 6: Profile & Admin (Day 3-4)
```javascript
Tasks:
├── Profile page
│   ├── Edit profile (name, phone, avatar)
│   ├── Change password
│   ├── Notification preferences
│   ├── Theme preference (light/dark)
│   └── Delete account (admin only)
├── Admin Dashboard
│   ├── Overview stats (total users, conversations, messages)
│   ├── Recent activity feed
│   └── Charts (optional)
├── Admin Users page
│   ├── Data table with search/filter
│   ├── Pagination
│   ├── Create/edit/delete users
│   └── Role management
├── Admin Conversations page
│   ├── All conversations table
│   ├── Filter by status/type
│   └── Close/archive conversations
└── Admin Analytics page
    ├── Messages per day chart
    ├── User growth chart
    └── Response time metrics
```

### Phase 7: Polish & Responsive (Day 4)
```javascript
Tasks:
├── Mobile responsiveness
│   ├── Hamburger menu for sidebar
│   ├── Bottom navigation for mobile
│   ├── Touch-friendly tap targets
│   └── Swipeable conversations list
├── Dark mode
│   ├── CSS custom properties for both themes
│   ├── Smooth transition on toggle
│   └── Persist preference in localStorage
├── Animations (Framer Motion)
│   ├── Page transitions
│   ├── Message bubble entrance animation
│   ├── Typing indicator animation
│   ├── Sidebar slide in/out
│   └── Toast notifications
├── Accessibility
│   ├── ARIA labels on all interactive elements
│   ├── Keyboard navigation (Tab, Enter, Escape)
│   ├── Focus management for modals
│   ├── Screen reader friendly
│   └── Color contrast compliance
└── Error handling & edge cases
    ├── Loading states with skeleton screens
    ├── Error boundaries
    ├── Empty states with illustrations
    ├── Toast notifications for errors
    └── Retry logic for failed requests
```

---

## Component Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Root Layout (Providers)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ AuthContext  │  │ ThemeContext│  │SocketContext │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                       │
│  ┌──────┴────────────────┴────────────────┴────────┐             │
│  │              (dashboard)/layout.tsx               │             │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │             │
│  │  │ Sidebar │  │  Header  │  │  Main Content  │  │             │
│  │  └─────────┘  └──────────┘  └────────────────┘  │             │
│  └──────────────────────────────────────────────────┘             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐         │
│  │              /inbox/page.tsx                          │         │
│  │  ┌────────────────────┐  ┌──────────────────────────┐│         │
│  │  │  ConversationList   │  │      ChatWindow          ││         │
│  │  │  - useConversations │  │  - useMessages           ││         │
│  │  │  - Real-time update │  │  - Socket.IO events      ││         │
│  │  │  - Unread badges    │  │  - MessageInput          ││         │
│  │  └────────────────────┘  └──────────────────────────┘│         │
│  └──────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints (Backend Connection)

| Frontend Action | Method | Endpoint | Socket Event |
|-----------------|--------|----------|--------------|
| Login | POST | `/api/auth/login` | - |
| Register | POST | `/api/auth/register` | - |
| Get conversations | GET | `/api/conversations` | - |
| Create conversation | POST | `/api/conversations` | - |
| Get messages | GET | `/api/messages/conversations/:id` | - |
| Send message | POST | `/api/messages` | `send_message` |
| Mark read | PUT | `/api/messages/:id/read` | `mark_read` |
| Upload file | POST | `/api/upload` | - |
| Get profile | GET | `/api/auth/me` | - |
| Update profile | PUT | `/api/users/profile` | - |
| - | - | - | `join_conversation` |
| - | - | - | `typing_start/stop` |
| - | - | - | `message_received` |
| - | - | - | `user_online/offline` |

---

## Dependencies

```json
{
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "socket.io-client": "^4.7.0",
    "axios": "^1.7.0",
    "react-hook-form": "^7.51.0",
    "react-hot-toast": "^2.4.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.378.0",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.2.0"
  }
}
```

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_PATH=/socket.io
```

---

## Key UI/UX Principles

1. **Mobile-First**: All layouts work from 320px width up
2. **Loading States**: Skeleton loaders everywhere
3. **Empty States**: Meaningful illustrations when no data
4. **Error States**: Friendly error messages + retry buttons
5. **Optimistic Updates**: Messages appear instantly before API confirms
6. **Real-time**: No page refreshes needed - Socket.IO handles all updates
7. **Accessible**: WCAG 2.1 AA compliant
8. **Smooth**: Page transitions, message animations, theme toggling

---

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **JWT token refresh** | Axios interceptor catches 401, refreshes token, retries request |
| **Socket reconnection** | Socket.IO built-in reconnection with exponential backoff |
| **Message ordering** | Sort by createdAt timestamp, use date-fns for grouping |
| **Offline message queue** | Queue in localStorage, send on reconnection |
| **Mobile chat UX** | Split view on desktop, single view with back button on mobile |
| **Unread counts accuracy** | Track via Socket.IO events + API sync |
| **Dark mode persistence** | localStorage + system preference detection |
| **File preview** | Lazy load images, show file type icons for documents |

---

## Color Palette

```css
/* Light Mode (Default) */
:root {
  --primary: #4F46E5;        /* Indigo 600 */
  --primary-light: #818CF8;  /* Indigo 400 */
  --primary-dark: #3730A3;   /* Indigo 800 */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  --border: #E5E7EB;
  --success: #10B981;
  --error: #EF4444;
  --warning: #F59E0B;
}

/* Dark Mode */
.dark {
  --primary: #818CF8;
  --primary-light: #A5B4FC;
  --primary-dark: #4F46E5;
  --bg-primary: #111827;
  --bg-secondary: #1F2937;
  --bg-tertiary: #374151;
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --text-muted: #9CA3AF;
  --border: #374151;
}
```

---

## Timeline

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| **1: Foundation & Auth** | Next.js setup, types, API, auth pages | 2-3 hours |
| **2: Dashboard Layout** | Sidebar, Header, responsive layout | 1-2 hours |
| **3: Socket.IO** | Real-time connection, events | 1-2 hours |
| **4: Chat Interface** | All chat components | 3-4 hours |
| **5: Inbox Page** | Full inbox with split view | 2-3 hours |
| **6: Profile & Admin** | Profile settings, admin pages | 2-3 hours |
| **7: Polish** | Animations, dark mode, mobile, a11y | 2-3 hours |
| **Total** | | **14-20 hours** |

---

## Ready to Build

The frontend is fully planned. Once you give the go-ahead, I'll:

1. Initialize the Next.js project with all dependencies
2. Build the complete project structure
3. Implement each phase sequentially
4. Create meaningful git commits throughout
5. Write the README with setup instructions
