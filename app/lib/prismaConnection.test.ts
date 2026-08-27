import { describe, it, expect } from 'vitest';
import { MISSING_DATABASE_URL, requireConnectionString } from './prismaConnection';

describe('requireConnectionString', () => {
  // A configured environment must pass through untouched — the guard exists to
  // catch absence, not to rewrite a working connection string.
  it('returns the connection string when it is set', () => {
    expect(
      requireConnectionString({ DATABASE_URL: 'postgresql://u@h/db' }),
    ).toBe('postgresql://u@h/db');
  });

  // Failing here rather than at the first query is the whole point. Postgres
  // has no local-file default, so without this the first symptom is a
  // driver-level error at request time that says nothing about the cause.
  it('throws when DATABASE_URL is absent', () => {
    expect(() => requireConnectionString({})).toThrow();
  });

  // A committed env file with `DATABASE_URL=""` left blank is unconfigured.
  // Handing an empty string to the driver produces a confusing connection
  // error instead of the message below.
  it('treats an empty string as unset', () => {
    expect(() =>
      requireConnectionString({ DATABASE_URL: '' }),
    ).toThrow();
  });

  // The message is the entire value of failing fast: it has to name the file
  // the value belongs in, or the reader is no better off than with a stack
  // trace from the driver.
  it('names where the value belongs', () => {
    expect(() => requireConnectionString({})).toThrow(
      MISSING_DATABASE_URL,
    );
    expect(MISSING_DATABASE_URL).toContain('.env.local');
    expect(MISSING_DATABASE_URL).toContain('DATABASE.md');
  });
});
