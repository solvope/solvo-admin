import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table'
import { formatDateTime } from '@/shared/lib/utils'
import type { CustomerAuditLogEntry } from '@/entities/customer'

interface Props {
  entries: CustomerAuditLogEntry[]
}

const ROLE_BADGE: Record<string, { label: string; className?: string }> = {
  USER:   { label: 'Usuario',  className: 'bg-blue-100 text-blue-700 border-blue-200' },
  ADMIN:  { label: 'Admin',    className: 'bg-purple-100 text-purple-700 border-purple-200' },
  SYSTEM: { label: 'Sistema',  className: 'bg-slate-100 text-slate-700 border-slate-200' },
}

export function AuditLogTab({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Sin eventos registrados para este usuario.
        </CardContent>
      </Card>
    )
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(entry => {
              const role = ROLE_BADGE[entry.actorRole] ?? { label: entry.actorRole }
              return (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDateTime(entry.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={role.className}>{role.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono">{entry.action}</code>
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.entityType} / <span className="font-mono text-xs">{entry.entityId.slice(0, 8)}</span>
                  </TableCell>
                  <TableCell className="max-w-md">
                    {entry.metadata ? (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          ver detalles
                        </summary>
                        <pre className="mt-2 bg-muted p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(entry.metadata, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
