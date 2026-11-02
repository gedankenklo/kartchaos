# Update 1.39 — Audible fireworks and beach ramp navigation

Fireworks on soccer goals and CTF captures now have a clearer sharp crack, a midrange impact, stronger deep bass and a longer rumbling tail. Boom timing follows all three visible burst waves, including the final bursts.

Beach bots no longer plan a sideways step onto a ramp that driving physics rejects. Navigation checks the beach terrain more closely, uses ramp approach points and detects stalled beach bots. Both blocked ramp sides were reproduced before the fix; regression simulations now require the bot to get around the ramp and reach its rival at every speed.

Validation: production build, 237 tests, and all 48 two-minute navigation scenarios passed.

## Upload
Extract this ZIP and upload its CONTENTS at your GitHub repository root, keeping the folders. Merge/overwrite included files; do not delete the repository first. Commit and let Render rebuild. Your MP3s and tracks.json are not included or replaced.
