import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table'
import { formatDateTime } from '@/shared/lib/utils'
import type { CustomerKyc } from '@/entities/customer'

interface Props {
  kycVerifications: CustomerKyc[]
}

const STATUS_COLOR: Record<string, string> = {
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
  PENDING:  'bg-amber-100 text-amber-700 border-amber-200',
  EXPIRED:  'bg-slate-100 text-slate-700 border-slate-200',
}

export function KycTab({ kycVerifications }: Props) {
  if (kycVerifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Sin verificaciones de identidad.
        </CardContent>
      </Card>
    )
  }

  const sorted = [...kycVerifications].sort((a, b) => b.attemptNumber - a.attemptNumber)

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Intento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Truora score</TableHead>
              <TableHead>Motivo rechazo</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Resuelto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(kyc => (
              <TableRow key={kyc.id}>
                <TableCell className="font-medium">#{kyc.attemptNumber}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={STATUS_COLOR[kyc.status] ?? ''}>
                    {kyc.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{kyc.verificationMethod ?? '—'}</TableCell>
                <TableCell className="font-mono text-sm">
                  {kyc.truoraScore !== undefined ? kyc.truoraScore.toFixed(2) : '—'}
                </TableCell>
                <TableCell className="text-sm max-w-xs truncate" title={kyc.rejectionReason}>
                  {kyc.rejectionReason ?? '—'}
                </TableCell>
                <TableCell className="text-sm">{formatDateTime(kyc.createdAt)}</TableCell>
                <TableCell className="text-sm">
                  {kyc.resolvedAt ? formatDateTime(kyc.resolvedAt) : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
