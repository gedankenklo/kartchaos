# KART CHAOS 64 v1.13.0 - Day, night and haunted rooftops

Upload ALL contents of this update to your existing GitHub repository ROOT.
Merge src, server, scripts and tests; replace package.json and package-lock.json.
Commit, let Render rebuild, refresh and check Settings for v1.13.0.
Your public/music folder is not included or changed. Your MP3s stay in place.

Every round randomly chooses day or night for its arena, including rematches.
Ember Keep chooses sunset or its familiar night lighting instead.
The lighting choice stays fixed for the round. The authoritative server shares
it with all online players and spectators; art-style changes do not reroll it.
Skies, stars/moon, ambient light, terrain lighting and coastal water respond.
Both Original and Soft Toon styles support the lighting variants.

Neon Bowl rim markers now sit flush with the banking and no longer cast the
stretched decorative shadows. The city stands on a distant annular foundation;
its buildings and signs have support. Floating trees beside the bowl are removed.
The city foundation stays well beyond the playable arena and does not close
the open rim or intersect the normal fall-and-respawn area.

Ember Keep ghosts orbit their own tower roofs, bob gently and turn as they swirl.
Reduced-motion/effects settings keep those movements still.
All previous stadium, invitations, HUD and random-music changes remain included.

Validation: production build, all 161 unit/simulation tests and six multiplayer
tests pass. Browser checks cover lighting variants across all nine arenas,
Ember Keep sunset, Neon scenery, and both art styles.

Lobby tip: press Toggle Ready before Start Battle. You can start with bots
without waiting for other online players. Local players controls split-screen.
