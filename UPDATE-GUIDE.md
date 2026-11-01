# KART CHAOS 64 — v1.28 Tide Depot pirate Capture the Flag

Upload these contents into your existing GitHub repository root, merging folders. Keep existing MP3s. Commit and let Render rebuild with the current settings. Both client and server source must be updated together.

Tide Depot keeps its name and public/music/depot soundtrack folder. The arena is rebuilt as a 232-metre pirate cove: blue and orange forts, tropical palms, sailing boats, an inlet with three bridge crossings, long approaches and elevated flank lookouts. Both art styles and day/night variants remain.

Rules are automatic on Tide Depot, with no extra mode selector:
- Crews are assigned randomly and balanced at round start. Team circles, roster labels and the HUD show your crew.
- Drive through the enemy flag to carry it behind your kart. Bring it into your team's base ring while your own flag is home to capture.
- A capture pops one balloon from every surviving opponent, even through shields/invulnerability, celebrates with fireworks and boom sounds, and resets both flags after a short cooldown.
- Taking damage or using the Turbo Juice item drops your flag. Shield-blocked hits do not. Drift turbos do not drop it.
- Touch your own dropped flag to return it. Unattended flags return after 15 seconds. A short pickup lock prevents immediate repickup after dropping.
- Normal item battles continue, with friendly-fire protection. The last crew with balloons wins; capture totals are a bonus score. Sudden death still forces a finish.

Bots attack, defend, recover stolen flags, escort carriers and collect weapons. Carriers wait near home if their flag is stolen instead of chasing each other forever. Objective state and teams are authoritative online and shared across couch views; prediction does not alter flag authority.

Validation: production build; 199 automated tests; all 36 two-minute navigation scenarios (72 simulated minutes); flag bot runs at all three speeds completed captures; all six multiplayer tests passed, including matching flag state/teams between independent clients. Browser checks covered the real HUD, flag pickup, Turbo drop, capture/reset and both art styles.

Developer fixture: /tests/ctf-browser.html. All prior updates are included. This patch contains no MP3 files and does not replace tracks.json. Keep your music files.
