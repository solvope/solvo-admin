import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import type { Loan, LoanStatus } from '@/entities/customer'

interface Props {
  loans: Loan[]
}

const STATUS_BADGE: Record<LoanStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  PENDING:    { label: 'Pendiente',  variant: 'outline' },
  APPROVED:   { label: 'Aprobado',   variant: 'secondary', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  REJECTED:   { label: 'Rechazado',  variant: 'destructive' },
  SIGNED:     { label: 'Firmado',    variant: 'secondary', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  DISBURSED:  { label: 'Desembolsado', variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ACTIVE:     { label: 'Activo',     variant: 'secondary', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  OVERDUE:    { label: 'En mora',    variant: 'destructive' },
  PAID:       { label: 'Pagado',     variant: 'secondary', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  CANCELLED:  { label: 'Cancelado',  variant: 'outline' },
}

export function LoansTab({ loans }: Props) {
  if (loans.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Este cliente no tiene préstamos registrados.
        </CardContent>
      </Card>
    )
  }

  const sorted = [...loans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Préstamo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Tasa</TableHead>
              <TableHead>Plazo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Vence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(loan => {
              const cfg = STATUS_BADGE[loan.status]
              return (
                <TableRow key={loan.id}>
                  <TableCell className="font-mono text-xs">{loan.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(loan.amount)}</TableCell>
                  <TableCell>{formatCurrency(loan.totalAmount)}</TableCell>
                  <TableCell className="text-sm">{(loan.interestRate * 100).toFixed(2)}%</TableCell>
                  <TableCell className="text-sm">{loan.termDays} días</TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant} className={cfg.className}>{cfg.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(loan.createdAt)}</TableCell>
                  <TableCell className="text-sm">{loan.dueDate ? formatDate(loan.dueDate) : '—'}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
