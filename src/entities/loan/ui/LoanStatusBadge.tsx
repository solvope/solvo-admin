import { Badge } from '@/shared/ui/badge'
import { LOAN_STATUS_LABELS } from '@/shared/lib/constants'
import type { LoanStatus } from '../model/types'

const VARIANT_MAP: Record<LoanStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'warning'> = {
  PENDING: 'warning', APPROVED: 'default', REJECTED: 'destructive',
  SIGNED: 'secondary', DISBURSED: 'secondary', ACTIVE: 'default',
  OVERDUE: 'destructive', PAID: 'secondary', CANCELLED: 'outline',
}

export function LoanStatusBadge({ status }: Readonly<{ status: LoanStatus }>) {
  return <Badge variant={VARIANT_MAP[status] ?? 'outline'}>{LOAN_STATUS_LABELS[status] ?? status}</Badge>
}
