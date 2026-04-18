// Public surface of the chat-inbox feature.
export { ChatUnreadBadge } from './ui/ChatUnreadBadge'
export { InboxList, NoConversationSelected } from './ui/InboxList'
export { ConversationDetail } from './ui/ConversationDetail'
export { useChatInboxStore } from './model/useChatInboxStore'
export { useInboxConversations } from './hooks/useInboxConversations'
export type {
  ChatConversationAdminView,
  ChatMessageAdminView,
  ChatConversationStatus,
  ChatSenderType,
  InboxFilters,
} from './types'
