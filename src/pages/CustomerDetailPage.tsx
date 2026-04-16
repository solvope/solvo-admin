import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, IdCard, Calendar, AlertTriangle } from 'lucide-react'
import {
  customersRepository,
  CustomerAvatar,
  ProfileTab,
  LoansTab,
  PaymentsTab,
  KycTab,
  ScoringTab,
  BankAccountsTab,
  ComplaintsTab,
  AuditLogTab,
  NotesTab,
} from '@/features/manage-customers'
import { useAdminAuthStore } from '@/features/admin-auth'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatDate } from '@/shared/lib/utils'

/**
 * Customer 360 (Tier Plataforma P.1).
 *
 * Un header con datos "de un vistazo" y 9 tabs que agrupan cada sub-dominio
 * del cliente (perfil, préstamos, pagos, KYC, scoring, cuentas bancarias,
 * reclamos/SAU, notas internas, auditoría). Todos los datos vienen en una
 * sola llamada a `GET /admin/users/:id/overview`.
 */
export function CustomerDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentAdmin = useAdminAuthStore(s => s.user)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'customer', id, 'overview'],
    queryFn: () => customersRepository.getOverview(id),
    enabled: Boolean(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BackLink />
        <Skeleton className="h-24" />
        <Skeleton className="h-10 w-full max-w-3xl" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <BackLink />
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
            <p className="font-medium">No se pudo cargar el cliente.</p>
            <p className="text-sm text-muted-foreground">
              {(error as Error)?.message ?? 'Error desconocido.'}
            </p>
            <Button variant="outline" onClick={() => navigate('/customers')}>
              Volver al listado
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { user, loans, payments, kycVerifications, latestCreditScore,
          bankAccounts, complaints, sauTickets, adminNotes, recentAuditLog } = data

  return (
    <div className="space-y-6">
      <BackLink />

      {/* Header */}
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
          <CustomerAvatar
            userId={user.id}
            firstName={user.firstName}
            lastName={user.lastName}
            size="xl"
          />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold truncate">
                {user.firstName} {user.lastName}
              </h1>
              <Badge variant="outline">{user.status}</Badge>
              <Badge variant={user.isSuspended ? 'destructive' : 'secondary'}>
                {user.isSuspended ? 'Suspendido' : 'Activo'}
              </Badge>
              {user.role !== 'CLIENT' && <Badge>{user.role}</Badge>}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <IdCard className="h-3.5 w-3.5" />
                <span className="font-mono">{user.dni}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span className="font-mono">{user.phone}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span className="break-all">{user.email}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Registro {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center md:text-right">
            <Stat label="Préstamos" value={loans.length} />
            <Stat label="Pagos" value={payments.length} />
            <Stat label="Notas" value={adminNotes.length} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-1">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="loans">
            Préstamos
            {loans.length > 0 && <Badge variant="secondary" className="ml-2">{loans.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="payments">
            Pagos
            {payments.length > 0 && <Badge variant="secondary" className="ml-2">{payments.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="kyc">
            KYC
            {kycVerifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">{kycVerifications.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="bank">
            Cuentas
            {bankAccounts.length > 0 && (
              <Badge variant="secondary" className="ml-2">{bankAccounts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="complaints">
            Reclamos / SAU
            {complaints.length + sauTickets.length > 0 && (
              <Badge variant="secondary" className="ml-2">{complaints.length + sauTickets.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notas
            {adminNotes.length > 0 && (
              <Badge variant="secondary" className="ml-2">{adminNotes.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab user={user} />
        </TabsContent>
        <TabsContent value="loans">
          <LoansTab loans={loans} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab payments={payments} />
        </TabsContent>
        <TabsContent value="kyc">
          <KycTab kycVerifications={kycVerifications} />
        </TabsContent>
        <TabsContent value="scoring">
          <ScoringTab score={latestCreditScore} />
        </TabsContent>
        <TabsContent value="bank">
          <BankAccountsTab bankAccounts={bankAccounts} />
        </TabsContent>
        <TabsContent value="complaints">
          <ComplaintsTab complaints={complaints} sauTickets={sauTickets} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesTab
            userId={user.id}
            notes={adminNotes}
            currentAdminId={currentAdmin?.id ?? ''}
          />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogTab entries={recentAuditLog} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      to="/customers"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Volver a clientes
    </Link>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
    </div>
  )
}
