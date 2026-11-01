# KART CHAOS 64 — v1.15 update

Upload the CONTENTS of this folder into your existing repository root. Merge the public folder; keep your existing MP3 files. Commit and let Render rebuild using its existing settings.

Three new large arenas bring the total to twelve:
- Clockwork Foundry: moving conveyors, raised factory lanes, rotating gears, glowing furnaces and chimney smoke.
- Frostbite Harbour: slippery central ice, grippy raised docks, an icebreaker, snowfall and a night aurora.
- Overgrown Ruins: jungle terraces, wide causeways, ravine drops, waterfalls and night fireflies.

All three support Original and Soft toon, random day/night, all speed classes, bots, split-screen and online rooms.

New MP3 folders (visible README placeholders keep them on GitHub):
- public/music/foundry/
- public/music/harbour/
- public/music/ruins/

Put MP3s directly in the matching folder and commit them. Music selection must be Auto. Each arena load picks a random starting MP3, then continues through its playlist. Empty folders use the new generated music. The build recreates tracks.json automatically. Existing music folders and MP3s stay in place.

Validation: production build; 171 automated tests; 36 two-minute bot navigation scenarios; 6 multiplayer integration tests. Local browser visual checks completed.

Aurora correction: both ends now fade smoothly to transparent instead of showing hard rectangular edges.
