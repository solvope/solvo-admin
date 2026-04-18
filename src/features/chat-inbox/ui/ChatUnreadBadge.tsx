import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { chatInboxRepository } from '../api/chatInboxRepository'

/**
 * Sidebar badge showing total agent_unread_count across all OPEN
 * conversations. Polls every 15s (same cadence as the inbox list itself
 * — agents typically have the inbox open while working). Hidden when 0.
 *
 * Uses its own React Query key (independent of the inbox list filters)
 * so it stays accurate even when the agent is filtering by 'mine' /
 * 'unassigned' in the inbox UI.
 */
export function ChatUnreadBadge({ className }: { className?: string }) {
  const { data } = useQuery({
    queryKey: ['admin', 'chat', 'unread-total'],
    queryFn: () => chatInboxRepository.list({ status: 'OPEN' }, 100, 0),
    refetchInterval: 15_000,
    staleTime: 5_000,
  })

  const total = (data?.items ?? []).reduce((sum, c) => sum + c.agentUnreadCount, 0)
  if (total === 0) return null

  const display = total > 99 ? '99+' : String(total)

  return (
    <Badge
      variant="destructive"
      className={cn('ml-auto h-5 min-w-5 px-1.5 text-[10px]', className)}
    >
      {display}
    </Badge>
  )
}
