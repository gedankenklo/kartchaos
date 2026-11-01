# KART CHAOS 64 v1.11.0 - Roomier Fortress

Upload ALL contents of this update to your existing GitHub repository ROOT.
Merge src, server, scripts and tests; replace package.json and package-lock.json.
Commit, wait for Render, refresh and check Settings for v1.11.0.
Your public/music folder is not included or changed. Your MP3s stay in place.

The Fortress now spans about 269m (previously 230m).
Lower blocks are 33% wider; upper decks are 60% wider.
Ground ramps are wider. Upper ramps are wider and longer.
Upper bridges have separate lanes with at least 3.6m of clearance from ramps.
Upper ramp mouths keep a 9.6m bypass lane along the lower deck.
Both levels of bridges remain connected, with open ground corridors below.

Geometry, collision surfaces, item placement, navigation, minimap, boundary
walls and arena preview use the enlarged layout. Both art styles are supported.
Earlier stadium team battles and HUD fixes remain included.

Validation: production build and all 152 unit/simulation tests pass.
New checks cover ramp/bridge separation and ramp driving across the usable
width at 50cc, 100cc and 150cc. All 27 two-minute bot navigation scenarios pass.
Browser checks cover driver-height joins and overviews in both art styles.
