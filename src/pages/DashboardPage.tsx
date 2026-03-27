import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { adminLoansRepository } from '@/features/manage-loans/api/adminLoansRepository'
import { StatsGrid } from '@/widgets/stats-grid'
import { LoanStatusBadge } from '@/entities/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCurrency, formatDate, formatDateTime, getDaysOverdue } from '@/shared/lib/utils'
import { useAdminAuthStore } from '@/features/admin-auth'

export function DashboardPage() {
  const { user } = useAdminAuthStore()
  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminLoansRepository.getDashboardStats,
  })
  const { data: pending, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin', 'loans', 'pending'],
    queryFn: adminLoansRepository.getPendingLoans,
  })
  const { data: overdue, isLoading: overdueLoading } = useQuery({
    queryKey: ['admin', 'loans', 'overdue'],
    queryFn: adminLoansRepository.getOverdueLoans,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Bienvenido, {user?.firstName} · {formatDateTime(new Date())}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <StatsGrid stats={stats} isLoading={statsLoading} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending loans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Pendientes de revisión</CardTitle>
            <Link to="/loans/pending" className="text-xs text-primary flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)
            ) : pending?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">🎉 Sin préstamos pendientes</p>
            ) : (
              pending?.slice(0, 5).map(loan => (
                <div key={loan.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{loan.user?.firstName} {loan.user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(loan.amount)} · {loan.termDays} días</p>
                  </div>
                  <div className="text-right">
                    <LoanStatusBadge status={loan.status} />
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(loan.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Overdue loans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Préstamos en mora</CardTitle>
            <Link to="/loans/overdue" className="text-xs text-primary flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)
            ) : overdue?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">✅ Sin préstamos en mora</p>
            ) : (
              overdue?.slice(0, 5).map(loan => (
                <div key={loan.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{loan.user?.firstName} {loan.user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(loan.amount)} · {loan.user?.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-destructive">
                      {loan.dueDate ? `${getDaysOverdue(loan.dueDate)} días` : '—'}
                    </span>
                    <p className="text-xs text-muted-foreground">en mora</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
