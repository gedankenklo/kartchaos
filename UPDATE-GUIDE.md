# Update 1.37 — Glacier bots, Cinder volcano and effects

- Glacier bots countersteer on ice, slow for ramp approaches and deliberately use the upper routes. A simulation regression checks that every bot reaches the summit at all three speeds.
- Cinder Crypt: reflective ground tiles, bat swarms, a distant erupting volcano and seven falling volcanic rocks per eruption. Growing dark shadows with amber outlines announce impacts. A direct hit costs one balloon; shields and recovery protection apply. The first eruption starts 18 seconds into play, then repeats every 28 seconds. Rock impacts follow the shared authoritative match clock, including online. Bots attempt to evade nearby warnings.
- Sunbreak Beach: larger, more frequent wheel splashes.
- Active Bubble Shield: glowing bubble and three luminous guards rotating around the kart. Reduced motion keeps the guards steady.

Validation: production build; 231 tests; 48 two-minute navigation scenarios; seven existing online checks and one focused two-client volcanic event check passed. Browser checked Cinder reflections, warnings, shield animation and stronger beach splashes.

## Upload
Extract this ZIP. Upload its CONTENTS at the GitHub repository root, keeping src, server, scripts and tests as folders. Merge/overwrite included files; do not delete the repository first. Commit and let Render rebuild. This ZIP contains no MP3s and does not replace your tracks.json or music folders.
