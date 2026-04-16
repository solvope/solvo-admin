import { useQuery } from '@tanstack/react-query'
import { workQueueRepository } from '../api/workQueueRepository'

/**
 * Hook compartido para obtener los conteos del Work Queue.
 *
 * Lo consumen el badge del sidebar y la página del work-queue: centralizar
 * el queryKey evita dos fetches distintos en la misma pantalla y permite que
 * ambos se actualicen en sync (staleTime 30s — no necesitamos real-time,
 * pero un minuto se siente viejo cuando el admin aprueba un préstamo).
 */
export const WORK_QUEUE_COUNTS_KEY = ['admin', 'work-queue', 'counts'] as const

export function useWorkQueueCounts() {
  return useQuery({
    queryKey: WORK_QUEUE_COUNTS_KEY,
    queryFn: workQueueRepository.getCounts,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
