# KART CHAOS 64 v1.7.0 - Living arenas

Upload ALL contents of this update to your existing GitHub repository ROOT.
Merge src, server, scripts and tests; replace package.json and package-lock.json.
Commit, wait for Render to finish, refresh the game and check Settings for v1.7.0.
No public/music files are included or changed. Your MP3s stay in place.

Background scenery appears DURING MATCHES. Use Settings > Visual effects > Full
flair for all animated scenery. Reduced effects and reduced motion keep a quieter,
less busy version. Background actors do not block driving, projectiles or cameras.

Tide Depot: cargo ships, sailing boats and an original stomping harbor colossus.
Rift Quarry: three dust-devil columns and rolling tumbleweeds.
Ember Keep: flying winged beasts and translucent ghosts on the tower roofs.
Sunbreak Beach: sailing boats, jet-skis with wakes, leaping dolphins and an
occasionally surfacing whale.
Copper Yard: cheering/clapping spectators and subtle synthesized crowd sounds.
Neon Bowl: distant spacecraft and an OPEN RIM. Karts can now fall off, lose a
balloon and respawn safely above the center platform. Ricochet Pods also fall
off the rim; bumper cylinders still reflect them. Bots treat the rim as a hazard.
Sky Platforms: roughly 20% larger (about 138m of platforms) with drifting airships.
Physics, scenery, spawns, boxes and bot navigation use the same updated scale.
Floodlight Stadium: two large live status boards above the ends, with driver
numbers, balloons, survivors/eliminations and the bonus football score.
The Fortress: moving bird flocks around the arena.

Item boxes now have a larger, stronger pulsing violet aura.
Goal fireworks have 192 instanced stars, wider and higher bursts, longer trails
and a deep boom. Reduced-effects mode uses a smaller burst.
Turbo Juice has a distinct launch whoosh and rising engine note (mini-turbos retain
their existing sound). Mines have larger fragments, a ground ring, bass explosion
and a short per-view camera shake that respects reduced-motion/effects settings.
All added sounds use the Effects volume slider and master mute.

Verification: 132 automated tests, five multiplayer checks, all 27 two-minute
navigation scenarios across nine arenas and three speeds, successful build and
browser rendering checks of the new scenery and physical stadium boards.
