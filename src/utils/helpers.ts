import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { Participant, Conversation } from '@/types/chat';
import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday ' + format(date, 'h:mm a');
  }
  return format(date, 'MMM d, h:mm a');
}

export function formatConversationTime(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMM d');
}

export function formatLastSeen(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function formatExactTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'h:mm a');
}

export function formatFullDateTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy h:mm a');
}

export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '?';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('text')) return 'text';
  return 'file';
}

export function getOtherParticipant(participants: Participant[], userId: string) {
  return participants.find((p) => p.userId._id !== userId)?.userId;
}

export function getParticipantName(participant: Participant['userId'] | undefined): string {
  if (!participant) return 'Unknown User';
  const { firstName, lastName } = participant.profile || {};
  return [firstName, lastName].filter(Boolean).join(' ') || participant.email || 'Unknown User';
}

export function getConversationTitle(conversation: Conversation, userId: string): string {
  const other = getOtherParticipant(conversation.participants, userId);
  return getParticipantName(other) || 'Conversation';
}

export function getConversationSubtitle(conversation: Conversation): string {
  const types: Record<string, string> = {
    'buyer-designer': 'Design Inquiry',
    'buyer-merchant': 'Product Inquiry',
    'buyer-agent': 'Support Ticket',
  };
  return types[conversation.type] || conversation.type;
}
