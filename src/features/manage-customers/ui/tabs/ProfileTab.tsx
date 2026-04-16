import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { formatDateTime } from '@/shared/lib/utils'
import type { CustomerOverview } from '@/entities/customer'

interface Props {
  user: CustomerOverview['user']
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="text-sm">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  )
}

export function ProfileTab({ user }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos personales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Field label="Nombres" value={user.firstName} />
          <Field label="Apellidos" value={user.lastName} />
          <Field label="DNI" value={<span className="font-mono">{user.dni}</span>} />
          <Field label="Teléfono" value={<span className="font-mono">{user.phone}</span>} />
          <Field label="Email" value={<span className="break-all">{user.email}</span>} />
          <Field
            label="Email verificado"
            value={
              <Badge variant={user.emailVerified ? 'secondary' : 'outline'}>
                {user.emailVerified ? 'Sí' : 'No'}
              </Badge>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Field label="ID de usuario" value={<span className="font-mono text-xs break-all">{user.id}</span>} />
          <Field label="Rol" value={<Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>{user.role}</Badge>} />
          <Field
            label="Estado KYC"
            value={<Badge variant="outline">{user.status}</Badge>}
          />
          <Field
            label="Estado cuenta"
            value={
              <Badge variant={user.isSuspended ? 'destructive' : 'secondary'}>
                {user.isSuspended ? 'Suspendido' : 'Activo'}
              </Badge>
            }
          />
          <Field label="Identidad verificada" value={user.isIdentityVerified ? 'Sí' : 'No'} />
          <Field label="Registro" value={formatDateTime(user.createdAt)} />
        </CardContent>
      </Card>

      {(user.selfieUrl || user.dniFrontUrl || user.dniBackUrl) && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Documentos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <DocumentTile label="Selfie" url={user.selfieUrl} />
            <Separator className="sm:hidden" />
            <DocumentTile label="DNI (frontal)" url={user.dniFrontUrl} />
            <Separator className="sm:hidden" />
            <DocumentTile label="DNI (reverso)" url={user.dniBackUrl} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DocumentTile({ label, url }: { label: string; url?: string }) {
  if (!url) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
        <div className="aspect-video rounded-md border border-dashed bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
          Sin documento
        </div>
      </div>
    )
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex flex-col gap-1 group">
      <p className="text-xs font-medium text-muted-foreground uppercase group-hover:text-foreground transition-colors">
        {label}
      </p>
      <div className="aspect-video rounded-md border bg-muted overflow-hidden">
        <img
          src={url}
          alt={label}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
    </a>
  )
}
