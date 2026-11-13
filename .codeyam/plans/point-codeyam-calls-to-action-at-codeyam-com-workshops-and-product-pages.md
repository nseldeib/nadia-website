---
title: "Point CodeYam calls to action at codeyam.com workshops and product pages"
mode: ui
createdAt: "2026-11-09T20:33:40Z"
source: manual
---

## Summary
Turn the CodeYam mentions on this personal site into clear paths to CodeYam for clients, paid workshops and users, without adding a workshops page here. The site stays personal; the offers live on codeyam.com.

## Key Decisions
- No new page on nadiaeldeib.com. The CodeYam section gets clear links to the right codeyam.com pages (product / try it, workshops, work with us). Nadia supplies the exact codeyam.com URLs at the plan gate.
- Links carry UTM parameters (`utm_source=nadiaeldeib.com`) so CodeYam's analytics can show how much traffic and how many signups this site drives.
- Copy and URLs live in `content/site.json`.

## Implementation
- Extend the CodeYam section's data in `content/site.json` / `content/site.ts` with a short list of calls to action.
- Render them in the existing CodeYam section component, and re-capture its scenario.
- A small pure helper adds UTM parameters to outbound CodeYam links, with a unit test.