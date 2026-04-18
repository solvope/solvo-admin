interface Props {
  /** Screen-reader-only label describing who is typing. */
  label: string
}

/**
 * Three-dots-bouncing bubble shown at the end of the thread when the
 * other party is composing a message. Mirrors a regular incoming
 * message bubble (left-aligned, neutral background) so it reads as
 * "almost a message" rather than as a status banner.
 */
export function TypingIndicator({ label }: Props) {
  return (
    <div
      className="flex justify-start"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 inline-flex items-center gap-1">
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      aria-hidden="true"
      className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
      style={{ animationDelay: delay, animationDuration: '1s' }}
    />
  )
}
