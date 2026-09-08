import { nestCorsOptions } from './cors-options';

describe('nestCorsOptions', () => {
  it('allows browser preflight and API methods without cookies', () => {
    expect(nestCorsOptions.origin).toBe(true);
    expect(nestCorsOptions.credentials).toBe(false);
    expect(nestCorsOptions.allowedHeaders).toBe('*');
    expect(nestCorsOptions.methods).toEqual(
      expect.arrayContaining([
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
      ]),
    );
  });
});
