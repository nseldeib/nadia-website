# Night Field — nadiaeldeib.com

Selected direction: `project_mockups/03-offcatalog-mockup.html` (off-catalog — composed
for this brief, not derived from a catalog system). This file was written by hand from
the mockup's actual tokens, because the selection endpoint can only resolve a backing
`design_systems/<name>.md` and an off-catalog mockup has none.

Runner-up kept on file: `project_mockups/01-offcatalog-mockup.html` ("the clean one" —
Avenir Next, white/blue, 4:5 rotating portrait card). All four original variants are
archived under `project_mockups/history/round-04-all-four/`.

## How to use this system

A dark, photographic, editorial page. Full-bleed imagery carries the emotion; the type
stays quiet and geometric and gets out of the way. One light band (the statement) breaks
the darkness so the page has a breath in the middle. Restraint is the point — one accent
colour, one display face, generous air.

Rules:
- **Photography is content, never decoration.** Every image is a real photo of a real
  place or moment. Frame from a measured core box — she is never cropped at a joint, and
  text never sits over her face or torso.
- **One accent.** Rust/amber does eyebrows, links, the primary button, and the typing
  cursor. Nothing else competes.
- **Meta text is surface-scoped.** `--meta` and `--accent-ink` are redefined on every
  surface that inverts. Never dim text with `opacity` — it composites below AA.
- **Type does not shout.** Display face only at section-head scale and above; body copy
  is neutral sans at comfortable measure.

## Foundations

### Colour — night base (`:root`)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#14110F` | page ground |
| `--paper-2` | `#1D1916` | raised cards, nav |
| `--ink` | `#F4EFE6` | primary text |
| `--ink-2` | `#B5ABA0` | secondary text |
| `--ink-3` | `#7C746A` | rules and borders only — **not text** |
| `--rule` | `#342D27` | hairlines |
| `--rust` | `#E07A4A` | the single accent |
| `--forest` | `#EDE7DA` | the light statement band |
| `--meta` | `rgba(244,239,230,.80)` | small/meta text on dark |
| `--accent-ink` | `#F0A272` | accent text on dark (AA-safe) |

Light-surface override (the statement band): `--meta:#5F574C; --accent-ink:#A8421F`.

Every pairing clears WCAG AA (4.5:1); the tightest in the page sits around 4.7:1.

### Type

- `--display` — `'Futura','Jost','Century Gothic','Avenir Next','Trebuchet MS',sans-serif`
  Small x-height, so tracking is opened, never tightened, at small sizes.
- `--sans` — `'Helvetica Neue',Helvetica,'Segoe UI',Arial,sans-serif` — body.
- `--mono` — `'Menlo','SF Mono',Consolas,monospace` — eyebrows and field labels only.

Scale: hero `clamp(32px,5vw,60px)` · section head `clamp(30px,4.1vw,48px)` ·
statement `clamp(28px,3.1vw,56px)` · lead `clamp(18px,2vw,23px)`.
Tracking: `-.024em` to `-.02em` on display sizes; `.2em` on mono eyebrows.

### Layout

`.wrap{max-width:1120px;margin:0 auto;padding:0 40px}`. Full-bleed sections override to
`max-width:none` with `padding-left:clamp(24px,6vw,120px)`. Radii: `999px` (pills/buttons),
`10px` (cards), `3px` (inputs), `50%` (avatars).

## Components

- **Nav** — 78px, shrinks on scroll, pill CTA in `--rust`.
- **Hero** — full-bleed rotating photo (4 frames, 32s cycle) under a stepped two-row
  typing headline. The cursor is an absolutely-positioned element animating `left:0→100%`
  on the same `steps()` function as the `clip-path` reveal, so it rides the text edge.
  **Pure CSS — the mockup iframe is `sandbox=""` and blocks all scripts.**
- **Statement band** — the one light surface; redefines `--meta`/`--accent-ink`.
- **Cards** — `--paper-2`, 10px radius, photo with a bottom-up scrim carrying the label
  and one line of copy. Card and image aspect ratios must match exactly; a mismatch is
  what cropped her in the first place.
- **Intake form** — no `mailto:` and **no public email address anywhere**. Deliberately
  not a real `<form>` element in the mockup so nothing can submit. At build: write to the
  DB, then email; honeypot field for spam.

## Constraints carried from the design sessions

- No public email address, ever. Contact is the intake form.
- Never mirror a photo that contains readable text (the podium shot with her name badge).
- Prefer whole frames over tight crops for hero imagery.
- The mockup is ~2MB of inline base64; those become real optimised assets at build.
- Remove the "Mockup — not wired up" note at build.
