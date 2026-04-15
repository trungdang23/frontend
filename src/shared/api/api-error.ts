type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: string;
  status: number;
};

export class ApiError extends Error {
  readonly code: string;
  readonly details?: string;
  readonly status: number;

  constructor(payload: ApiErrorPayload) {
    super(payload.message || 'Request failed.');
    this.code = payload.code || 'UNKNOWN_ERROR';
    this.details = payload.details;
    this.status = payload.status;
  }
}

export function isUnauthorizedError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}
