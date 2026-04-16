import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronRight } from 'lucide-react'
import { customersRepository } from '@/features/manage-customers'
import { CustomerAvatar } from '@/features/manage-customers'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table'
import { formatDate } from '@/shared/lib/utils'

const PAGE_SIZE = 25

/**
 * Customers list page (Tier Plataforma P.1). Reemplaza gradualmente a
 * `/users`: muestra la misma tabla pero con búsqueda del servidor (ILIKE
 * + match exacto de DNI) y cada fila navega al Customer 360.
 *
 * El query vive en `?q=` para que se pueda compartir la URL y el filtro
 * sobreviva al refresh.
 */
export function CustomersPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const initialQuery = params.get('q') ?? ''
  const [input, setInput] = useState(initialQuery)
  const [debounced, setDebounced] = useState(initialQuery)

  // Debounce del input para no spamear el backend mientras el admin tipea.
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(input.trim()), 250)
    return () => clearTimeout(handle)
  }, [input])

  // Sincroniza ?q= con el debounced query. Sólo lo persistimos cuando hay
  // texto; así la URL queda limpia en el estado inicial.
  useEffect(() => {
    if (debounced) {
      setParams({ q: debounced }, { replace: true })
    } else if (params.has('q')) {
      setParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ['admin', 'customers', 'search', debounced],
    queryFn: () =>
      customersRepository.search({
        query: debounced,
        limit: PAGE_SIZE,
        offset: 0,
        role: 'CLIENT',
      }),
    placeholderData: previous => previous,
  })

  const items = data?.items ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Vista unificada del cliente (Customer 360) — haz clic en una fila para ver detalle.
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {isFetching ? 'Buscando…' : `${data?.total ?? 0} resultado(s)`}
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, DNI o teléfono…"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="pl-9"
          autoFocus
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              {debounced ? 'Sin coincidencias.' : 'No hay clientes registrados.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(user => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/customers/${user.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <CustomerAvatar
                          userId={user.id}
                          firstName={user.firstName}
                          lastName={user.lastName}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user.dni}</TableCell>
                    <TableCell className="text-sm">{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isSuspended ? 'destructive' : 'secondary'}>
                        {user.isSuspended ? 'Suspendido' : 'Activo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
