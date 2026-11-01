# KART CHAOS 64 — v1.31 sudden-death sound and pulse

Upload these contents into your existing GitHub repository root, merging folders. Keep existing MP3 files. Commit and let Render rebuild.

Sudden death begins with a bass impact, descending alarm and low rumble. An ongoing warning beat repeats every 1.15 seconds while sudden death is active. The warning label and containment boundary pulse on the same match-time rhythm, including the curved wall on Starcore Sphere.

The intro plays once per round. Pausing stops further beats; resuming does not restart the intro. Late joining an active sudden-death round gets one intro. Results/end-of-round stops further cues. Sounds respect mute and the effects-volume setting. Reduced-motion mode keeps the visual warning steady while retaining audio cues.

Validation: production build; 205 automated tests, including intro deduplication, beat timing, pause/resume, late joining and round reset. All previous map and music updates are included.

Preserve your MP3s. This patch includes placeholder files for all four v1.30 music folders, but contains no MP3s and does not replace tracks.json.
