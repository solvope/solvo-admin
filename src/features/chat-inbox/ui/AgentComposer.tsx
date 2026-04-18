import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Loader2, Smile } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { chatInboxRepository } from '../api/chatInboxRepository'
import { conversationQueryKey } from '../hooks/useConversationDetail'
import { useChatInboxStore } from '../model/useChatInboxStore'
import { TEMP_ID_PREFIX } from '../types'
import type { ChatConversationDetail, ChatMessageAdminView } from '../types'
import { EmojiPicker } from './EmojiPicker'

const MAX_LEN = 4000
/** Hard cap on auto-grow: 4 visible rows. After this, scroll appears. */
const MAX_VISIBLE_ROWS = 4

interface Props {
  conversationId: string
  isClosed: boolean
  /** Agent id for optimistic message authorship — replaced when REST returns. */
  agentId: string
}

/**
 * Composer with the same UX contract as the user widget: Enter sends,
 * Shift+Enter for newline, optimistic insert into the React Query cache,
 * rollback on error. Disabled when the conversation is CLOSED.
 */
export function AgentComposer({ conversationId, isClosed, agentId }: Props) {
  const qc = useQueryClient()
  const notifyTyping = useChatInboxStore((s) => s.notifyTyping)
  const [value, setValue] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Resize on every value change. Caps at MAX_VISIBLE_ROWS rows
  // (computed from real line-height + padding so it adapts to the
  // current font/line-height instead of a hardcoded pixel value).
  // overflow-y is hidden until we hit the cap, then auto — so the
  // scrollbar only appears once the content actually exceeds 4 rows.
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    const style = window.getComputedStyle(ta)
    const lineHeightRaw = parseFloat(style.lineHeight)
    const lineHeight = Number.isFinite(lineHeightRaw)
      ? lineHeightRaw
      : parseFloat(style.fontSize) * 1.2
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    const maxHeight = lineHeight * MAX_VISIBLE_ROWS + paddingY

    ta.style.height = 'auto'
    const next = Math.min(ta.scrollHeight, maxHeight)
    ta.style.height = `${next}px`
    ta.style.overflowY = ta.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [value])

  /** Insert text at the current selection without losing focus. */
  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current
    if (!ta) {
      setValue((v) => v + text)
      return
    }
    const start = ta.selectionStart ?? value.length
    const end = ta.selectionEnd ?? value.length
    const next = value.slice(0, start) + text + value.slice(end)
    setValue(next)
    requestAnimationFrame(() => {
      ta.focus()
      const cursor = start + text.length
      ta.selectionStart = ta.selectionEnd = cursor
    })
  }

  const send = useMutation({
    mutationFn: (body: string) => chatInboxRepository.sendMessage(conversationId, body),
    onMutate: async (body) => {
      // crypto.randomUUID is available in all modern browsers (Chrome 92+,
      // Firefox 95+, Safari 15.4+) — the admin SPA targets evergreen.
      const tempId = `${TEMP_ID_PREFIX}${crypto.randomUUID()}`
      const tempMessage: ChatMessageAdminView = {
        id: tempId,
        conversationId,
        senderType: 'agent',
        senderId: agentId,
        body,
        readAt: null,
        createdAt: new Date().toISOString(),
      }

      // Snapshot for rollback
      const previous = qc.getQueryData<ChatConversationDetail>(
        conversationQueryKey(conversationId),
      )

      qc.setQueryData<ChatConversationDetail | undefined>(
        conversationQueryKey(conversationId),
        (prev) => {
          if (!prev) return prev
          return {
            conversation: {
              ...prev.conversation,
              lastMessageAt: tempMessage.createdAt,
              lastMessageSender: 'agent',
              lastMessagePreview: body.slice(0, 120),
            },
            messages: [...prev.messages, tempMessage],
            user: prev.user,
          }
        },
      )

      return { tempId, previous }
    },
    onSuccess: (saved, _body, ctx) => {
      // Swap temp for canonical
      qc.setQueryData<ChatConversationDetail | undefined>(
        conversationQueryKey(conversationId),
        (prev) => {
          if (!prev) return prev
          return {
            conversation: prev.conversation,
            messages: prev.messages.map((m) => (m.id === ctx?.tempId ? saved : m)),
            user: prev.user,
          }
        },
      )
      // Invalidate inbox so the conversation jumps to top + sender flips
      qc.invalidateQueries({ queryKey: ['admin', 'chat', 'inbox'] })
    },
    onError: (err, _body, ctx) => {
      // Rollback to snapshot
      if (ctx?.previous) {
        qc.setQueryData(conversationQueryKey(conversationId), ctx.previous)
      }
      toast.error(err instanceof Error ? err.message : 'No pudimos enviar el mensaje')
    },
  })

  if (isClosed) {
    return (
      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground text-center">
          Esta conversación está cerrada. El usuario verá tu mensaje sólo si la reabre — para
          continuar pídele que inicie un nuevo chat.
        </p>
      </div>
    )
  }

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || send.isPending) return
    setValue('')
    send.mutate(trimmed, {
      onError: () => setValue(trimmed), // restore so the agent doesn't lose their draft
    })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const remaining = MAX_LEN - value.length
  const overLimit = remaining < 0

  return (
    // No border-t / bg-card here — the parent rail in ConversationDetail
    // owns those so the divider spans the full pane width while the
    // textarea+button stay centered with the thread above.
    <div className="px-3 py-2.5">
      <div className="flex items-end gap-2">
        {/* Emoji picker trigger — wrapper is relative so the popover can
            anchor to it via absolute positioning. */}
        <div className="relative shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setPickerOpen((p) => !p)}
            aria-label={pickerOpen ? 'Cerrar selector de emojis' : 'Abrir selector de emojis'}
            aria-expanded={pickerOpen}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <Smile className="h-4 w-4" aria-hidden="true" />
          </Button>
          {pickerOpen && (
            <EmojiPicker
              onSelect={(emoji) => insertAtCursor(emoji)}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            // Fire-and-forget — store debounces internally so this is safe
            // to call on every keystroke. Skip empty value (e.g. user just
            // backspaced everything) to avoid emitting a "typing" signal
            // when there's nothing to type.
            if (e.target.value.length > 0) notifyTyping()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu respuesta…"
          rows={1}
          maxLength={MAX_LEN + 100}
          aria-label="Respuesta al usuario"
          className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 leading-snug"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!value.trim() || send.isPending || overLimit}
          aria-label="Enviar respuesta"
          className="h-9 w-9 shrink-0"
        >
          {send.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
      {value.length > MAX_LEN - 200 && (
        <p
          className={`mt-1 text-[10px] text-right ${
            overLimit ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {overLimit
            ? `${Math.abs(remaining)} caracteres sobre el límite`
            : `${remaining} caracteres restantes`}
        </p>
      )}
    </div>
  )
}
