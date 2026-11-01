# KART CHAOS 64 — v1.30 four new arenas and quieter music

Upload these contents into your existing GitHub repository root, merging folders. Keep your existing MP3s. Commit and let Render rebuild. Update client and server together.

Music defaults to 10 percent for players without a saved music setting. Saved mixes remain unchanged and everyone can adjust the slider.

Four new arenas bring the selector to sixteen maps in a four-column grid:
- Starfall Citadels (starfall): a 442-metre space CTF arena inspired by opposing-tower layouts. Two team citadels, three long crossings, flank lookouts and open space below. Automatic balanced teams and the same capture/drop/return rules as Tide Depot. Distant spacecraft, asteroids, stars and a planet provide the backdrop.
- Glacier Slide (glacier): a 280-metre regular battle map. Every driving surface is slippery, including raised decks and ramps. Snow, icy mountain scenery and tall glacier formations surround the arena.
- Cinder Crypt (crypt): a 264-metre regular battle map. Raised crossings and battlements over three lava pits, four tall roofed towers, wandering ghosts and dark rock spires. Sunset/night lighting.
- Starcore Sphere (starcore): a complete 120-metre-radius globe with a recessed reactor dish. Surface-following movement, radial gravity, orientation and camera follow work over poles and around the entire sphere. Karts, items, mines, seekers, projectiles, collisions and Shockwave use the curved surface. Sudden death is a visible curved containment wall. Three-player split-screen uses a globe overview in the fourth tile.

Space arenas remain in space lighting. Both art styles remain available. Prior maps, including Tide Depot CTF, are retained.

New soundtrack folders (included with visible placeholder files so GitHub retains them):
public/music/starfall/
public/music/glacier/
public/music/crypt/
public/music/starcore/

Put MP3s directly in the matching folder. A random starting track is selected when that arena loads; empty folders use generated music. Four new generated themes each have three arrangements. Keep existing soundtrack files; the update does not include MP3s or replace tracks.json.

Validation: production build; 203 automated tests; all 48 two-minute navigation scenarios across 16 maps and three speeds (96 simulated minutes); both CTF arenas completed bot captures at all three speeds; all six multiplayer tests passed, including hosting all four new arenas. Globe tests cover complete circuits through poles and longitude seams, surface distances and combat across the seam. Browser visual checks covered the new layouts, globe driving, its crater and camera orientation, and lava visibility in preview.

Developer fixture: /tests/extra-arenas-browser.html. This update includes all previous releases.
