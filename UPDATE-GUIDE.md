# v1.33.3 — Glacier bridge geometry repair

Upload these contents into your existing GitHub repository root, merging folders. This update contains fewer than 100 files and fits in one GitHub browser upload. Commit and let Render rebuild. Keep your MP3s. The client and server must be updated together.

Glacier now uses a dedicated set of flat ice deck and ramp meshes. Thin rounded decks, separate legacy ramp shells and raised box-shaped border strips have been replaced. New edge markings are flat paint on the actual sloping surfaces. Deck tops meet the ramps at the same heights used by collision, while the ground-level underpasses remain open. Bridge sides and undersides have stable shading; deck-top and kart shadows remain. An upward launch underneath a bridge is now stopped by its underside rather than passing through the deck. Map size, ice handling and music folder stay unchanged.

Manual local browser driving checks at 150cc covered the approach ramp to the 7m deck, the summit ascent/descent, connecting bridge to the 4.2m central deck, and the complete underpass crossing from x=-54m to x=54.6m at ground level. Both art styles and night lighting were visually checked. No browser rendering errors were reported in the final check.

Validation: production build and all 221 tests passed. New tests check rendered surface heights against collision, all four driving routes at 50/100/150cc and 30/60fps, and underside collision during a high upward launch. All 48 two-minute navigation scenarios passed (96 simulated minutes); Glacier had zero falls at every speed and no persistent stalls.

Current source files include previous arena and held-item glow changes. No MP3 files or tracks.json are included, so your uploaded music stays in place.
