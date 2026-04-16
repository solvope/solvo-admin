import {
  LayoutList, Clock, TrendingUp, AlertTriangle,
  CheckCircle, DollarSign, Users,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCurrency } from '@/shared/lib/utils'
import type { DashboardStats } from '@/entities/loan'

interface Props {
  stats?: DashboardStats
  isLoading: boolean
}

interface StatItem {
  key: keyof Omit<DashboardStats, 'totalDisbursed'>
  label: string
  icon: LucideIcon
  /** Tailwind classes for the icon foreground / background tint. */
  iconClass: string
  bgClass: string
}

const STAT_ITEMS: StatItem[] = [
  { key: 'totalLoans',   label: 'Total préstamos', icon: LayoutList,    iconClass: 'text-brand-primary dark:text-brand-secondary', bgClass: 'bg-brand-primary/5 dark:bg-brand-secondary/10' },
  { key: 'pendingLoans', label: 'Pendientes',      icon: Clock,         iconClass: 'text-amber-600 dark:text-amber-400',           bgClass: 'bg-amber-500/10' },
  { key: 'activeLoans',  label: 'Activos',         icon: TrendingUp,    iconClass: 'text-brand-accent',                            bgClass: 'bg-brand-accent/10' },
  { key: 'overdueLoans', label: 'En mora',         icon: AlertTriangle, iconClass: 'text-destructive',                             bgClass: 'bg-destructive/10' },
  { key: 'paidLoans',    label: 'Pagados',         icon: CheckCircle,   iconClass: 'text-emerald-600 dark:text-emerald-400',       bgClass: 'bg-emerald-500/10' },
  { key: 'totalUsers',   label: 'Usuarios',        icon: Users,         iconClass: 'text-brand-secondary',                         bgClass: 'bg-brand-secondary/10' },
]

export function StatsGrid({ stats, isLoading }: Readonly<Props>) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={`stat-${i}`}>
              <CardContent className="p-5">
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-24 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 6-card grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {STAT_ITEMS.map(({ key, label, icon: Icon, iconClass, bgClass }) => {
          const value = stats?.[key] ?? 0
          return (
            <Card
              key={key}
              className="group hover:border-brand-accent/40 hover:shadow-md transition-all"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`rounded-lg p-2.5 ${bgClass} shrink-0 transition-transform group-hover:scale-105`}>
                    <Icon className={`h-4 w-4 ${iconClass}`} strokeWidth={2.25} />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl font-bold tracking-tight">{value.toLocaleString('es-PE')}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Highlight card: total disbursed (full width with brand gradient accent) */}
      {stats && (
        <Card className="relative overflow-hidden border-brand-secondary/20">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-secondary to-brand-accent" />
          <CardContent className="p-6 flex items-center gap-5">
            <div className="rounded-xl p-3 bg-gradient-to-br from-brand-secondary/15 to-brand-accent/10 shrink-0">
              <DollarSign className="h-6 w-6 text-brand-secondary" strokeWidth={2.25} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Total desembolsado
              </p>
              <p className="text-3xl font-bold tracking-tight">
                {formatCurrency(stats.totalDisbursed ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
