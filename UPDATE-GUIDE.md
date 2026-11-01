# v1.34 — Glacier grip, reflections and wall repair

Upload the contents into your existing GitHub repository root, merging folders. This patch fits within one GitHub browser upload. Keep your MP3s. Update client and server together; commit and let Render rebuild.

Glacier traction is now surface-specific. The base-level ice retains its sideways slide, long coasting and weaker braking. Ramps, ramp mouths and raised decks use normal tyre grip, coasting and braking. Ground-level ice beneath the bridges remains slippery.

Glacier's block surfaces now form one exterior skin. Internal faces where the summit and suspended bridge overlap have been removed, eliminating their competing wall surfaces. The existing flat ramp markings and open underpasses remain.

A soft planar reflection mirrors karts that are on the base ice. It is drawn only on the ground ice, with a transparent softened blend over the existing floor. Karts on ramps/raised decks or airborne are excluded from the reflection pass. Opaque ramps and platforms occlude the ice below them. The reflection pass draws kart layers rather than the whole surrounding landscape and restores viewport/scissor state for split-screen. Both art styles and day/night lighting are supported.

Validation: production build, all 224 automated tests and all 48 two-minute navigation scenarios (96 simulated minutes) passed. Tests cover ice/ramp traction and braking, the summit/bridge exterior wall, transparent reflection depth settings and all prior driving routes. Manual local browser checks covered ice reflections, ramp ascent, the close-up wall, both art styles, day/night and two-player split-screen. The final browser check reported no rendering errors.

No MP3 files or tracks.json are included. Existing music folder names and uploaded tracks stay in place. Current runtime sources include previous updates.
