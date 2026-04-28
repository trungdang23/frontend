const DEFAULT_POST_AUTH_PATH = '/app/planner';

type AuthLocationState = {
  from?: {
    pathname?: unknown;
  };
};

export function resolvePostAuthPath(nextPathname: unknown) {
  if (typeof nextPathname !== 'string' || nextPathname.length === 0) {
    return DEFAULT_POST_AUTH_PATH;
  }

  return nextPathname.startsWith('/auth') ? DEFAULT_POST_AUTH_PATH : nextPathname;
}

export function readPostAuthPathFromState(state: unknown) {
  if (!state || typeof state !== 'object') {
    return DEFAULT_POST_AUTH_PATH;
  }

  return resolvePostAuthPath((state as AuthLocationState).from?.pathname);
}

