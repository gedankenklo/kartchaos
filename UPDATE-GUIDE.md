# KART CHAOS 64 — v1.26 smoother driving and solid beach palms

Upload these contents to your existing GitHub repository root, merging folders. Keep your existing MP3s. Commit and let Render rebuild.

Kart self-shadows are restored in both styles.

Offline rendering now interpolates kart positions and angles between fixed 60 Hz simulation steps. Physics remains unchanged. Cameras follow the displayed kart position, including network-smoothed spectator targets, instead of mixing raw simulation positions with smoothed visuals. This targets the few-pixel vibration visible during movement. Confirm the improvement in motion on your own display.

Sunbreak Beach has eight additional palms inside the arena. Shared trunk geometry defines collision footprints for karts, ricochets, seekers and bot route planning. Existing offshore traffic fixes remain included.

Validation: production build; 191 automated tests including non-mutating interpolation, angle wrapping, teleport handling, palm collisions and ricochet rebounds; all 36 two-minute navigation scenarios (72 simulated match minutes).

This patch contains no MP3s and does not replace tracks.json. Preserve existing soundtrack files.
