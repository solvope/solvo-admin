import { create } from 'zustand'
import { adminAuthRepository } from '../api/adminAuthRepository'

interface AdminInfo {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AdminAuthState {
  user: AdminInfo | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loadUser: () => void
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  loadUser: () => {
    const token = adminAuthRepository.getToken()
    const user = adminAuthRepository.getStoredUser()
    set({ user, isAuthenticated: !!token && !!user, isLoading: false })
  },
  login: async (email, password) => {
    const { user, token } = await adminAuthRepository.login(email, password)
    adminAuthRepository.saveToken(token)
    adminAuthRepository.saveUser(user)
    set({ user, isAuthenticated: true })
  },
  logout: () => {
    adminAuthRepository.clearToken()
    adminAuthRepository.clearUser()
    set({ user: null, isAuthenticated: false })
  },
}))
