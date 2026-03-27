import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Save, Lock, Info } from 'lucide-react'
import { adminParametersRepository } from '@/features/manage-parameters/api/adminParametersRepository'
import { type FinancialParameter, CATEGORY_LABELS } from '@/entities/parameters/model/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'

function ParameterRow({ param }: { param: FinancialParameter }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(String(param.value))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const parsed = parseFloat(inputValue)
    if (isNaN(parsed)) {
      toast.error('Ingresa un número válido')
      return
    }
    setSaving(true)
    try {
      await adminParametersRepository.update(param.key, parsed)
      toast.success(`"${param.key}" actualizado a ${parsed}`)
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'parameters'] })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setInputValue(String(param.value))
    setEditing(false)
  }

  const displayValue = () => {
    if (param.key.startsWith('TEA_') || param.key.startsWith('BCRP_MAX_TEA')) {
      return `${(param.value * 100).toFixed(2)}% TEA`
    }
    if (param.key === 'BCRP_MAX_MORA_ADDITIONAL') {
      return `${(param.value * 100).toFixed(2)}% TEA adicional`
    }
    if (param.key === 'ACTIVE_PHASE') {
      return `Fase ${param.value}`
    }
    if (param.key.endsWith('_FEE')) {
      return `S/ ${param.value}`
    }
    if (param.key.endsWith('_DAYS') || param.key.endsWith('_MAX')) {
      return `${param.value}`
    }
    return `${param.value}`
  }

  return (
    <div className="flex items-start gap-4 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-mono text-muted-foreground">{param.key}</span>
          {!param.isEditable && (
            <Badge variant="outline" className="text-xs gap-1 py-0">
              <Lock className="h-2.5 w-2.5" /> Solo lectura
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{param.description}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {editing ? (
          <>
            <Input
              type="number"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-32 h-8 text-sm"
              autoFocus
            />
            <Button size="sm" className="h-8" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <span className="text-sm font-medium tabular-nums">{displayValue()}</span>
            {param.isEditable && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setEditing(true)}
              >
                Editar
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function ParametersPage() {
  const { data: paramsByCategory, isLoading, isError } = useQuery({
    queryKey: ['admin', 'parameters'],
    queryFn: adminParametersRepository.getAll,
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parametrías financieras</h1>
          <p className="text-muted-foreground text-sm mt-1">Configura tasas, comisiones, mora y fase activa sin necesidad de redespliegue.</p>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => <Skeleton key={j} className="h-10 w-full" />)}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError || !paramsByCategory) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <Info className="h-8 w-8" />
        <p>No se pudieron cargar los parámetros.</p>
      </div>
    )
  }

  const orderedCategories = ['tasa', 'comision', 'mora', 'fase']
  const categories = [...new Set([...orderedCategories, ...Object.keys(paramsByCategory)])]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parametrías financieras</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configura tasas, comisiones, mora y fase activa sin necesidad de redespliegue.
          Los cambios aplican en máximo 5 minutos.
        </p>
      </div>

      {categories.map((category) => {
        const params = paramsByCategory[category]
        if (!params || params.length === 0) return null
        return (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {CATEGORY_LABELS[category] ?? category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {params.map((param) => (
                <ParameterRow key={param.key} param={param} />
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
