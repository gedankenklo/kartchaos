# Update 1.44 — Smoother online battles

Remote drivers, projectiles and the soccer ball now render smoothly between network updates. Local movement remains immediately responsive, with small server corrections blended out instead of snapping. Teleports and eliminations are handled immediately. The server still controls hits, items, pickups and scores; client prediction no longer fires weapons or changes balloon counts.

The new connection protocol sends changed fields instead of the entire match on every update, with periodic complete snapshots and recovery when a baseline is missing. Snapshot data was 79% smaller in a local benchmark; actual savings vary with the match. The server serializes the common update once per room. Slow connections skip stale snapshots and recover with a complete current update.

Inputs are batched at roughly 30 messages per second while preserving 60 Hz input frames and immediate action presses. The server acknowledges only input frames it has processed. Input queues are bounded so old steering cannot build up indefinitely. Server timing uses a real-time accumulator with bounded catch-up, and bot navigation is warmed before play. Reconnecting one player no longer resets the other players' input sequences. Older clients remain compatible, but refresh to receive the improvements.

An ONLINE indicator displays round-trip delay and warns about connection delay or a busy server. Hover over it for update spacing, jitter, server step time and incoming data rate.

Validation: production build and 261 automated tests passed, including lossless snapshot reconstruction on all 16 arenas, simulated 133 ms round-trip delay with jitter, queue limits, collision-state isolation and interpolation. Browser play checked through an artificial roughly 140 ms delayed connection with jitter. Multiplayer regression checks cover room authority, readiness, rematches, cups, special arena events, compact updates, reconnection and ping. This is local validation, not a measurement of the Render instance.

## Upload
Extract this ZIP and upload its CONTENTS at the GitHub repository root, preserving folders. Merge/overwrite the included files and commit. Let Render finish rebuilding. Everyone should refresh their game tab after the deploy so they receive the new client. Your MP3s and tracks.json are not included or replaced. Try the free tier again before deciding whether you need a larger instance.
