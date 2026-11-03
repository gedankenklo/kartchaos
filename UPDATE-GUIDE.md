# KART CHAOS 64 v1.50.0 - Farm polish

Extract and upload this ZIP's CONTENTS at your repository root, preserving folders. Merge/overwrite, commit, and let Render rebuild. Refresh all players' tabs afterwards.

Includes all previous farm-garage changes and the 12-meter ramp approaches.

- Ground ramps now have fully closed, outward-facing geometry at their high ends, matching their solid collision.
- Bots periodically take staggered routes up to the roof, then return to normal combat. Final two-driver duels and sudden death do not force detours.
- The arena's existing trees now have solid trunks; eight solid hay bales add cover.
- Eight chickens wander and scurry/flutter away from approaching karts and their predicted paths. They are harmless scenery rather than collision obstacles.

Validation: 280 tests passed, 10 final focused checks passed, production build passed. Three 120-second bot scenarios at 50/100/150cc: all four bots reached the roof, no falls, longest stall below 0.5 seconds. Browser inspected closed ramps, hay bales and chickens; no console errors.

No MP3s or tracks.json are included. The quarry music folder and existing music remain unchanged.
