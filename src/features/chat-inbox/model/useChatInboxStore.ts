import { create } from 'zustand'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/shared/lib/supabaseClient'
import type { ChatBroadcastEvent } from '../types'

/**
 * Inbox-level state. Two responsibilities:
 *
 *   1. Track the currently-active conversation (`activeConversationId`)
 *      so the detail pane knows what to render. Driven by the URL
 *      (/chat/:conversationId) — `setActive` is called from the page on
 *      mount + on click in the inbox list.
 *
 *   2. Manage the Supabase Realtime subscription for the active
 *      conversation. Only one channel open at a time — switching
 *      conversations tears down the old subscription and opens a new one.
 *
 * The inbox LIST itself is managed by React Query (see useInboxConversations).
 * The active conversation's MESSAGES are also managed by React Query (see
 * useConversationDetail). This store just holds the realtime side and
 * exposes a callback registry so React Query queries can invalidate
 * themselves when broadcast events land.
 */

type RealtimeListener = (event: ChatBroadcastEvent) => void

interface ChatInboxState {
  activeConversationId: string | null
  _channel: RealtimeChannel | null
  _listeners: Set<RealtimeListener>

  setActive: (id: string | null) => void
  /** Register a callback to receive raw broadcast events for the active
   *  conversation. Returns an unsubscribe function. Used by React Query
   *  hooks to invalidate / merge cache on incoming events. */
  onEvent: (listener: RealtimeListener) => () => void
  unsubscribe: () => void
}

export const useChatInboxStore = create<ChatInboxState>((set, get) => ({
  activeConversationId: null,
  _channel: null,
  _listeners: new Set(),

  setActive: (id: string | null) => {
    const { activeConversationId, _channel } = get()
    if (activeConversationId === id) return

    // Tear down previous channel before swapping.
    if (_channel) {
      void supabase.removeChannel(_channel)
    }

    if (!id) {
      set({ activeConversationId: null, _channel: null })
      return
    }

    const channel = supabase
      .channel(`chat:${id}`, {
        config: { broadcast: { self: false } },
      })
      .on('broadcast', { event: 'message' }, (payload) =>
        _fanout(get, payload.payload as ChatBroadcastEvent),
      )
      .on('broadcast', { event: 'read_receipt' }, (payload) =>
        _fanout(get, payload.payload as ChatBroadcastEvent),
      )
      .on('broadcast', { event: 'conversation_closed' }, (payload) =>
        _fanout(get, payload.payload as ChatBroadcastEvent),
      )
      .subscribe()

    set({ activeConversationId: id, _channel: channel })
  },

  onEvent: (listener: RealtimeListener) => {
    get()._listeners.add(listener)
    return () => {
      get()._listeners.delete(listener)
    }
  },

  unsubscribe: () => {
    const { _channel } = get()
    if (_channel) {
      void supabase.removeChannel(_channel)
    }
    set({ activeConversationId: null, _channel: null })
  },
}))

function _fanout(get: () => ChatInboxState, event: ChatBroadcastEvent): void {
  // Snapshot the listener set so a listener's unsubscribe doesn't mutate
  // mid-iteration.
  const listeners = Array.from(get()._listeners)
  for (const fn of listeners) {
    try {
      fn(event)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[chat-inbox] listener threw:', err)
    }
  }
}
