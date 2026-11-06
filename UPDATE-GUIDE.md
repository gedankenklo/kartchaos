# KART CHAOS 64 v1.51.0 - Rift Quarry performance

Extract this ZIP and upload its CONTENTS at the GitHub repository root, preserving folders. Merge/overwrite, commit, and let Render rebuild. Refresh every player's game tab. Client and server changes are included.

The chickens are local scenery and are not sent as network state. The main measured bottleneck was repeated obstacle-list allocation during bot path probes. Static collision shapes are now reused, cow collision shapes are calculated once per room tick, fixed navigation destinations reuse a bounded connection cache, and searches reuse graph edges. Each animal flock is calculated once per rendered update rather than once per animal.

Local 30-second benchmark, Rift Quarry, one human plus seven bots, 150cc:
- Mean simulation step: 5.297 ms before, 0.882 ms after (about 83% less work).
- 95th percentile: 43.851 ms before, 6.267 ms after.
- Largest observed step: 98.06 ms before, 16.39 ms after.
- Cold navigation graph: 2362.9 ms before, 536.6 ms after.
- Snapshot throughput: unchanged at 52.9 KiB/s in this workload. Final kart positions matched before/after across six benchmark workloads.

These are local measurements, not measurements of your Render instance or browser frame rate. Live online results still depend on server capacity, concurrent rooms and network conditions.

Validation: 281 tests passed, production build passed. Three 120-second Quarry navigation runs passed: all four bots reached the roof at 50/100/150cc, no falls, longest stalls below 0.5 seconds. A real two-client Quarry compact-protocol test passed, including movement, applied input acknowledgements, keyframes and reconnection.

All farm scenery, collisions and upper-deck bot routes remain. No MP3s or tracks.json are included; existing music stays untouched.
