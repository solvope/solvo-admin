import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { formatCurrency, formatDateTime } from '@/shared/lib/utils'
import type { CustomerCreditScore } from '@/entities/customer'

interface Props {
  score: CustomerCreditScore | null
}

const RISK_COLOR: Record<string, string> = {
  LOW:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  HIGH:   'bg-rose-100 text-rose-700 border-rose-200',
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="text-sm">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  )
}

export function ScoringTab({ score }: Props) {
  if (!score) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Este cliente aún no tiene evaluación de scoring.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Última evaluación</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Field label="Score interno" value={<span className="text-2xl font-bold">{score.internalScore}</span>} />
          <Field label="Score externo" value={score.externalScore ?? '—'} />
          <Field
            label="Nivel de riesgo"
            value={<Badge variant="outline" className={RISK_COLOR[score.riskLevel] ?? ''}>{score.riskLevel}</Badge>}
          />
          <Field label="Estrategia" value={<code className="text-xs">{score.scoringStrategy}</code>} />
          <Field label="Deuda total" value={formatCurrency(score.totalDebt)} />
          <Field label="Préstamos pagados" value={score.paidLoansCount} />
          <Field
            label="Rechazo automático"
            value={
              score.autoRejected ? (
                <Badge variant="destructive">Sí</Badge>
              ) : (
                <Badge variant="secondary">No</Badge>
              )
            }
          />
          <Field label="Evaluado" value={formatDateTime(score.evaluatedAt)} />
        </CardContent>
      </Card>

      {score.factors && Object.keys(score.factors).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Factores del modelo</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-80">
              {JSON.stringify(score.factors, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
