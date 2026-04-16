import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Eye, EyeOff, Loader2, ShieldCheck, Zap,
  CheckCircle2, Lock, Users, BarChart3, FileSearch,
} from 'lucide-react'
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

const CAPABILITIES = [
  { icon: Users, label: 'Gestión de clientes y préstamos' },
  { icon: FileSearch, label: 'Revisión KYC y aprobación manual' },
  { icon: BarChart3, label: 'Métricas y cola de trabajo unificada' },
  { icon: Lock, label: 'Cumplimiento PLAFT y auditoría' },
] as const

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
    <div className="min-h-screen flex bg-brand-surface">
      {/* ─── Left panel: navy hero ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-navy">
        {/* Decorative grid + glow */}
        <div className="absolute inset-0 bg-grid-navy opacity-60" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-secondary/10 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-brand-accent/10 blur-3xl animate-pulse-glow" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-secondary to-brand-secondary-hover flex items-center justify-center glow-gold">
              <Zap className="h-5 w-5 text-brand-primary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">Crevo</p>
              <p className="text-xs text-white/50 tracking-wider uppercase">Admin Panel</p>
            </div>
          </div>

          {/* Hero copy */}
          <div className="space-y-8 max-w-md">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-accent" />
                <span className="text-xs font-medium text-brand-accent">Acceso restringido</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
                Operá Crevo con
                <br />
                <span className="text-gradient-brand">precisión total.</span>
              </h2>
              <p className="text-base text-white/60 leading-relaxed">
                El centro de control para revisión de préstamos, KYC, cumplimiento
                regulatorio y atención al usuario.
              </p>
            </div>

            <div className="space-y-3">
              {CAPABILITIES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand-accent/10 group-hover:border-brand-accent/30 transition-colors">
                    <Icon className="h-4 w-4 text-brand-accent" />
                  </div>
                  <span className="text-sm text-white/80">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-xs text-white/40">
            <CheckCircle2 className="h-3.5 w-3.5 text-brand-accent" />
            Sesión protegida con cookies HttpOnly + CSRF double-submit
          </div>
        </div>
      </div>

      {/* ─── Right panel: form ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-secondary to-brand-secondary-hover flex items-center justify-center glow-gold">
              <Zap className="h-5 w-5 text-brand-primary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-brand-primary dark:text-brand-text">Crevo</p>
              <p className="text-[10px] text-brand-text-muted tracking-wider uppercase">Admin Panel</p>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground">
              Solo personal autorizado de Crevo. Cada acción queda registrada en auditoría.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@crevo.pe"
                autoComplete="username"
                className="h-11"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verificando...
                </>
              ) : (
                'Acceder al panel'
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              ¿Problemas para acceder? Contactá al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
