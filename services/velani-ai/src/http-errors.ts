export class ApiError extends Error {
  constructor(readonly statusCode: number, readonly code: string, message: string, readonly retryAfter?: number) { super(message); }
}
