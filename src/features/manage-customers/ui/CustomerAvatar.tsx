import { Avatar, AvatarFallback, avatarColorFromId, initialsFromName } from '@/shared/ui/avatar'
import { cn } from '@/shared/lib/utils'

interface Props {
  userId: string
  firstName: string
  lastName: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_CLASS: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

/**
 * Avatar de cliente con iniciales + color estable derivado del id del usuario.
 * No carga foto: la selfie del KYC es sensible y vive en Storage con acceso
 * firmado; mostrarla en cada fila del listado sería innecesariamente costoso.
 */
export function CustomerAvatar({ userId, firstName, lastName, size = 'md', className }: Props) {
  const colors = avatarColorFromId(userId)
  const initials = initialsFromName(`${firstName} ${lastName}`)

  return (
    <Avatar className={cn(SIZE_CLASS[size], className)}>
      <AvatarFallback
        className="font-semibold"
        style={{ backgroundColor: colors.background, color: colors.foreground }}
      >
        {initials || '?'}
      </AvatarFallback>
    </Avatar>
  )
}
