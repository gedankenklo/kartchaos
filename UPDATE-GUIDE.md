# KART CHAOS 64 v1.14.0 - More assertive Sky bots

Upload ALL contents to your existing GitHub repository ROOT. Merge folders,
commit and let Render rebuild. Refresh and check Settings for v1.14.0.
The public folder includes ONLY favicon assets. Merge it; public/music and
all your MP3s stay untouched.

SKY PLATFORMS
Bots detect lack of actual progress, including nose-to-nose collision standoffs
that previously escaped the stationary-kart detector. They commit to an escape.
Additional safe turning waypoints smooth routes between platforms.
Bots travel faster on clear lanes and use Turbo Juice to close distance across
long safe straights. Turbo holders no longer automatically retreat merely
because they have one balloon left. Existing edge braking and full boost-lane
clearance checks remain in place. Other arenas retain their current pacing.

LIGHTING CHECK
Lighting already rerolls independently for every new round. Same-map rematches
and cup rounds were verified; no change to the fair random selection was needed.
Consecutive night rounds are valid. Ember Keep still chooses sunset or night.

VALIDATION
Production build and all 167 unit/simulation tests pass.
All 27 two-minute navigation scenarios pass across nine arenas and three speeds.
Nine additional two-minute, two-bot Sky scenarios cover Turbo Juice pursuit,
engagement, standoff recovery and edge-fall limits. Longest slow spell was under
three seconds in those scenarios. Run npm run test:sky to repeat those checks.
