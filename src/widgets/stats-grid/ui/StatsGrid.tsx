import { LayoutList, Clock, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Users } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCurrency } from '@/shared/lib/utils'
import type { DashboardStats } from '@/entities/loan'

interface Props {
  stats?: DashboardStats
  isLoading: boolean
}

const STAT_ITEMS = [
  { key: 'totalLoans', label: 'Total préstamos', icon: LayoutList, color: 'text-primary', bg: 'bg-primary/10' },
  { key: 'pendingLoans', label: 'Pendientes', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/20' },
  { key: 'activeLoans', label: 'Activos', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  { key: 'overdueLoans', label: 'En mora', icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  { key: 'paidLoans', label: 'Pagados', icon: CheckCircle, color: 'text-secondary', bg: 'bg-secondary/10' },
  { key: 'totalUsers', label: 'Usuarios', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
] as const

export function StatsGrid({ stats, isLoading }: Readonly<Props>) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={`stat-${i}`}><CardContent className="p-5"><Skeleton className="h-16" /></CardContent></Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {STAT_ITEMS.map(({ key, label, icon: Icon, color, bg }) => {
        const value = stats?.[key] ?? 0
        return (
          <Card key={key}>
            <CardContent className="p-5 flex items-start gap-4">
              <div className={`rounded-lg p-2.5 ${bg} shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
      {stats && (
        <Card className="col-span-2 md:col-span-3">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-lg p-2.5 bg-secondary/10 shrink-0">
              <DollarSign className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalDisbursed ?? 0)}</p>
              <p className="text-sm text-muted-foreground">Total desembolsado</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
