import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table'
import { formatDate } from '@/shared/lib/utils'
import type { CustomerComplaint, CustomerSauTicket } from '@/entities/customer'

interface Props {
  complaints: CustomerComplaint[]
  sauTickets: CustomerSauTicket[]
}

/**
 * Un solo tab muestra reclamos INDECOPI y tickets SAU: son canales distintos
 * pero desde la óptica del cliente son "atención al cliente". Los separamos
 * con un rótulo por sección.
 */
export function ComplaintsTab({ complaints, sauTickets }: Props) {
  const hasNone = complaints.length === 0 && sauTickets.length === 0

  if (hasNone) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Sin reclamos ni tickets SAU.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Section title="Libro de Reclamaciones (INDECOPI)" count={complaints.length}>
        {complaints.length === 0 ? (
          <EmptyRow label="Sin reclamos formales." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Presentado</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Respondido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.claimCode}</TableCell>
                  <TableCell className="text-sm">{c.category}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate" title={c.subject}>
                    {c.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(c.filedAt)}</TableCell>
                  <TableCell className="text-sm">{formatDate(c.slaDeadline)}</TableCell>
                  <TableCell className="text-sm">{c.respondedAt ? formatDate(c.respondedAt) : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      <Section title="Tickets SAU (SBS)" count={sauTickets.length}>
        {sauTickets.length === 0 ? (
          <EmptyRow label="Sin tickets SAU." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Presentado</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Respondido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sauTickets.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.ticketCode}</TableCell>
                  <TableCell className="text-sm">{t.category}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate" title={t.subject}>
                    {t.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(t.filedAt)}</TableCell>
                  <TableCell className="text-sm">{formatDate(t.slaDeadline)}</TableCell>
                  <TableCell className="text-sm">{t.respondedAt ? formatDate(t.respondedAt) : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>
    </div>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Badge variant="outline">{count}</Badge>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function EmptyRow({ label }: { label: string }) {
  return <p className="px-4 py-8 text-center text-sm text-muted-foreground">{label}</p>
}
