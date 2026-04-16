import { apiClient } from '@/shared/api/client'
import type {
  CustomerOverview,
  CustomerSearchResult,
  CustomerAdminNote,
} from '@/entities/customer'

/**
 * Customer 360 (Tier Plataforma P.1).
 *
 * Expone sólo lectura del overview, búsqueda paginada y CRUD de notas
 * internas. El resto de mutaciones del Customer 360 (aprobar préstamo,
 * suspender usuario, responder ticket) viven en los repos de su propio
 * sub-dominio para no convertir este módulo en un god-object.
 */
export const customersRepository = {
  async search(params: {
    query?: string
    limit?: number
    offset?: number
    role?: string
  }): Promise<CustomerSearchResult> {
    const { data } = await apiClient.get('/admin/users/search', {
      params: {
        q: params.query ?? '',
        limit: params.limit,
        offset: params.offset,
        role: params.role,
      },
    })
    return data.data
  },

  async getOverview(userId: string): Promise<CustomerOverview> {
    const { data } = await apiClient.get(`/admin/users/${userId}/overview`)
    return data.data
  },

  async listNotes(userId: string): Promise<CustomerAdminNote[]> {
    const { data } = await apiClient.get(`/admin/users/${userId}/notes`)
    return data.data
  },

  async createNote(userId: string, body: string, pinned = false): Promise<CustomerAdminNote> {
    const { data } = await apiClient.post(`/admin/users/${userId}/notes`, { body, pinned })
    return data.data
  },

  async updateNote(
    noteId: string,
    patch: { body?: string; pinned?: boolean },
  ): Promise<CustomerAdminNote> {
    const { data } = await apiClient.patch(`/admin/notes/${noteId}`, patch)
    return data.data
  },

  async deleteNote(noteId: string): Promise<void> {
    await apiClient.delete(`/admin/notes/${noteId}`)
  },
}
