# KART CHAOS 64 — v1.33.1 harbour walls and held-item glow

Upload these contents into your existing GitHub repository root, merging folders. Keep your MP3s. Commit and let Render rebuild.

Frostbite Harbour: the overlapping dock and lookout blocks now render as one continuous exterior skin, removing coincident wall faces and deck tops. Vertical dock walls and perimeter walls use stable shading without striped self-shadow artifacts. Dock walls still cast shadows onto the ground; deck tops still receive shadows. Kart self-shadows remain enabled. Both art styles are supported. Arena layout, collisions, bot routes and music folders are unchanged.

Attached inventory items: every held item now has a bright item-coloured centre glow and a wider soft halo using the same radial glow texture as item boxes. The halo follows the existing reveal, rotation and sway. It gently pulses; reduced-motion keeps it steady. The effect disappears with the item on use, roulette, elimination or results. Sprite materials are cleaned up when switching items; the shared glow texture is retained.

Validation: production build and all 218 automated tests. Added checks for single exterior harbour wall faces, shadow settings, all six item glows in both styles, reduced-motion behaviour and material disposal. Browser checks covered the repaired harbour dock walls and seeker/mine glows in both art styles.

Includes all previous updates, including the rebuilt Cinder Crypt and Starcore reactor. No MP3 files or tracks.json are included in this patch. Your existing uploaded soundtrack files stay in place.
