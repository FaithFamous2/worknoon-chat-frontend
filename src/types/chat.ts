export interface Conversation {
  id: string;
  _id: string;
  participants: Participant[];
  type: 'buyer-designer' | 'buyer-merchant' | 'buyer-agent';
  context: {
    orderId?: string;
    productId?: string;
  };
  status: 'active' | 'closed' | 'archived';
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  userId: {
    _id: string;
    email: string;
    role: string;
    profile: { firstName: string; lastName: string; avatar: string };
    status: { isOnline: boolean; lastSeen?: string };
  };
  role: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    email: string;
    role: string;
    profile: { firstName: string; lastName: string; avatar: string };
  };
  content: string;
  attachments: Attachment[];
  status: 'sent' | 'delivered' | 'read';
  readBy: { userId: string; readAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  url: string;
  type: string;
  name: string;
  size?: number;
  thumbnailUrl?: string;
  previewUrl?: string;
  fileType?: 'image' | 'video' | 'document';
  isImage?: boolean;
  isVideo?: boolean;
  isDocument?: boolean;
  duration?: number; // For videos (in seconds)
  format?: string;
}

export interface CreateConversationPayload {
  participantIds: { userId: string; role: string }[];
  type: 'buyer-designer' | 'buyer-merchant' | 'buyer-agent';
  context?: { orderId?: string; productId?: string };
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  attachments?: Attachment[];
}
