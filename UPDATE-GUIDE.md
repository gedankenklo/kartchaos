# Update 1.40 — Battle bot behavior

Multiple one-balloon bots could repeatedly retreat from one another instead of committing to a fight. Retreats now last at most 2–2.5 seconds and have a cooldown before another retreat. Controlled three-bot tests on Cinder Crypt, Copper Yard and Rift Quarry reduced retreat time from 54–65% to about 17–18%.

Bots anticipate moving rivals more effectively on suitable battle maps instead of always following directly behind. Open-edge maps retain their shorter chase look-ahead. Stalled movement recovery now works across arenas. Cinder Crypt also uses the finer ramp-side clearance checks introduced for Beach. CTF objectives and soccer rules are unchanged.

Validation: production build, 240 tests and all 48 two-minute navigation scenarios passed. Tests include fragile bot groups, Cinder stalled recovery, Beach ramp escape and Glacier summit access.

## Upload
Extract this ZIP and upload its CONTENTS at the GitHub repository root, keeping folders intact. Merge/overwrite included files; do not delete your repository first. Commit and let Render rebuild. Your MP3s and tracks.json are not included or replaced.
