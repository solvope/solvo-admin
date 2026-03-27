export type KycUserStatus =
  | 'PENDING_VERIFICATION'
  | 'KYC_UNDER_REVIEW'
  | 'VERIFIED'
  | 'KYC_REJECTED'
  | 'SUSPENDED'

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  dni: string
  phone: string
  role: 'CLIENT' | 'ADMIN'
  status: KycUserStatus
  isSuspended: boolean
  isIdentityVerified: boolean
  emailVerified: boolean
  createdAt: string
}
