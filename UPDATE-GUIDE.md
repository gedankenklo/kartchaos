# KART CHAOS 64 — v1.32 arena redesigns

Upload the contents of this update into your existing GitHub repository root, merging folders. Keep your existing MP3 files. Commit and let Render rebuild. Update the client and server together.

- Starcore Sphere: ordinary station driving replaces spherical gravity and projection. A reactor basin, sloping approaches, raised outer ring and decorative hull keep the space theme. The name, arena ID and starcore music folder are unchanged.
- Cinder Crypt: asymmetric lava channels, separate towers, bridges and a raised cathedral replace the previous layout. Lava uses the same animated material as Ember Keep.
- Starfall Citadels: larger tiered towers, raised central and flank crossings, and a surrounding battle with capital ships, fighters, laser fire and explosions.
- Glacier Slide: much stronger sideways sliding, longer braking, connected terraces, a summit and a lower central deck.

Both art styles, existing music defaults and sudden-death cues are retained. Your existing music folder names still work. The patch contains no MP3 files and does not replace tracks.json; the build scans your existing music automatically.

Validation: production build; 208 automated tests; 48 navigation scenarios covering all 16 arenas at all three speeds (96 simulated minutes); successful captures on both CTF arenas at all three speeds; six online integration tests; browser visual checks. Starcore navigation runs had no falls at any speed.
