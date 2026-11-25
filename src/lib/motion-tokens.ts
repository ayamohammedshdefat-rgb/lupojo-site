/** Motion tokens (brief §5.3). Animate transform and opacity only. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  fast: 0.18,
  base: 0.32,
  slow: 0.6,
} as const;

export const SPRING_UI = { type: 'spring', stiffness: 420, damping: 32 } as const;
export const SPRING_SOFT = { type: 'spring', stiffness: 140, damping: 20 } as const;
