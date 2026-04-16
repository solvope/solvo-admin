import { apiClient } from '@/shared/api/client'
import type {
  WorkItemType,
  WorkItemsPage,
  WorkQueueCounts,
} from '@/entities/work-queue'

/**
 * Work Queue unificado (Tier Plataforma P.2).
 *
 * Dos llamadas: `getCounts()` para el badge del sidebar + cards resumen, y
 * `listItems({ type })` para la lista detallada de la cola seleccionada.
 */
export const workQueueRepository = {
  async getCounts(): Promise<WorkQueueCounts> {
    const { data } = await apiClient.get('/admin/work-queue/counts')
    return data.data
  },

  async listItems(params: {
    type: WorkItemType
    limit?: number
    offset?: number
  }): Promise<WorkItemsPage> {
    const { data } = await apiClient.get('/admin/work-queue/items', {
      params: {
        type: params.type,
        limit: params.limit,
        offset: params.offset,
      },
    })
    return data.data
  },
}
