import { describe, expect, it } from 'vitest';
import {
  CHART_COLORS,
  chartAxisTick,
  chartGridProps,
  chartTooltipStyle,
} from './chartTheme';

describe('chartTheme', () => {
  it('keeps the brand color aligned with the CSS token', () => {
    expect(CHART_COLORS.brand).toBe('#0b5f6b');
    expect(CHART_COLORS.brandDark).toBe('#084851');
  });

  it('exposes grid and tooltip styles consumed by Recharts', () => {
    expect(chartGridProps.stroke).toBe(CHART_COLORS.grid);
    expect(chartGridProps.strokeDasharray).toBe('3 3');
    expect(chartTooltipStyle.backgroundColor).toBe(CHART_COLORS.surface);
    expect(chartTooltipStyle.color).toBe(CHART_COLORS.ink);
    expect(chartAxisTick.fill).toBe(CHART_COLORS.muted);
  });

  it('does not leave chart colors as empty placeholders', () => {
    for (const value of Object.values(CHART_COLORS)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
