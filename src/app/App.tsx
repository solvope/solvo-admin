import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { Providers } from './providers'
import { AppRoutes } from './routes'
import { useAdminAuthStore } from '@/features/admin-auth'

function AppInit({ children }: Readonly<{ children: React.ReactNode }>) {
  const loadUser = useAdminAuthStore(s => s.loadUser)
  useEffect(() => { loadUser() }, [loadUser])
  return <>{children}</>
}

export function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppInit>
          <AppRoutes />
        </AppInit>
      </Providers>
    </BrowserRouter>
  )
}
