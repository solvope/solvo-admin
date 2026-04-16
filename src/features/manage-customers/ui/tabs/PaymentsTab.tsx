import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table'
import { formatCurrency, formatDateTime } from '@/shared/lib/utils'
import type { CustomerPayment } from '@/entities/customer'

interface Props {
  payments: CustomerPayment[]
}

export function PaymentsTab({ payments }: Props) {
  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Sin pagos registrados.
        </CardContent>
      </Card>
    )
  }

  const total = payments
    .filter(p => p.status === 'COMPLETED' || p.status === 'CONFIRMED')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs uppercase text-muted-foreground">Total pagado</p>
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          <p className="text-xs text-muted-foreground mt-1">{payments.length} movimiento(s) en total</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Préstamo</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Referencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{formatDateTime(p.paidAt ?? p.createdAt)}</TableCell>
                  <TableCell className="font-mono text-xs">{p.loanId.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(p.amount))}</TableCell>
                  <TableCell className="text-sm">{p.method ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.reference ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
