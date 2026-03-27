import { apiClient } from '@/shared/api/client'
import type { FinancialParameter, ParametersByCategory } from '@/entities/parameters/model/types'

export const adminParametersRepository = {
  async getAll(): Promise<ParametersByCategory> {
    const { data } = await apiClient.get('/admin/parameters')
    return data.data
  },

  async update(key: string, value: number): Promise<FinancialParameter> {
    const { data } = await apiClient.put(`/admin/parameters/${key}`, { value })
    return data.data
  },
}
