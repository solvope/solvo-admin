import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ChevronRight, Clock } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { formatDate, formatDateTime } from '@/shared/lib/utils'
import type { WorkItem, WorkItemSeverity } from '@/entities/work-queue'

const SEVERITY_STYLE: Record<WorkItemSeverity, string> = {
  LOW:      'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM:   'bg-amber-100 text-amber-700 border-amber-200',
  HIGH:     'bg-orange-100 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
}

const SEVERITY_LABEL: Record<WorkItemSeverity, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

interface Props {
  item: WorkItem
}

/**
 * Una fila del Work Queue. Indicador de SLA vencido cuando la fecha límite
 * regulatoria ya pasó y el ítem sigue en cola — caso típico en INDECOPI/SAU.
 * Navegamos usando la URL que resolvió el backend para no duplicar el mapa
 * tipo → ruta en dos lados.
 */
export function WorkItemRow({ item }: Props) {
  const navigate = useNavigate()
  const isOverdueSla = item.slaDeadline ? new Date(item.slaDeadline) < new Date() : false

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(item.url)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(item.url)
        }
      }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b last:border-b-0',
        'cursor-pointer hover:bg-muted/50 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate">{item.title}</p>
          {item.severity && (
            <Badge variant="outline" className={cn('text-xs', SEVERITY_STYLE[item.severity])}>
              {SEVERITY_LABEL[item.severity]}
            </Badge>
          )}
          {isOverdueSla && (
            <Badge variant="destructive" className="gap-1 text-xs">
              <AlertTriangle className="h-3 w-3" />
              SLA vencido
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Ingresó {formatDateTime(item.createdAt)}
          </span>
          {item.slaDeadline && (
            <span>
              SLA hasta {formatDate(item.slaDeadline)}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  )
}
