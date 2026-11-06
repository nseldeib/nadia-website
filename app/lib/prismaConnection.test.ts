import { describe, it, expect } from 'vitest';
import { MISSING_DATABASE_URL, requireConnectionString, withExplicitPort } from './prismaConnection';

describe('withExplicitPort', () => {
  // Only the port changes; credentials and sslmode survive the rewrite.
  it('adds 5432 to a port-less URL and keeps credentials and query intact', () => {
    expect(withExplicitPort('postgresql://user:p%40ss@db.example.com/neondb?sslmode=require')).toBe(
      'postgresql://user:p%40ss@db.example.com:5432/neondb?sslmode=require',
    );
  });

  // An explicit port is never overridden.
  it('leaves a URL that names a port alone', () => {
    expect(withExplicitPort('postgresql://u@h:6543/db')).toBe('postgresql://u@h:6543/db');
  });

  // A string that is not a URL is passed to the driver untouched.
  it('returns an unparseable string exactly as given', () => {
    expect(withExplicitPort('not a url')).toBe('not a url');
  });
});

describe('requireConnectionString', () => {
  // A connection string that already names its port passes through untouched.
  it('returns the connection string when it is set', () => {
    expect(
      requireConnectionString({ DATABASE_URL: 'postgresql://u@h:6543/db' }),
    ).toBe('postgresql://u@h:6543/db');
  });

  // The one rewrite: a missing port is stated, so `pg` cannot fill it from
  // PGPORT (which the codeyam editor points at its own proxy).
  it('states the default port when the string leaves it out', () => {
    expect(
      requireConnectionString({ DATABASE_URL: 'postgresql://u@h/db' }),
    ).toBe('postgresql://u@h:5432/db');
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
