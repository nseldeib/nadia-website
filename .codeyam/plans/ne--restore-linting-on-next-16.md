---
title: "ne -- Restore linting on Next 16"
mode: backend
createdAt: "2026-11-05T22:37:30Z"
prefix: "ne"
source: manual
---

## Summary

`npm run lint` crashes before checking anything: `ERR_MODULE_NOT_FOUND: Cannot find module '.../eslint-config-next/core-web-vitals'`. The site runs Next 16 (`next@16.3.3`), but `eslint-config-next` is pinned at `^15.3.3` (15.5.24 installed). The `eslint.config.mjs` flat-config imports (`eslint-config-next/core-web-vitals`, `/typescript`) are the Next 16 package's entry points, which v15 doesn't export that way. So the repo has no linting at all right now, including on the new writing code. This plan aligns the toolchain with Next 16 and gets lint passing.

## Key Decisions

- **Bump `eslint-config-next` to `^16` to match `next`,** rather than rewriting `eslint.config.mjs` for v15. The config is already the Next 16 shape.
- **Take the in-range patch bumps in the same change**, since they're the same "drift from Next 16" concern: `next` 16.3.3 → 16.4.x, `@prisma/client` / `@prisma/adapter-pg` 7.10.0 → 7.10.1, `pg` 8.23.1, `fast-xml-parser` 5.12. **Skip the majors** (`eslint` 10, `dotenv` 18, `@types/node` 26). Each of those is its own decision.
- **The lint violations are unknown until lint can run.** Take the inventory first thing during execution (run lint, count files and rules) and fix what it finds. If it turns up more than a small set of mechanical fixes, stop and re-scope instead of growing this plan.

## Implementation

### 1. Align the lint config package

**File**: `package.json`

`eslint-config-next` → `^16` (match the installed `next` minor). Apply the patch/minor bumps listed above and regenerate `package-lock.json`.

### 2. Confirm the flat config resolves

**File**: `eslint.config.mjs`

Keep it as-is if the v16 imports resolve. Otherwise adjust to the v16 package's documented entry points (check `node_modules/eslint-config-next/package.json` `exports`).

### 3. Fix what lint reports

Inventory first, then fix. Expect most findings in the new writing files (`app/lib/substackFeed.ts` uses `Record<string, any>`, which `@typescript-eslint/no-explicit-any` will flag).

### 4. Verify

Build, tests and lint all green after the bumps.

## Reused existing code

- `eslint.config.mjs` (existing flat config, `globalIgnores` already set)

## Scenarios to Demonstrate

- Backend-only change: no UI scenarios. Existing homepage and writing scenarios should capture unchanged after the Next minor bump.