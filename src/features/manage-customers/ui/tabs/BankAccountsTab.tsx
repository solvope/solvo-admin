import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table'
import { formatDate } from '@/shared/lib/utils'
import type { CustomerBankAccount } from '@/entities/customer'

interface Props {
  bankAccounts: CustomerBankAccount[]
}

export function BankAccountsTab({ bankAccounts }: Props) {
  if (bankAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Sin cuentas bancarias registradas.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banco</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead>Alias</TableHead>
              <TableHead>Predeterminada</TableHead>
              <TableHead>Creada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bankAccounts.map(acc => (
              <TableRow key={acc.id}>
                <TableCell className="font-medium">{acc.bankCode}</TableCell>
                <TableCell className="font-mono text-sm">{acc.accountNumber}</TableCell>
                <TableCell className="text-sm">{acc.accountType}</TableCell>
                <TableCell className="text-sm">{acc.currency}</TableCell>
                <TableCell className="text-sm">{acc.alias ?? '—'}</TableCell>
                <TableCell>
                  {acc.isDefault && <Badge variant="secondary">Default</Badge>}
                </TableCell>
                <TableCell className="text-sm">{formatDate(acc.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
