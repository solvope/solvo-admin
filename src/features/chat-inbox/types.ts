/**
 * Wire-format types mirroring crevo-backend's admin chat endpoints.
 * Admins receive the full toJSON() variant (with assignedTo, unread
 * counts, etc.) — unlike the user widget which gets the redacted
 * toUserJSON() shape.
 */

export type ChatSenderType = 'user' | 'agent' | 'system'
export type ChatConversationStatus = 'OPEN' | 'CLOSED'

/** From `ChatConversation.toJSON()` (admin view). */
export interface ChatConversationAdminView {
  id: string
  userId: string
  assignedTo: string | null
  assignedAt: string | null
  status: ChatConversationStatus
  closedAt: string | null
  closedBy: string | null
  lastMessageAt: string | null
  lastMessageSender: ChatSenderType | null
  lastMessagePreview: string | null
  userUnreadCount: number
  agentUnreadCount: number
  createdAt: string
  updatedAt: string
}

/** From `ChatMessage.toJSON()`. */
export interface ChatMessageAdminView {
  id: string
  conversationId: string
  senderType: ChatSenderType
  senderId: string | null
  body: string
  readAt: string | null
  createdAt: string
}

export interface ChatInboxListResult {
  items: ChatConversationAdminView[]
  total: number
  limit: number
  offset: number
}

export interface ChatConversationDetail {
  conversation: ChatConversationAdminView
  messages: ChatMessageAdminView[]
}

// ─── Broadcast event union (mirrors backend IChatBroadcaster) ────────────────

export interface ChatBroadcastMessageEvent {
  type: 'message'
  message: ChatMessageAdminView
}

export interface ChatBroadcastReadReceiptEvent {
  type: 'read_receipt'
  conversationId: string
  readerType: 'user' | 'agent'
  at: string
}

export interface ChatBroadcastConversationClosedEvent {
  type: 'conversation_closed'
  conversationId: string
  closedAt: string
}

/** Transient "X is typing" — emitted client→client (no backend round-trip),
 *  debounced on sender, auto-cleared 5s after last event on receiver. */
export interface ChatBroadcastTypingEvent {
  type: 'typing'
  conversationId: string
  senderType: 'user' | 'agent'
  isTyping: boolean
  at: string
}

export type ChatBroadcastEvent =
  | ChatBroadcastMessageEvent
  | ChatBroadcastReadReceiptEvent
  | ChatBroadcastConversationClosedEvent
  | ChatBroadcastTypingEvent

// ─── Optimistic UI helpers ───────────────────────────────────────────────────

export const TEMP_ID_PREFIX = 'temp-'

export function isTempId(id: string): boolean {
  return id.startsWith(TEMP_ID_PREFIX)
}

// ─── Inbox filters ───────────────────────────────────────────────────────────

export interface InboxFilters {
  status?: ChatConversationStatus
  assignedTo?: string
  unassignedOnly?: boolean
  /** Convenience filter for the UI tabs: 'all' | 'mine' | 'unassigned'. */
  tab?: 'all' | 'mine' | 'unassigned'
}
