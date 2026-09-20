export const CHART_COLORS = {
  brand: '#0b5f6b',
  brandDark: '#084851',
  chart2: '#c9852a',
  chart3: '#2d6a4f',
  grid: '#c9d5de',
  ink: '#15202b',
  muted: '#5b6b78',
  surface: '#ffffff',
} as const;

export const chartGridProps = {
  stroke: CHART_COLORS.grid,
  strokeDasharray: '3 3',
  strokeOpacity: 0.7,
};

export const chartTooltipStyle = {
  backgroundColor: CHART_COLORS.surface,
  border: `1px solid ${CHART_COLORS.grid}`,
  borderRadius: 8,
  color: CHART_COLORS.ink,
};

export const chartAxisTick = {
  fill: CHART_COLORS.muted,
  fontSize: 12,
};
