#!/bin/zsh
# Open codeyam for this project on a FIXED port, landing on the design mockups.
#
# Why: the Project Launcher allocates a random control port per boot, so any
# bookmarked localhost:<port> goes stale. `start --port` runs the project's
# editor server directly and skips the launcher's dynamic allocation, so the
# URL below is stable. (Setting CODEYAM_CONTROL_PORT does NOT work here -- the
# launcher ignores it for the project servers it spawns.)
#
#   Bookmark:  http://localhost:14350/build
#
# /build is deliberate: opening `/` lands on the Home tab, which renders the
# onboarding questionnaire while this project has no apps configured and no
# saved setup answers (see helpers/isOnboardingActive.ts).
set -e
PORT=14350
PROJECT=/Users/nadiaeldeib/new-nadia-website
BIN=/Users/nadiaeldeib/codeyam-editor/target/debug/codeyam-editor

cd "$PROJECT"

# Keep the right pane restoring to the mockup grid. The editor resolves the
# preview in three tiers (in-memory -> .codeyam/preview-state.json -> empty);
# only the disk tier survives a restart.
python3 - <<'PY'
import json, os, datetime
p = ".codeyam/preview-state.json"
try:
    state = json.load(open(p))
except Exception:
    state = {}
if state.get("url") != "/design-exploration":
    json.dump({
        "url": "/design-exploration",
        "dimension": "Desktop", "width": 1440, "height": 900,
        "kind": "application",
        "updatedAt": datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "open-codeyam-script",
    }, open(p, "w"), indent=2)
    print("preview-state.json -> /design-exploration")
PY

echo "Starting codeyam on fixed port $PORT ..."
exec "$BIN" start --project "$PROJECT" --port "$PORT" --no-open
