# KART CHAOS 64 — v1.29 controller shuffle navigation

Upload these contents to your existing GitHub repository root, merging folders. Keep your MP3 files. Commit and let Render rebuild.

Controller navigation uses a checkbox or radio button's full label row when choosing the next control. The shuffle option now sits between Speed and One more round in controller navigation, instead of being skipped because the small checkbox is far to the left. The complete shuffle row receives a visible controller highlight. A toggles shuffle. The next-round button remains preselected on each fresh results screen; online guests still cannot change host-only options.

Validation: production build; 199 automated tests; all 25 browser controller checks passed, including Up/Down through Speed, Shuffle and Next round, A toggling on/off, fresh-results defaults, picker focus restoration and disabled guest options. All previous game updates are included.

This patch contains no MP3s and does not replace tracks.json. Preserve your existing soundtrack files.
