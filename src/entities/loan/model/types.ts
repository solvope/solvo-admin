export interface Loan {
  id: string
  userId: string
  amount: number
  totalAmount: number
  currency: string
  termDays: number
  interestRate: number
  tier: string
  status: LoanStatus
  dueDate?: string
  contractUrl?: string
  rejectionReason?: string
  disbursedAt?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    dni: string
    phone: string
  }
}

export type LoanStatus =
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SIGNED'
  | 'DISBURSED' | 'ACTIVE' | 'OVERDUE' | 'PAID' | 'CANCELLED'

export interface DashboardStats {
  totalLoans: number
  pendingLoans: number
  activeLoans: number
  overdueLoans: number
  paidLoans: number
  rejectedLoans: number
  totalDisbursed: number
  totalUsers: number
}
