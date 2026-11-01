# KART CHAOS 64 — v1.19 Neon bumpers and combat feedback

Upload the CONTENTS of this folder into your existing GitHub repository root. Merge folders and preserve existing MP3s. Commit and let Render rebuild with the existing settings.

Neon Bowl: all sixteen coloured rim blocks are solid. Karts rebound from them and Ricochet Pods reflect from their angled faces. The visual mesh and collision share dimensions and placement. Gaps between the blocks remain open drop-offs, and airborne karts can clear the blocks. Seekers are stopped by solid rim blocks too.

Combat messages: fixed a layout bug that could clip the full-screen feedback panels inside the small score/warning stack. Messages now occupy a separate full-screen layer, with independent panels for each local player. Cards have brighter borders, weapon icons, entrance animation, and distinct hit/elimination/shield/self-hit styling. Reduced motion disables the entrance animation. Normal messages last 3.6 seconds; eliminations last 4.8 seconds; up to three are shown per player. Confirmations explicitly name the weapon, for example Hit Rook with Seeker! and Eliminated Rook with Seeker!

Online prediction no longer creates feedback event IDs that could mask later authoritative hit events. Your own weapon confirmations still appear if a projectile hits after you were eliminated, before falling back to messages about the driver you spectate. Direction bearings update without restarting message animations.

All previous arena, team-circle, item-placement and results-controller improvements remain included. Music folders and MP3 handling are unchanged. Keep your existing MP3s.

Validation: production build; 179 automated tests, including every rim block at every speed, normal reflection, open gaps, airborne clearance, late-hit messages and prediction event isolation; 36 two-minute bot navigation scenarios; six multiplayer tests; local browser checks of hit/elimination/self-hit/shield messages, split-screen panels, overlay bounds and stable animation nodes.

Developer browser fixture: run the dev server and open /tests/combat-overlay-browser.html.
