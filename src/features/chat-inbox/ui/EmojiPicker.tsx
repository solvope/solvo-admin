import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * Curated emoji set tuned for support-agent context (Crevo's PE consumer
 * fintech audience). Same shape as the user widget's picker — kept as a
 * separate file because the two repos don't share UI code yet.
 *
 * Each category has a representative `icon` emoji used as the tab label
 * (matches iOS / Android keyboard pattern, avoids cramped Spanish text
 * labels in a 280px popover).
 */
interface EmojiCategory {
  id: string
  label: string
  icon: string
  emojis: string[]
}

const EMOJI_GROUPS: EmojiCategory[] = [
  {
    id: 'common',
    label: 'Comunes',
    icon: '😊',
    emojis: ['😊', '😀', '😅', '🤗', '🙂', '😉', '😌', '🤔', '😎', '🥲', '😂', '🙃', '😬', '😢'],
  },
  {
    id: 'reactions',
    label: 'Reacciones',
    icon: '👍',
    emojis: ['👍', '👎', '👌', '🙏', '💪', '👏', '🙌', '🤝', '✅', '❌', '⚠️', '❗', '❓'],
  },
  {
    id: 'comm',
    label: 'Comunicación',
    icon: '💬',
    emojis: ['💬', '📧', '📞', '✍️', '📝', '👀', '💡', '📌', '🔔'],
  },
  {
    id: 'finance',
    label: 'Finanzas',
    icon: '💰',
    emojis: ['💰', '💸', '💳', '📊', '📈', '📉', '💼', '💵', '🏦'],
  },
  {
    id: 'other',
    label: 'Otros',
    icon: '🎉',
    emojis: ['🎉', '🎁', '❤️', '✨', '🚀', '⭐', '🔥', '💯', '🌟'],
  },
]

interface Props {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string>(EMOJI_GROUPS[0].id)

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const active = EMOJI_GROUPS.find((g) => g.id === activeCategoryId) ?? EMOJI_GROUPS[0]

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Selector de emojis"
      className={cn(
        'absolute bottom-full left-0 mb-2 z-50',
        'w-[280px] bg-card text-foreground',
        'border border-border rounded-md shadow-xl overflow-hidden',
        'animate-in fade-in slide-in-from-bottom-2 duration-150',
      )}
    >
      {/* Category tabs — emoji icons (iOS / Android keyboard pattern). */}
      <div className="flex border-b border-border bg-muted/40">
        {EMOJI_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActiveCategoryId(g.id)}
            aria-label={g.label}
            title={g.label}
            className={cn(
              'flex-1 py-2 text-base flex items-center justify-center transition-colors',
              activeCategoryId === g.id
                ? 'bg-card border-b-2 border-brand-accent -mb-px'
                : 'opacity-60 hover:opacity-100 hover:bg-card/50',
            )}
          >
            <span aria-hidden="true">{g.icon}</span>
          </button>
        ))}
      </div>

      <div className="p-2 grid grid-cols-7 gap-1 max-h-[200px] overflow-y-auto">
        {active.emojis.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onSelect(e)}
            aria-label={`Insertar ${e}`}
            className="h-8 w-8 flex items-center justify-center rounded-md text-xl hover:bg-muted transition-colors"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}
