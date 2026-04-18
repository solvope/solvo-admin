import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Headphones } from 'lucide-react'
import { useAdminAuthStore } from '@/features/admin-auth'
import { cn } from '@/shared/lib/utils'
import {
  InboxList,
  NoConversationSelected,
  ConversationDetail,
  useChatInboxStore,
  useInboxConversations,
  type InboxFilters,
} from '@/features/chat-inbox'

/**
 * Two-pane chat inbox.
 *
 * Routes:
 *   - /chat                    → list visible, no conversation selected
 *   - /chat/:conversationId    → list + detail
 *
 * The URL is the source of truth for the active conversation. The page
 * mirrors :conversationId into the inbox store on mount and on click,
 * which in turn manages the Supabase Realtime subscription.
 *
 * On mobile (< md) the panes stack: when a conversation is selected we
 * hide the list and show only the detail; otherwise we show only the
 * list. A back button in the detail header isn't needed because the
 * sidebar nav still works.
 */

const TABS: Array<{ value: NonNullable<InboxFilters['tab']>; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'mine', label: 'Mías' },
  { value: 'unassigned', label: 'Sin asignar' },
]

export function ChatInboxPage() {
  const navigate = useNavigate()
  const { conversationId } = useParams<{ conversationId?: string }>()
  const { user } = useAdminAuthStore()
  const setActive = useChatInboxStore((s) => s.setActive)
  const unsubscribe = useChatInboxStore((s) => s.unsubscribe)

  const [tab, setTab] = useState<NonNullable<InboxFilters['tab']>>('all')

  // Mirror URL → store. Tearing down on page leave is essential — the
  // Realtime channel would leak otherwise.
  useEffect(() => {
    setActive(conversationId ?? null)
    return () => {
      unsubscribe()
    }
  }, [conversationId, setActive, unsubscribe])

  const { data, isLoading } = useInboxConversations({
    filters: { tab, status: 'OPEN' },
    agentId: user?.id ?? '',
    enabled: Boolean(user?.id),
  })

  const items = data?.items ?? []
  const showDetailOnly = Boolean(conversationId)

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-6 lg:-m-8 md:flex-row">
      {/* List pane */}
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-card md:w-80 md:shrink-0',
          showDetailOnly ? 'hidden md:flex' : 'flex flex-1',
        )}
      >
        {/* Header + tabs */}
        <div className="shrink-0 border-b border-border">
          <div className="flex items-center gap-2 px-4 py-3">
            <Headphones className="h-4 w-4 text-brand-accent" aria-hidden="true" />
            <h1 className="text-sm font-semibold">Chat de soporte</h1>
          </div>
          <div className="flex border-t border-border">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={cn(
                  'flex-1 py-2 text-xs font-medium transition-colors border-b-2',
                  tab === t.value
                    ? 'border-brand-accent text-brand-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <InboxList
          items={items}
          isLoading={isLoading}
          activeConversationId={conversationId ?? null}
        />
      </aside>

      {/* Detail pane */}
      <section
        className={cn(
          'flex-1 flex flex-col min-w-0',
          showDetailOnly ? 'flex' : 'hidden md:flex',
        )}
      >
        {/* Mobile back button when a conversation is open */}
        {showDetailOnly && (
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="md:hidden shrink-0 px-4 py-2 text-xs text-brand-accent border-b border-border bg-card text-left"
          >
            ← Volver al inbox
          </button>
        )}

        {conversationId && user?.id ? (
          <ConversationDetail conversationId={conversationId} agentId={user.id} />
        ) : (
          <NoConversationSelected />
        )}
      </section>
    </div>
  )
}
