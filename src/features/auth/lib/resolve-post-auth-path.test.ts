import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  readPostAuthPathFromState,
  resolvePostAuthPath,
} from '@/features/auth/lib/resolve-post-auth-path';

describe('resolvePostAuthPath', () => {
  it('falls back to trips workspace when next path is missing', () => {
    expect(resolvePostAuthPath(undefined)).toBe('/app/trips');
    expect(readPostAuthPathFromState(undefined)).toBe('/app/trips');
  });

  it('ignores auth routes as redirect targets', () => {
    expect(resolvePostAuthPath('/auth/login')).toBe('/app/trips');
    expect(readPostAuthPathFromState({ from: { pathname: '/auth/register' } })).toBe('/app/trips');
  });

  it('keeps protected destinations when available', () => {
    expect(resolvePostAuthPath('/app/profile')).toBe('/app/profile');
    expect(resolvePostAuthPath('/app/trips')).toBe('/app/trips');
    expect(readPostAuthPathFromState({ from: { pathname: '/app/profile' } })).toBe('/app/profile');
    expect(readPostAuthPathFromState({ from: { pathname: '/app/trips' } })).toBe('/app/trips');
  });
});
