import { describe, expect, it } from 'vitest';
import { resolveScrollBehavior } from './resolveScrollBehavior';

describe('resolveScrollBehavior', () => {
  it('uses smooth scrolling when reduced motion is not preferred', () => {
    expect(resolveScrollBehavior(false)).toBe('smooth');
  });

  it('uses instant scrolling when reduced motion is preferred', () => {
    expect(resolveScrollBehavior(true)).toBe('auto');
  });
});
