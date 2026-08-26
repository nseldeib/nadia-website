# 01 — "the clean one" (parked, not discarded)

The runner-up direction, parked on 2026-08-26 so the active set is just 03.
Nothing about it is unfinished — it carries every fix from the final polish
round (WCAG AA pass, photo reframing, restructured IA, intake form) and is
byte-identical to `history/round-04-all-four/01-offcatalog-mockup.html`.

**What it is:** Avenir Next, white/blue, a light and airy layout. Typed H1
("Hi, I'm Nadia. I build tools for developers and vibe coders."), a rotating
4:5 portrait card (podium / portrait / laptop), career bio under "How I got
here" in `#about` with a "When I'm not coding" sub-turn, and the same
no-public-email intake form as 03.

**How it differs from 03:** 03 is the cinematic one — dark, full-bleed
photography, Futura display. 01 is the calm one — light, typographic,
photography contained to a single card. Same content, opposite temperature.

## To bring it back

```bash
cd .codeyam/design/project_mockups
mv history/01-clean-direction/01-offcatalog-mockup.html .
printf '{"count": 2}' > target.json
```

Then reload the editor's Mockups tab. To preview it without restoring it,
open the file directly:
`http://localhost:<controlPort>/api/editor-mockups/01-offcatalog-mockup.html`
(resolve `controlPort` from `.codeyam/server-state.json`).
