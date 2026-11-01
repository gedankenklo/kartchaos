# KART CHAOS 64 v1.10.0 - Simple stadium team battles

Upload ALL contents of this update to your existing GitHub repository ROOT.
Merge src, server, scripts and tests; replace package.json and package-lock.json.
Commit, wait for Render, refresh and check Settings for v1.10.0.
Your public/music folder is not included or changed. Your MP3s stay in place.

Stadium rules are automatic. No soccer-mode selector remains.
Every stadium round assigns random, balanced Blue and Orange teams.
The authoritative server shares those assignments with every online client.
Each driver keeps a clear team label, team-colored marker and attack arrow.

A goal removes exactly ONE balloon from EVERY surviving defending-team driver.
Own goals therefore hurt the scorer's entire team. Goal damage bypasses shields
and temporary invulnerability; eliminated drivers remain eliminated.
The ball returns to midfield after a goal, with fireworks and a bonus score.
The football score does not determine victory. The last team with balloons wins.
Normal items, permanent eliminations, round timer and sudden death remain.
There are no soccer respawns or next-goal-wins overtime.
Friendly weapon damage stays disabled; your own weapons can still hurt you.
Team victory results and cup points use the actual random assignments.

All v1.9 arena improvements and earlier effects remain included.
Checks: production build, 150 unit/simulation tests, six multiplayer tests,
and browser checks of the automatic stadium setup and team labels passed.
