import { describe, it, expect } from 'vitest';

describe('Demo Layout & Error Boundary Unit Tests', () => {
  it('should export DemoLayout wrapper', async () => {
    const layoutModule = await import('@/app/demo/layout');
    expect(layoutModule.default).toBeDefined();
    expect(typeof layoutModule.default).toBe('function');
  });

  it('should export DemoError boundary component', async () => {
    const errorModule = await import('@/app/demo/error');
    expect(errorModule.default).toBeDefined();
    expect(typeof errorModule.default).toBe('function');
  });
});
