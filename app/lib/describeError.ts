/** A caught value as a one-line reason, falling back when it is not an Error. */
export function describeError(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
