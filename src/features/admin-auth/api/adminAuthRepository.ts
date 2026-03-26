import { apiClient, ADMIN_TOKEN_KEY } from '@/shared/api/client'

interface AdminInfo {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface LoginResponse {
  user: AdminInfo
  token: string
}

export const adminAuthRepository = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post('/auth/login', { email, password })
    if (data.data.user.role !== 'ADMIN') {
      throw new Error('No tienes permisos de administrador')
    }
    return data.data
  },
  saveToken(token: string) { localStorage.setItem(ADMIN_TOKEN_KEY, token) },
  clearToken() { localStorage.removeItem(ADMIN_TOKEN_KEY) },
  getToken(): string | null { return localStorage.getItem(ADMIN_TOKEN_KEY) },
  saveUser(user: AdminInfo) { localStorage.setItem('solvo_admin_user', JSON.stringify(user)) },
  clearUser() { localStorage.removeItem('solvo_admin_user') },
  getStoredUser(): AdminInfo | null {
    const raw = localStorage.getItem('solvo_admin_user')
    return raw ? JSON.parse(raw) : null
  },
}
