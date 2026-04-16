import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, RefreshCw, Clock, AlertTriangle, Sparkles } from 'lucide-react'
import { adminLoansRepository } from '@/features/manage-loans/api/adminLoansRepository'
import { StatsGrid } from '@/widgets/stats-grid'
import { LoanStatusBadge } from '@/entities/loan'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import { formatCurrency, formatDate, getDaysOverdue } from '@/shared/lib/utils'
import { useAdminAuthStore } from '@/features/admin-auth'

export function DashboardPage() {
  const { user } = useAdminAuthStore()
  const {
    data: stats,
    isLoading: statsLoading,
    refetch,
    isRefetching,
  } = useQuery({
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

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* ─── Hero header ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-navy text-white p-6 lg:p-8">
        <div className="absolute inset-0 bg-grid-navy opacity-50" />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-secondary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-brand-accent/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-brand-accent tracking-wider uppercase">
              {today}
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {greeting}, {user?.firstName ?? 'Admin'}.
            </h1>
            <p className="text-sm text-white/60 max-w-md">
              Acá tenés el resumen de hoy: pendientes de revisión, mora y métricas globales.
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="bg-white/10 text-white border border-white/15 hover:bg-white/15 backdrop-blur-sm"
          >
            <RefreshCw className={isRefetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* ─── Stats ─────────────────────────────────────────────────────── */}
      <StatsGrid stats={stats} isLoading={statsLoading} />

      {/* ─── Two side-by-side action lists ────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Pending review */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-base">Pendientes de revisión</CardTitle>
                {pending && pending.length > 0 && (
                  <Badge variant="warning" className="ml-1">{pending.length}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground pl-9">
                Préstamos esperando aprobación manual
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-brand-accent hover:text-brand-accent hover:bg-brand-accent/10">
              <Link to="/loans/pending" className="gap-1">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {pendingLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))
            ) : pending?.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="h-5 w-5 text-emerald-500" />}
                text="Sin préstamos pendientes"
                tone="success"
              />
            ) : (
              pending?.slice(0, 5).map(loan => (
                <Link
                  key={loan.id}
                  to={`/loans/pending`}
                  className="flex items-center justify-between p-3 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {loan.user?.firstName} {loan.user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(loan.amount)} · {loan.termDays} días
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3 space-y-0.5">
                    <LoanStatusBadge status={loan.status} />
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(loan.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                </div>
                <CardTitle className="text-base">Préstamos en mora</CardTitle>
                {overdue && overdue.length > 0 && (
                  <Badge variant="destructive" className="ml-1">{overdue.length}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground pl-9">
                Cuotas vencidas pendientes de cobro
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-brand-accent hover:text-brand-accent hover:bg-brand-accent/10">
              <Link to="/loans/overdue" className="gap-1">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {overdueLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))
            ) : overdue?.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="h-5 w-5 text-emerald-500" />}
                text="Sin préstamos en mora"
                tone="success"
              />
            ) : (
              overdue?.slice(0, 5).map(loan => (
                <Link
                  key={loan.id}
                  to={`/loans/overdue`}
                  className="flex items-center justify-between p-3 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {loan.user?.firstName} {loan.user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(loan.amount)} · {loan.user?.phone ?? 'Sin teléfono'}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-destructive">
                      {loan.dueDate ? `${getDaysOverdue(loan.dueDate)}d` : '—'}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      en mora
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmptyState({
  icon,
  text,
  tone = 'neutral',
}: Readonly<{ icon: React.ReactNode; text: string; tone?: 'neutral' | 'success' }>) {
  return (
    <div className={`flex items-center justify-center gap-2 py-8 ${tone === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}
