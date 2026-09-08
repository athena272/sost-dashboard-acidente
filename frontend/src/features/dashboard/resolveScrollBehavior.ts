export type ScrollBehaviorPreference = ScrollBehavior;

/** Prefer instant scroll when the user requests reduced motion. */
export function resolveScrollBehavior(
  prefersReducedMotion: boolean,
): ScrollBehaviorPreference {
  return prefersReducedMotion ? 'auto' : 'smooth';
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
