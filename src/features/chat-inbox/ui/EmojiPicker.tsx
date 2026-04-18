import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * Curated emoji set tuned for support-agent context (Crevo's PE consumer
 * fintech audience). Same shape as the user widget's picker — kept as a
 * separate file because the two repos don't share UI code yet.
 */
const EMOJI_GROUPS: Record<string, string[]> = {
  Comunes: [
    '😊', '😀', '😅', '🤗', '🙂', '😉', '😌', '🤔', '😎', '🥲', '😂', '🙃', '😬', '😢',
  ],
  Reacciones: [
    '👍', '👎', '👌', '🙏', '💪', '👏', '🙌', '🤝', '✅', '❌', '⚠️', '❗', '❓',
  ],
  Comunicación: [
    '💬', '📧', '📞', '✍️', '📝', '👀', '💡', '📌', '🔔',
  ],
  Finanzas: [
    '💰', '💸', '💳', '📊', '📈', '📉', '💼', '💵', '🏦',
  ],
  Otros: [
    '🎉', '🎁', '❤️', '✨', '🚀', '⭐', '🔥', '💯', '🌟',
  ],
}

interface Props {
  onSelect: (emoji: string) => void
  onClose: () => void
}

/**
 * Anchored popover above the composer. Parent must be position:relative.
 * Closes on Escape and outside-mousedown (mousedown so a click on the
 * trigger button doesn't immediately reopen us).
 */
export function EmojiPicker({ onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(EMOJI_GROUPS)[0])

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

  const emojis = EMOJI_GROUPS[activeCategory] ?? []

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Selector de emojis"
      className={cn(
        'absolute bottom-full left-0 mb-2 z-50',
        'w-[280px] bg-card text-foreground',
        'border border-border rounded-xl shadow-xl overflow-hidden',
        'animate-in fade-in slide-in-from-bottom-2 duration-150',
      )}
    >
      <div className="flex border-b border-border bg-muted/40">
        {Object.keys(EMOJI_GROUPS).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'flex-1 py-1.5 text-[11px] font-medium transition-colors',
              activeCategory === cat
                ? 'text-brand-accent border-b-2 border-brand-accent -mb-px'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="p-2 grid grid-cols-7 gap-1 max-h-[200px] overflow-y-auto">
        {emojis.map((e) => (
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
