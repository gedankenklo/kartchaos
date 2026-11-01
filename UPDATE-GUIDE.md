# KART CHAOS 64 v1.12.1 - Random arena music

Upload all contents to your existing GitHub repository ROOT, commit and let
Render rebuild. Refresh and check Settings for v1.12.1.
Your public/music folder is not included or changed. Your MP3s stay in place.

Whenever a new arena round loads, Auto music chooses a random working MP3 from
that arena's folder. Same-map rematches also make a fresh random choice.
Pausing, resuming and normal frame updates do not reroll the track.
After the starting song ends, the playlist continues in alphabetical order
and loops. The Next track control still works normally.
Single-file folders play that file. Empty folders retain generated music.
Title and pause music keep their existing behaviour.

Validation: production build and all 158 unit/simulation tests pass, including
random starts, rematches, pause/resume, playlist continuation and empty fallback.
