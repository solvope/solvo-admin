import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { useWorkQueueCounts } from '../model/useWorkQueueCounts'

/**
 * Badge numérico mostrado al lado de "Cola de trabajo" en el sidebar.
 * Se oculta cuando no hay items (cola vacía = sin ruido visual).
 */
export function WorkQueueBadge({ className }: { className?: string }) {
  const { data } = useWorkQueueCounts()
  const total = data?.total ?? 0
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
