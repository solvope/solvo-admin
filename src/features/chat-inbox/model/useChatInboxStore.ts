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
  /** "Usuario está escribiendo…" — driven by typing broadcast events
   *  from the user's chat widget. Auto-clears 5s after last event. */
  isUserTyping: boolean
  _channel: RealtimeChannel | null
  _listeners: Set<RealtimeListener>

  setActive: (id: string | null) => void
  /** Register a callback to receive raw broadcast events for the active
   *  conversation. Returns an unsubscribe function. Used by React Query
   *  hooks to invalidate / merge cache on incoming events. */
  onEvent: (listener: RealtimeListener) => () => void
  /** Tell the user we're typing. Throttled to 1 emit / 2s; schedules a
   *  "stopped" signal 3s after the last keystroke. The composer calls
   *  this on every keypress — debounce lives here. */
  notifyTyping: () => void
  unsubscribe: () => void
}

// ─── Module-level transients (timer state, doesn't drive renders) ────────
let _typingLastEmit = 0
let _typingStoppedTimer: ReturnType<typeof setTimeout> | null = null
let _userTypingClearTimer: ReturnType<typeof setTimeout> | null = null

function _clearTypingTimers(): void {
  if (_typingStoppedTimer) {
    clearTimeout(_typingStoppedTimer)
    _typingStoppedTimer = null
  }
  if (_userTypingClearTimer) {
    clearTimeout(_userTypingClearTimer)
    _userTypingClearTimer = null
  }
  _typingLastEmit = 0
}

export const useChatInboxStore = create<ChatInboxState>((set, get) => ({
  activeConversationId: null,
  isUserTyping: false,
  _channel: null,
  _listeners: new Set(),

  setActive: (id: string | null) => {
    const { activeConversationId, _channel } = get()
    if (activeConversationId === id) return

    // Tear down previous channel before swapping.
    if (_channel) {
      void supabase.removeChannel(_channel)
    }
    _clearTypingTimers()

    if (!id) {
      set({ activeConversationId: null, _channel: null, isUserTyping: false })
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
      .on('broadcast', { event: 'typing' }, (payload) => {
        // Typing is handled here directly (state lives on the store, not
        // in React Query cache) — no fan-out needed.
        const event = payload.payload as ChatBroadcastEvent
        if (event?.type !== 'typing') return
        // Only the USER's typing is interesting to the agent UI — we
        // don't render an indicator for ourselves.
        if (event.senderType !== 'user') return

        if (_userTypingClearTimer) clearTimeout(_userTypingClearTimer)

        if (event.isTyping) {
          set({ isUserTyping: true })
          // Failsafe: drop the indicator after 5s if no "stopped"
          // event lands (network blip, tab close, lost broadcast).
          _userTypingClearTimer = setTimeout(() => {
            set({ isUserTyping: false })
            _userTypingClearTimer = null
          }, 5000)
        } else {
          set({ isUserTyping: false })
          _userTypingClearTimer = null
        }
      })
      .subscribe()

    set({ activeConversationId: id, _channel: channel, isUserTyping: false })
  },

  onEvent: (listener: RealtimeListener) => {
    get()._listeners.add(listener)
    return () => {
      get()._listeners.delete(listener)
    }
  },

  notifyTyping: () => {
    const channel = get()._channel
    const conversationId = get().activeConversationId
    if (!channel || !conversationId) return

    const now = Date.now()
    if (now - _typingLastEmit > 2000) {
      void channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          type: 'typing',
          conversationId,
          senderType: 'agent',
          isTyping: true,
          at: new Date().toISOString(),
        },
      })
      _typingLastEmit = now
    }

    if (_typingStoppedTimer) clearTimeout(_typingStoppedTimer)
    _typingStoppedTimer = setTimeout(() => {
      const c = get()._channel
      const id = get().activeConversationId
      if (c && id) {
        void c.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            type: 'typing',
            conversationId: id,
            senderType: 'agent',
            isTyping: false,
            at: new Date().toISOString(),
          },
        })
      }
      _typingLastEmit = 0
      _typingStoppedTimer = null
    }, 3000)
  },

  unsubscribe: () => {
    const { _channel } = get()
    if (_channel) {
      void supabase.removeChannel(_channel)
    }
    _clearTypingTimers()
    set({ activeConversationId: null, _channel: null, isUserTyping: false })
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
