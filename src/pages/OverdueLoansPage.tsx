import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, Phone } from 'lucide-react'
import { adminLoansRepository } from '@/features/manage-loans/api/adminLoansRepository'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table'
import { formatCurrency, formatDate, getDaysOverdue } from '@/shared/lib/utils'

export function OverdueLoansPage() {
  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['admin', 'loans', 'overdue'],
    queryFn: adminLoansRepository.getOverdueLoans,
    select: (data) => [...data].sort((a, b) => {
      const da = a.dueDate ? getDaysOverdue(a.dueDate) : 0
      const db = b.dueDate ? getDaysOverdue(b.dueDate) : 0
      return db - da
    }),
  })

  const handleContact = (phone: string) => {
    toast.info(`Teléfono: ${phone}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Préstamos en Mora</h1>
        <Badge variant="destructive">{loans.length}</Badge>
      </div>

      {loans.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">
            Hay <strong>{loans.length}</strong> préstamo{loans.length !== 1 ? 's' : ''} en mora que requieren atención inmediata.
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : loans.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin préstamos en mora</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Monto original</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Días en mora</TableHead>
                  <TableHead>Contacto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map(loan => {
                  const days = loan.dueDate ? getDaysOverdue(loan.dueDate) : 0
                  return (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <p className="font-medium">{loan.user?.firstName} {loan.user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{loan.user?.email}</p>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(loan.amount)}</TableCell>
                      <TableCell className="text-sm">{loan.dueDate ? formatDate(loan.dueDate) : '—'}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${days > 30 ? 'text-destructive' : days > 15 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                          {days} días
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContact(loan.user?.phone ?? '')}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          {loan.user?.phone}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
