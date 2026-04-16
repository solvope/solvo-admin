import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import {
  useWorkQueueCounts,
  workQueueRepository,
  WorkQueueSummary,
  WorkItemRow,
} from '@/features/manage-work-queue'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import type { WorkItemType } from '@/entities/work-queue'

const PAGE_SIZE = 25

const TYPE_LABELS: Record<WorkItemType, string> = {
  pending_loans: 'Préstamos por aprobar',
  overdue_loans: 'Préstamos en mora',
  pending_kyc: 'KYC por revisar',
  complaints: 'Reclamos INDECOPI',
  sau_tickets: 'Tickets SAU',
  plaft_pending: 'Alertas PLAFT',
}

/**
 * WorkQueuePage (Tier Plataforma P.2).
 *
 * Vista unificada de tareas pendientes del admin. Las 6 tarjetas de conteo
 * sirven como selector de cola (similar a tabs pero con visualización de
 * volumen por color). La lista se carga lazy al seleccionar la cola.
 */
export function WorkQueuePage() {
  const [activeType, setActiveType] = useState<WorkItemType>('pending_loans')
  const { data: counts, isLoading: countsLoading } = useWorkQueueCounts()

  const { data: itemsPage, isLoading: itemsLoading, isFetching } = useQuery({
    queryKey: ['admin', 'work-queue', 'items', activeType],
    queryFn: () =>
      workQueueRepository.listItems({
        type: activeType,
        limit: PAGE_SIZE,
        offset: 0,
      }),
    placeholderData: previous => previous,
  })

  const items = itemsPage?.items ?? []
  const total = itemsPage?.total ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cola de trabajo</h1>
          <p className="text-sm text-muted-foreground">
            Tareas pendientes de revisión agrupadas por categoría.
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {countsLoading ? 'Cargando…' : `${counts?.total ?? 0} pendiente(s) en total`}
        </span>
      </div>

      <WorkQueueSummary
        counts={counts}
        isLoading={countsLoading}
        active={activeType}
        onSelect={setActiveType}
      />

      <Card>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">
            {TYPE_LABELS[activeType]}
          </h2>
          <span className="text-xs text-muted-foreground">
            {isFetching ? (
              <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
            ) : null}
            {total} ítem(s)
          </span>
        </div>
        <CardContent className="p-0">
          {itemsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-16">
              Sin ítems en esta cola. ¡Todo al día! 🎉
            </p>
          ) : (
            items.map(item => (
              <WorkItemRow key={item.id} item={item} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
