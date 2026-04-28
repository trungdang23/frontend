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
  it('falls back to planner when next path is missing', () => {
    expect(resolvePostAuthPath(undefined)).toBe('/app/planner');
    expect(readPostAuthPathFromState(undefined)).toBe('/app/planner');
  });

  it('ignores auth routes as redirect targets', () => {
    expect(resolvePostAuthPath('/auth/login')).toBe('/app/planner');
    expect(readPostAuthPathFromState({ from: { pathname: '/auth/register' } })).toBe('/app/planner');
  });

  it('keeps protected destinations when available', () => {
    expect(resolvePostAuthPath('/app/profile')).toBe('/app/profile');
    expect(resolvePostAuthPath('/app/planner')).toBe('/app/planner');
    expect(readPostAuthPathFromState({ from: { pathname: '/app/profile' } })).toBe('/app/profile');
    expect(readPostAuthPathFromState({ from: { pathname: '/app/planner' } })).toBe('/app/planner');
  });
});
