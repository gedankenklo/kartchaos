# v1.3.0 combat feedback

Upload ALL contents of this update folder to your existing GitHub repository ROOT
(the page containing package.json), merge src and tests, then commit.
Wait for Render to redeploy and refresh the game. Settings should show v1.3.0.

Added: specific messages for self mines and ricochets, turbo rams, shields,
projectiles, shockwaves, falling, lava and danger-ring damage. Direction markers
point toward incoming attacks relative to the camera. Each split-screen player
receives their own messages, and spectators see the watched driver's feedback.

Ricochet Pods already damage their owner after a rebound and the initial
0.4-second launch protection. This update makes that cause explicit in the HUD.
No self-hit score is awarded. Shields and temporary invulnerability still apply.

This update contains no music files or music folders. Your existing MP3s stay
in public/music and are rediscovered automatically on the next Render build.
