# Worknoon Chat Frontend

A modern, real-time chat frontend built with Next.js, TypeScript, and Tailwind CSS. Designed for eCommerce platforms to enable communication between customers, support agents, designers, and merchants.

## Features

### Core Features
- **Authentication**: JWT-based login/signup with role-based access
- **Real-time Chat**: Socket.IO integration for instant messaging
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Role-Based Dashboards**: Separate interfaces for admin, agent, customer, designer, and merchant

### Bonus Features Implemented
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Notifications**: Real-time notification system with dropdown
- **Typing Indicators**: Show when someone is typing
- **Online Status**: Green indicator showing user online status
- **File Uploads**: Cloudinary integration for images and documents
- **Chat Transfer**: Transfer chats between agents, merchants, and designers
- **Customer Support Flow**: Auto-assign customers to available agents

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Socket.IO Client**: Real-time communication
- **Axios**: HTTP client for API requests
- **React Context**: State management
- **Custom Hooks**: Reusable logic with useConversations, useMessages, useNotifications

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
worknoon-chat-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (agent)/           # Agent dashboard routes
│   │   ├── (customer)/        # Customer dashboard routes
│   │   ├── (dashboard)/       # Shared dashboard routes
│   │   ├── (designer)/        # Designer dashboard routes
│   │   ├── (merchant)/        # Merchant dashboard routes
│   │   ├── admin/             # Admin routes
│   │   ├── auth/              # Authentication pages
│   │   ├── agent/             # Agent pages
│   │   ├── customer/          # Customer pages
│   │   ├── designer/          # Designer pages
│   │   ├── merchant/          # Merchant pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── not-found.tsx      # 404 page
│   ├── components/
│   │   ├── admin/             # Admin components
│   │   ├── auth/              # Authentication forms
│   │   ├── chat/              # Chat components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API and socket services
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
├── public/                    # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── next.config.mjs            # Next.js configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## User Roles & Routes

### Admin
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/conversations` - All conversations

### Agent
- `/agent/dashboard` - Agent dashboard with assigned chats
- `/inbox` - Chat inbox
- `/inbox/[conversationId]` - Individual chat

### Customer
- `/customer/dashboard` - Customer dashboard
- Support chat button for instant agent connection

### Designer
- `/designer/dashboard` - Designer dashboard

### Merchant
- `/merchant/dashboard` - Merchant dashboard

## Chat Features

### Real-time Messaging
- Instant message delivery via Socket.IO
- Optimistic UI updates
- Message status indicators (sent, delivered, read)
- Typing indicators

### File Sharing
- Image uploads with preview
- Document uploads (PDF, DOC, XLS, etc.)
- Cloudinary integration
- File size and type validation

### Chat Management
- Create new conversations
- Transfer chats to other users
- Close conversations
- Unread message counts
- Search conversations

### Notifications
- Real-time notification badge
- Notification dropdown
- Mark as read functionality
- Email notifications (backend)

## Components

### Chat Components
- `ChatWindow` - Main chat interface
- `MessageBubble` - Individual message display
- `MessageInput` - Message input with file upload
- `ConversationList` - List of conversations
- `TypingIndicator` - Typing animation
- `StartConversationModal` - New conversation dialog
- `ChatTransferModal` - Transfer chat dialog
- `SupportChatButton` - Quick support chat button

### UI Components
- `Button` - Reusable button with variants
- `Input` - Form input component
- `Textarea` - Multi-line text input
- `Avatar` - User avatar with online status

### Layout Components
- `Layout` - Main application layout
- `Header` - Top navigation with notifications
- `Sidebar` - Side navigation menu
- `ToastNotification` - Toast notifications
- `NotificationDropdown` - Notification list

## Custom Hooks

- `useConversations` - Manage conversations list
- `useMessages` - Manage messages for a conversation
- `useNotifications` - Manage notifications
- `useAvailableUsers` - Get available users for chat

## Contexts

- `AuthContext` - Authentication state
- `SocketContext` - Socket.IO connection
- `ThemeContext` - Dark/light mode

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | `http://localhost:5000` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Design Inspiration

UI design inspired by modern chat applications on Dribbble:
- Clean, minimal interface
- Rounded corners and soft shadows
- Smooth animations and transitions
- Accessible color contrast
- Mobile-responsive layouts

## Security

- JWT token storage in localStorage
- Automatic token refresh
- Protected routes based on user roles
- XSS protection through React's built-in escaping

## Challenges & Solutions

### Challenge 1: Real-time UI Synchronization
**Problem**: Keeping message UI in sync across multiple tabs/windows without excessive re-renders.
**Solution**:
- Implemented optimistic UI updates for instant feedback
- Used Socket.IO for server-pushed updates
- React Query-style caching with custom hooks (useMessages, useConversations)
- Selective re-rendering with proper dependency arrays

### Challenge 2: Role-Based Route Protection
**Problem**: Different user roles need access to different routes and components.
**Solution**:
- Created Higher-Order Component (HOC) pattern for protected routes
- Route groups in Next.js App Router: `(admin)`, `(agent)`, `(customer)`, etc.
- Middleware checks role before rendering
- Sidebar and navigation dynamically generate based on user role

### Challenge 3: Theme Persistence & Flashing
**Problem**: Dark mode preference needs to persist and avoid flashing on page load.
**Solution**:
- Used `next-themes` with system preference detection
- CSS variables for instant theme switching
- localStorage for persistence
- `suppressHydrationWarning` to prevent hydration mismatch

### Challenge 4: File Upload UX
**Problem**: Users need visual feedback during file uploads with progress indication.
**Solution**:
- Custom file input with drag-and-drop support
- Upload progress animation with Tailwind CSS
- Image preview before sending
- Error handling with toast notifications
- Cloudinary direct upload for large files

### Challenge 5: Mobile-Responsive Chat Interface
**Problem**: Chat interface needs to work well on mobile devices with limited screen space.
**Solution**:
- Mobile-first design with Tailwind CSS
- Collapsible conversation list on mobile
- Full-screen chat view on small screens
- Touch-friendly message input with auto-resize
- Bottom sheet for chat actions on mobile

### Challenge 6: Token Refresh Without User Interruption
**Problem**: JWT tokens expire but users shouldn't be logged out mid-session.
**Solution**:
- Axios interceptors for automatic token refresh
- Silent refresh on 401 errors
- Queue pending requests during refresh
- Redirect to login only if refresh fails

## Performance

- Next.js App Router for optimal routing
- Image optimization with Next.js Image
- Lazy loading of components
- Efficient re-rendering with React hooks
- Code splitting by route groups
- Debounced search and typing indicators

