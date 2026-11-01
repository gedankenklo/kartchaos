# KART CHAOS 64 — v1.23 held-item sway

Upload the CONTENTS of this folder into your existing GitHub repository root. Merge folders, preserve your MP3s, commit and let Render rebuild with the existing settings.

Held items now use a small damped spring: they lag through turns, trail acceleration, swing forward when braking and react to bumps and landing impulses. They settle naturally when those forces stop. Slow rotation and gentle idle movement remain. Motion is bounded beside the kart, and the anchor sits slightly lower to leave more room beneath swaying balloons. The shield remains readable. Reduced-motion mode keeps the held item still.

This is visual feedback only; inventory, item use, driving physics and the item HUD are unchanged. It applies to all six held items and to rival karts through their existing state fields. All previous arena and gameplay improvements are included. Music folders and MP3 handling are unchanged: keep existing MP3 files.

Validation: production build; 186 automated tests, including turn reversal, acceleration/braking, bounded motion, settling, reduced motion, cleanup and consistency at 30/60 fps; browser visual checks with simulated driving inputs and both art styles.

Developer browser fixture: /tests/held-items-browser.html; Motion / still toggles simulated driving forces.
