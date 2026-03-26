import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { adminLoansRepository } from '@/features/manage-loans/api/adminLoansRepository'
import { LoanStatusBadge } from '@/entities/loan'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import type { Loan } from '@/entities/loan'

export function PendingLoansPage() {
  const queryClient = useQueryClient()
  const [rejectLoan, setRejectLoan] = useState<Loan | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['admin', 'loans', 'pending'],
    queryFn: adminLoansRepository.getPendingLoans,
  })

  const handleApprove = async (loanId: string) => {
    setActionLoading(loanId + '_approve')
    try {
      await adminLoansRepository.approveLoan(loanId)
      toast.success('Préstamo aprobado')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    } catch {
      toast.error('Error al aprobar el préstamo')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectLoan || !rejectReason.trim()) return
    setActionLoading(rejectLoan.id + '_reject')
    try {
      await adminLoansRepository.rejectLoan(rejectLoan.id, rejectReason)
      toast.success('Préstamo rechazado')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      setRejectLoan(null)
      setRejectReason('')
    } catch {
      toast.error('Error al rechazar el préstamo')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Préstamos Pendientes</h1>
        <Badge variant="warning">{loans.length}</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : loans.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-secondary opacity-50" />
              <p className="font-medium">No hay préstamos pendientes</p>
              <p className="text-sm">Todos los préstamos han sido revisados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Plazo</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map(loan => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <p className="font-medium">{loan.user?.firstName} {loan.user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{loan.user?.email}</p>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{loan.user?.dni}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>{loan.termDays} días</TableCell>
                    <TableCell><Badge variant="outline">{loan.tier}</Badge></TableCell>
                    <TableCell className="text-sm">{formatDate(loan.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(loan.id)}
                          disabled={!!actionLoading}
                        >
                          {actionLoading === loan.id + '_approve'
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <CheckCircle className="h-3 w-3 mr-1" />}
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRejectLoan(loan)}
                          disabled={!!actionLoading}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={!!rejectLoan} onOpenChange={(o) => !o && setRejectLoan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar préstamo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Rechazarás el préstamo de <strong>{rejectLoan?.user?.firstName} {rejectLoan?.user?.lastName}</strong> por <strong>{rejectLoan ? formatCurrency(rejectLoan.amount) : ''}</strong>.
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Motivo del rechazo</label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Explica el motivo del rechazo..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectLoan(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || !!actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Rechazar préstamo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
