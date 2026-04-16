import { Clock, AlertTriangle, UserCheck, MessageSquare, LifeBuoy, ShieldAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import type { WorkQueueCounts, WorkItemType } from '@/entities/work-queue'

interface Props {
  counts?: WorkQueueCounts
  isLoading: boolean
  active: WorkItemType
  onSelect: (type: WorkItemType) => void
}

interface Tile {
  type: WorkItemType
  label: string
  icon: LucideIcon
  accent: string
  count: (c: WorkQueueCounts) => number
  /** Si hay items, resaltamos el card en color fuerte; si no, en neutro. */
  toneWhenFilled: string
}

const TILES: Tile[] = [
  {
    type: 'pending_loans',
    label: 'Préstamos por aprobar',
    icon: Clock,
    accent: 'text-amber-600',
    count: c => c.pendingLoans,
    toneWhenFilled: 'border-amber-200 bg-amber-50/40',
  },
  {
    type: 'overdue_loans',
    label: 'Préstamos en mora',
    icon: AlertTriangle,
    accent: 'text-red-600',
    count: c => c.overdueLoans,
    toneWhenFilled: 'border-red-200 bg-red-50/40',
  },
  {
    type: 'pending_kyc',
    label: 'KYC por revisar',
    icon: UserCheck,
    accent: 'text-blue-600',
    count: c => c.pendingKyc,
    toneWhenFilled: 'border-blue-200 bg-blue-50/40',
  },
  {
    type: 'complaints',
    label: 'Reclamos INDECOPI',
    icon: MessageSquare,
    accent: 'text-purple-600',
    count: c => c.openComplaints,
    toneWhenFilled: 'border-purple-200 bg-purple-50/40',
  },
  {
    type: 'sau_tickets',
    label: 'Tickets SAU',
    icon: LifeBuoy,
    accent: 'text-teal-600',
    count: c => c.openSauTickets,
    toneWhenFilled: 'border-teal-200 bg-teal-50/40',
  },
  {
    type: 'plaft_pending',
    label: 'Alertas PLAFT',
    icon: ShieldAlert,
    accent: 'text-rose-600',
    count: c => c.plaftPending,
    toneWhenFilled: 'border-rose-200 bg-rose-50/40',
  },
]

/**
 * Tarjetas clickables que funcionan como selector de la cola activa y, a la
 * vez, como resumen visual. Mantenerlas aquí (y no como Tabs de shadcn) nos
 * deja resaltar colores por tipo, que es gran parte del valor de la pantalla.
 */
export function WorkQueueSummary({ counts, isLoading, active, onSelect }: Props) {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {TILES.map(tile => {
        const Icon = tile.icon
        const value = counts ? tile.count(counts) : 0
        const isActive = tile.type === active
        const isFilled = value > 0

        return (
          <button
            key={tile.type}
            type="button"
            onClick={() => onSelect(tile.type)}
            className={cn(
              'text-left transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg',
            )}
            aria-pressed={isActive}
          >
            <Card
              className={cn(
                'h-full transition-all hover:shadow-sm',
                isActive && 'ring-2 ring-primary border-primary',
                !isActive && isFilled && tile.toneWhenFilled,
              )}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Icon className={cn('h-4 w-4', isFilled ? tile.accent : 'text-muted-foreground')} />
                  {isLoading ? (
                    <Skeleton className="h-6 w-10" />
                  ) : (
                    <span className={cn(
                      'text-2xl font-bold leading-none',
                      isFilled ? tile.accent : 'text-muted-foreground',
                    )}>
                      {value}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-muted-foreground leading-snug">
                  {tile.label}
                </p>
              </CardContent>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
