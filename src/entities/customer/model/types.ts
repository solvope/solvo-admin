/**
 * Customer 360 — tipos que espeja la respuesta de GetUserOverview del backend.
 *
 * Cada sub-dominio viene pre-serializado por los `toJSON()` de las entidades
 * del dominio. Acá definimos la forma exacta con la que los consumimos en la
 * UI, sin reusar los tipos de cada sub-dominio existente porque podemos querer
 * mostrar subsets distintos con el tiempo.
 */

import type { Loan, LoanStatus } from '@/entities/loan/model/types'
import type { AdminUser, KycUserStatus } from '@/entities/user/model/types'

export interface CustomerPayment {
  id: string
  loanId: string
  userId: string
  amount: number
  method?: string
  status: string
  reference?: string
  paidAt: string
  createdAt: string
}

export interface CustomerKyc {
  id: string
  userId: string
  attemptNumber: number
  status: string
  verificationMethod?: string
  truoraCheckId?: string
  truoraScore?: number
  rejectionReason?: string
  resolvedAt?: string
  createdAt: string
}

export interface CustomerCreditScore {
  id: string
  userId: string
  internalScore: number
  externalScore?: number
  riskLevel: string
  totalDebt: number
  paidLoansCount: number
  scoringStrategy: string
  evaluatedAt: string
  factors?: Record<string, unknown>
  autoRejected?: boolean
}

export interface CustomerBankAccount {
  id: string
  userId: string
  bankCode: string
  accountNumber: string
  accountType: string
  currency: string
  isDefault: boolean
  alias?: string
  createdAt: string
}

export interface CustomerComplaint {
  id: string
  claimCode: string
  userId?: string
  category: string
  subject: string
  status: string
  filedAt: string
  slaDeadline: string
  respondedAt?: string
}

export interface CustomerSauTicket {
  id: string
  ticketCode: string
  userId?: string
  category: string
  subject: string
  status: string
  filedAt: string
  slaDeadline: string
  respondedAt?: string
  assignedTo?: string
}

export interface CustomerAuditLogEntry {
  id: string
  actorId: string | null
  actorRole: 'USER' | 'ADMIN' | 'SYSTEM'
  action: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface CustomerAdminNote {
  id: string
  userId: string
  authorId: string | null
  body: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

/** Respuesta completa del endpoint GET /admin/users/:id/overview. */
export interface CustomerOverview {
  user: AdminUser & {
    selfieUrl?: string
    dniFrontUrl?: string
    dniBackUrl?: string
  }
  loans: Loan[]
  payments: CustomerPayment[]
  kycVerifications: CustomerKyc[]
  latestCreditScore: CustomerCreditScore | null
  bankAccounts: CustomerBankAccount[]
  complaints: CustomerComplaint[]
  sauTickets: CustomerSauTicket[]
  adminNotes: CustomerAdminNote[]
  recentAuditLog: CustomerAuditLogEntry[]
}

/** Resultado paginado de GET /admin/users/search. */
export interface CustomerSearchResult {
  items: AdminUser[]
  total: number
  limit: number
  offset: number
}

// Re-exportamos lo que la UI usa comúnmente para no obligar a todos los
// consumidores a saber exactamente dónde vive cada tipo.
export type { AdminUser, KycUserStatus, Loan, LoanStatus }
