/**
 * localStorage keys that must SURVIVE a logout (manual or automatic).
 *
 * The admin panel doesn't have cookie consent (it's an internal tool, not
 * subject to ANPDP cookie banners), but theme preference is still long-lived
 * UX. People expect dark mode to stick across sessions.
 *
 * Add anything else that's a long-lived user preference (sidebar collapsed
 * state, table column widths, etc.) to this list.
 */
const PRESERVED_KEYS: ReadonlySet<string> = new Set([
  'theme', // next-themes
])

/**
 * Wipes localStorage on logout, preserving the keys listed in PRESERVED_KEYS.
 *
 * Iterate-and-remove instead of `localStorage.clear()` so we can keep the
 * preference keys. Silent on failure: localStorage can be blocked under
 * strict browser policies and the auth flow must not break.
 */
export function clearAuthLocalStorage(): void {
  if (typeof window === 'undefined') return
  try {
    const toRemove: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key && !PRESERVED_KEYS.has(key)) {
        toRemove.push(key)
      }
    }
    toRemove.forEach((key) => {
      try {
        window.localStorage.removeItem(key)
      } catch {
        // Per-key failure is non-fatal.
      }
    })
  } catch {
    // Reading localStorage itself can throw under strict policies.
  }
}
