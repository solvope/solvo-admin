export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  dni: string
  phone: string
  role: 'CLIENT' | 'ADMIN'
  isSuspended: boolean
  isIdentityVerified: boolean
  emailVerified: boolean
  createdAt: string
}
