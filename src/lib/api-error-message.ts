/** Shared YouTube error envelope; transport, cancellation and retry policy stay with callers. */
export function apiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object" || !("error" in body)) return fallback;
  const error = body.error;
  if (!error || typeof error !== "object" || !("message" in error))
    return fallback;
  return typeof error.message === "string"
    ? error.message.slice(0, 600)
    : fallback;
}
