import { Check, CheckCheck, Info } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { ChatMessageAdminView } from '../types'
import { isTempId } from '../types'

interface Props {
  message: ChatMessageAdminView
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

/**
 * ADMIN-perspective bubble. Mirror image of the user widget's bubble:
 *   - Agent's own messages → right side (the agent IS the agent)
 *   - User's messages      → left side
 *   - System messages      → centered, neutral
 */
export function MessageBubble({ message }: Props) {
  if (message.senderType === 'system') {
    return (
      <li className="my-3 flex justify-center">
        <div className="max-w-[85%] inline-flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Info
            className="h-3.5 w-3.5 shrink-0 mt-0.5 text-brand-accent"
            aria-hidden="true"
          />
          <span className="leading-snug">{message.body}</span>
        </div>
      </li>
    )
  }

  const isAgent = message.senderType === 'agent'
  const pending = isTempId(message.id)
  const seen = Boolean(message.readAt)

  return (
    <li
      className={cn(
        'flex w-full',
        isAgent ? 'justify-end' : 'justify-start',
      )}
      aria-label={isAgent ? 'Mi respuesta' : 'Mensaje del usuario'}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-snug whitespace-pre-wrap break-words',
          isAgent
            ? 'bg-brand-primary text-white rounded-br-sm dark:bg-brand-secondary/15 dark:text-foreground'
            : 'bg-card text-foreground rounded-bl-sm border border-border',
        )}
      >
        <p>{message.body}</p>
        <div
          className={cn(
            'mt-1 flex items-center gap-1 justify-end text-[10px]',
            isAgent ? 'text-white/60 dark:text-muted-foreground' : 'text-muted-foreground',
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isAgent &&
            (pending ? (
              <span title="Enviando" aria-label="Enviando">
                <Check className="h-3 w-3 opacity-50" />
              </span>
            ) : seen ? (
              <span title="Leído" aria-label="Leído">
                <CheckCheck className="h-3 w-3 text-brand-accent" />
              </span>
            ) : (
              <span title="Enviado" aria-label="Enviado">
                <Check className="h-3 w-3" />
              </span>
            ))}
        </div>
      </div>
    </li>
  )
}
