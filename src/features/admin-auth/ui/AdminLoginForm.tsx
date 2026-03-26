import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useAdminAuthStore } from '../model/useAdminAuthStore'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type LoginInput = z.infer<typeof schema>

export function AdminLoginForm() {
  const navigate = useNavigate()
  const { login } = useAdminAuthStore()
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: LoginInput) => {
    try {
      await login(values.email, values.password)
      navigate('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Credenciales incorrectas')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-sidebar items-center justify-center p-12">
        <div className="text-sidebar-foreground max-w-xs">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Solvo</h1>
              <p className="text-sm opacity-70">Panel de Administración</p>
            </div>
          </div>
          <div className="space-y-4 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary" />
              <span>Gestión de préstamos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary" />
              <span>Revisión y aprobación manual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary" />
              <span>Control de usuarios</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary" />
              <span>Estadísticas en tiempo real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Acceso Administrador</h2>
            <p className="text-muted-foreground mt-1 text-sm">Solo personal autorizado de Solvo</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="admin@solvo.pe" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" {...register('password')} className="pr-10" />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Verificando...</> : 'Iniciar sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
