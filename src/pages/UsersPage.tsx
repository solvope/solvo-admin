import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, Loader2 } from 'lucide-react'
import { adminUsersRepository } from '@/features/manage-loans/api/adminLoansRepository'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table'
import { formatDate } from '@/shared/lib/utils'

export function UsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [suspendLoading, setSuspendLoading] = useState<string | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminUsersRepository.getAll,
  })

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(u =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.dni.includes(q)
    )
  }, [users, search])

  const handleSuspend = async (userId: string) => {
    setSuspendLoading(userId)
    try {
      await adminUsersRepository.suspend(userId)
      toast.success('Usuario suspendido')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    } catch {
      toast.error('Error al suspender usuario')
    } finally {
      setSuspendLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <span className="text-sm text-muted-foreground">{filtered.length} usuarios</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email o DNI..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No se encontraron usuarios</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user.dni}</TableCell>
                    <TableCell className="text-sm">{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant={user.isIdentityVerified ? 'secondary' : 'outline'}>
                        {user.isIdentityVerified ? 'Verificado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isSuspended ? 'destructive' : 'secondary'}>
                        {user.isSuspended ? 'Suspendido' : 'Activo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      {user.role !== 'ADMIN' && !user.isSuspended && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleSuspend(user.id)}
                          disabled={!!suspendLoading}
                        >
                          {suspendLoading === user.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : 'Suspender'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
