# Update 1.45 — Frostbite Harbour ice

The frozen basin now uses the full ice sliding physics: lateral momentum persists, turns slide and braking takes longer. Snow, dock decks and ramps retain normal grip, including ramp entrances. Bots use the existing ice steering compensation and conservative ice throttle.

The basin mirrors karts with the same softened reflection used by Glacier Slide. A single kart-only reflection pass is clipped to the icy basin, excluding snow, dock foundations and ramp footprints. It is hidden in the menu preview and when no living kart is on the ice. Both art styles are supported.

Validation: production build and all 263 tests passed. Three two-minute bot navigation checks at 50cc, 100cc and 150cc passed, with no falls or persistent stalls. Browser checked actual play, the ON ICE indicator and visible kart reflections with no reported errors.

## Upload
Extract this ZIP and upload its CONTENTS at your GitHub repository root, preserving folders. Merge/overwrite the included files and commit. Let Render rebuild, then refresh the game tabs. Your MP3s and tracks.json are not included or replaced. All v1.44 networking improvements are included.
