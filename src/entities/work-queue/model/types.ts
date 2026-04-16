/**
 * Tipos del Work Queue unificado (Tier Plataforma P.2).
 *
 * Espejo de los DTOs del backend en `src/application/admin/dtos/WorkQueueDTO.ts`.
 * Mantenerlos sincronizados a mano porque son pocos campos y queremos
 * libertad de proyección en UI sin arrastrar los DTOs pesados del backend.
 */

export type WorkItemType =
  | 'pending_loans'
  | 'overdue_loans'
  | 'pending_kyc'
  | 'complaints'
  | 'sau_tickets'
  | 'plaft_pending'

export type WorkItemSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface WorkItem {
  id: string
  type: WorkItemType
  title: string
  subtitle: string
  userId?: string
  createdAt: string
  slaDeadline?: string
  severity?: WorkItemSeverity
  url: string
}

export interface WorkQueueCounts {
  pendingLoans: number
  overdueLoans: number
  pendingKyc: number
  openComplaints: number
  openSauTickets: number
  plaftPending: number
  plaftUnreported: number
  total: number
}

export interface WorkItemsPage {
  items: WorkItem[]
  total: number
  type: WorkItemType
}
