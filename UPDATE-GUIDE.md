# KART CHAOS 64 v1.6.0 - Visual polish

Upload ALL contents of this update to your existing GitHub repository ROOT,
merge src, server, scripts and tests, replace package.json and package-lock.json,
and commit. Wait for Render to deploy, refresh and check Settings for v1.6.0.

Visual changes:
- Clearer key/fill lighting, cooler shadows, stronger contact shadows and ledge rims.
- Painted bodywork, metallic hardware and matte textured tires in both art styles.
- Bounded spring suspension and landing compression, steering camber, nearby-rival
  glances and pupil movement, plus pickup/hit/confirmed-hit driver reactions.
- Existing blinking, scarves, spring balloons and victory personalities retained.
- Castle embers and torch halos, coastal foam and stadium crowd-light waves.
- Small depth-tested glows for item boxes, charged drift sparks and stadium lamps.
  These use shared textures and bounded geometry, with no fullscreen bloom pass.

Settings > Visual effects offers Full flair and Reduced (saved in this browser).
Reduced disables decorative glows and foam and reduces atmospheric particle count.
The system reduced-motion preference also suppresses added bounce and reactions.
Both Original and Soft toon remain available. Driving, collisions and maps stay
unchanged; ledge caps are visual markings and do not block ramps or bridges.

Verification: 127 automated tests and successful production build; shader checks
on Castle, Beach and Stadium; both art styles and three-player Chaos Cam checked.
The update includes earlier code changes and contains NO public/music files.
Your existing MP3 soundtrack remains in place and is rediscovered by the build.
