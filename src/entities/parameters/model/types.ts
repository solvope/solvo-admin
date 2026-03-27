export interface FinancialParameter {
  key: string
  value: number
  description: string
  category: string
  isEditable: boolean
  updatedAt: string
}

export type ParametersByCategory = Record<string, FinancialParameter[]>

export const CATEGORY_LABELS: Record<string, string> = {
  tasa: 'Tasas de interés',
  comision: 'Comisiones de desembolso',
  mora: 'Mora y cobranza',
  fase: 'Fase activa y productos',
}
