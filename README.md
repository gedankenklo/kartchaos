# KART CHAOS 64

An original browser balloon battle game. No accounts, no racing, no borrowed game assets. Procedural low-poly karts, scenery and synthesized sound.

## Run

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

Open the printed Vite URL. Quick Play runs entirely in the browser. For production and online rooms:

```sh
npm run build
npm start
```

Open http://localhost:3000. In Online, enter `ws://localhost:3000`, create a room, ready up, and start. Other browsers can join with the six-character room code. Each browser can bring 1–4 local players, up to eight combined humans and bots. Set bot count before creating a room. Every participant must be ready; the host starts and rematches.

## Play

WASD drive · S brake/reverse · Shift drift · Space hop · E use item · R recover locally · Escape menu. S brakes to a stop; keep holding briefly to engage reverse. Steering builds progressively, with tighter low-speed turns and gentler high-speed steering. Releasing the throttle retains momentum; glancing wall contact slides rather than bouncing the kart backward. Hold W + Shift while steering to hop into a powerslide. The kart faces into the corner while its velocity slides outward; countersteer to reduce the slip angle. Hold for one second, then release Shift for a mini-turbo. The drift has visible countersteering, wheel sparks and fading skid marks. The chase camera eases through turns and shortens its arm around obstructions instead of abruptly climbing over walls. Collect violet boxes. Hits remove one balloon with a brief invulnerability period. Last survivor wins; the last 45 seconds bring a shrinking danger ring. Falling in Sky Platforms costs one balloon and returns the kart to the center.

The original animal crew includes Rook the fox, Bolt the raccoon, Mango the duck, Plum the rabbit, Mint the frog, Peach the cat, Skip the dog and Pip the bear. They wear team-color pilot caps and drive rounded club karts with animated steering, spinning wheels, body lean and trailing scarves. Use **Choose driver** in the main menu or click a player row in Match Setup. Preview a character, choose the local player slot, and confirm **Drive as**. Choices are saved in this browser and applied to local matches, room creation, joining, and rematches. Multiple players may choose the same character. Bots use unclaimed characters where possible. Online driver changes between rounds reset readiness for that client.

Use Couch mode for up to four viewports. All four keyboard layouts are visible and rebindable in Settings. Player 2 defaults to arrows, right Shift, Numpad 0, Enter. A gamepad automatically maps to each local slot; explicit assignment is also available. Triggers drive/brake, stick steers, A hops, X/LB drifts, B/RB fires. Keyboard rollover can limit simultaneous keys; gamepads are recommended for four players.

## Battle arenas

All six are selectable for solo, couch and online battles. Size labels appear on the selection cards; every arena supports up to eight participants.

| Arena | Size | Layout |
| --- | --- | --- |
| Copper Yard | Small · 85 m | Crate-lined lanes, compact crossfire, broad central turning space. |
| Sky Platforms | Medium · 115 m span | Floating islands and wide bridges with dangerous edges. |
| Tide Depot | Medium · 136 m | Two offset raised piers, four long ramps and broad ground channels. |
| Neon Bowl | Large · 148 m diameter | Banked circle, obstacles and a raised central platform. |
| Rift Quarry | Large · 208 m | Three asymmetrical terraces, six ramp approaches and wide desert valleys. |
| The Fortress | Extra large · 230 m | Four two-tier blocks, eight ramps and four true overpasses. |

The new arena definitions in `src/arenas.ts` are shared by physics, rendering, pickups and bots. Automated checks validate safe spawns, connected navigation and continuous ramps. Browser checks verify all new previews and selected characters in actual split-screen play.

## Deploy to Render

Commit this folder to your own GitHub repository and create a Render Blueprint from `render.yaml`, or create a Node web service manually:

* Build: `npm ci && npm run build`
* Start: `npm start`
* Node: 22
* Health: `/health`
* `PORT`: supplied by Render; defaults to 3000 locally.

HTTPS pages require the `wss://` address of the deployed service. The same service serves the built client and WebSockets. No third-party backend keys are required. For a separately hosted static client, enter the Render service's `wss://` URL in its Online lobby. Invitation URLs include the server address and room code.

Rooms live in memory in a **single server instance**. Do not horizontally scale without adding shared room coordination. Free hosting may sleep: the first connection can require waiting for the server to wake. Server restarts remove rooms. Ping/pong heartbeats detect dead connections; clients attempt reconnect with the private session token. Disconnected drivers wait 15 seconds before bots take over; empty rooms expire after a minute. Pausing a local match freezes it; opening an online menu does not freeze the shared match.

## Architecture

* `src/sim.ts`: shared fixed 60 Hz deterministic vehicle, terrain, combat, items, navigation, AI, match rules.
* `src/arenas.ts`: six-arena catalog, dimensions, new terrain layouts, item placements and navigation surfaces.
* `src/terrain.ts`: shared solid blocks, ramps, bridge slabs and floor surfaces; height-aware support and navigation distinguish overpasses from underpasses.
* `src/render.ts`: Three.js procedural world, kart models, follow cameras, split-screen, particles.
* `src/characters.ts`: original driver and kart models, batched static details, animation, and the 3D crew portrait viewer.
* `src/input.ts`: keyboard rebinding and gamepad assignment.
* `src/audio.ts`: original synthesized engine and action sounds.
* `src/network.ts`: room client, reconnect, sequenced inputs, local prediction and authoritative replay.
* `server/index.ts`: Node HTTP + WebSocket rooms, 60 Hz authoritative simulation, 20 Hz snapshots, readiness, heartbeat, reconnect, rematch.
* `src/main.ts`, `style.css`: menus and HUD.

All combat and item decisions are server-owned in online mode. Client movement prediction never decides damage. The client snaps simulation to each authoritative snapshot then replays unacknowledged inputs. The renderer smooths remote vehicle transforms between snapshots and follows with smoothed cameras.

## Scope and limits

This release is a playable implementation, not a claim of production networking maturity. It includes six arenas, six items, three bot difficulties, 2–8 participants, up to four couch players, and mixed online/couch room support. Fortress is now approximately 230 metres across, with four large two-tier blocks, four bridges, eight ramps, an open central cross, and broad outer corridors. The blocks have 57.6-metre-wide lower terraces at 9 metres high, 28.8-metre-wide upper terraces at 16.5 metres high, and distinctive pastel colors for orientation. Ground corridors between blocks are 38.4 metres wide. All four bridges support traffic on top and underneath; karts, projectiles, mines, item pickups, cameras and bots distinguish these two floors. Bots can navigate to every upper terrace. Karts and driving speed retain their original scale. Sky Platforms is 1.8 times wider and deeper than the first release; Neon Bowl is twice as wide and deep. Sky uses non-overlapping floor tiles, while Neon uses one continuous radial surface matching its physical slope, eliminating the overlapping surfaces and floor self-shadow artifacts in the first release. Sky Platforms remains a single-height layout; Neon Bowl has banked edges and a raised center, but no tunnels. Terrain uses custom arcade physics rather than Rapier.

**Remaining work:** historical lag-compensated hit rewind, persistent rooms, touch driving controls, music, advanced bot defensive tactics, multi-level Sky Platforms, and Neon Bowl tunnels. Online uses live authoritative projectile collisions and bounded steering seekers, not historical hit rewind. Remote transforms use exponential interpolation rather than a timestamped snapshot buffer. Reconciliation approximates acknowledgments for held inputs rather than a full server-tick input queue, so high latency can produce visible corrections. Four physical controllers and real wide-area network conditions require further hardware testing. Driver choices, keyboard bindings and server address persist in this browser; other settings reset on reload.

## Verification

```sh
npm test
npm run build
npx tsx --test tests/network.test.ts
```

`network.test.ts` expects `npm start` running at port 3000 (or the address in `TEST_SERVER`). It opens independent WebSocket clients and verifies rooms, mixed local participants, readiness, authority, movement, selected driver synchronization, new arena hosting, and reconnect. `tests/soak.ts` runs complete eight-bot battles in all six arenas and checks that they finish with valid positions.

Arena polish: Quarry ramp approaches are separated; Depot piers are shorter with generous ramp approach space. Balloon tethers connect rear chassis mounts to animated balloon knots. Arena-specific skies, mountains, clouds, coastal water, a sunset skyline and floating islands surround battles. Kart collisions transfer momentum, with stronger turbo shoves; ordinary bumps do not directly remove balloons, but Turbo Juice rams and falling off Sky Platforms do.

Balloons now use damped spring motion: they lean outward in turns, trail acceleration and turbo, react to bumps, and settle while their tethers remain attached. Item boxes start a 2.4-second slowing roulette; fire stops it after a short wind-up, and a separate new press uses the prize. Rolls and stop timing run in the shared authoritative simulation. World-projected procedural grass, sand, masonry, metal panels and wood grain add detail without overlapping floor geometry; karts also have subtle paint and tire detail.

Battle feedback polish: spectator HUD and engine audio follow the same surviving kart, with speed-sensitive pitch and volume. Balloons are smaller with roughly half-length tethers and constrained turn sway. Fortress upper terraces leave a 9.6 m bypass at each ramp entrance. Shockwave emits a dedicated event for three cyan/violet expanding rings and a translucent energy shell with a deep impact sound. Collected boxes shatter at their own positions; during the final 0.65 seconds of cooldown they grow back with an overshoot and glow, becoming collectible at full size.

Gloss and ricochet update: balloons have glossy clearcoat and slight translucency. Enable Shuffle maps between rounds below the arena cards or on the results screen; the first arena remains your selection, and rematches draw a non-repeating shuffled pool. Online hosts control this setting for everyone. Ricochet Pod replaces the basic rocket: a spinning green pod bounces off blocks, perimeter walls and circular bumpers, follows decks/ramps, drops off Sky edges, expires after eight seconds (or twelve rebounds), and can hit its owner after a bounce. Each animal driver has a distinct synthesized reaction voice for damage, wall impacts and kart contact; preview it using Hear in the driver selector.

Soft toon art trial: use Art style in the header or pause menu to compare Original and Soft toon. Try Fortress + Rook selects the prototype arena/driver. The trial adds banded lighting, a warm/cool palette, lightly beveled Fortress blocks, grass borders and cream paths, a painted club crest, ramp edge markings, plus subtle Rook outlines, chunkier wheels/head proportions and a contact shadow. Balloons keep their glossy latex material. The other five arenas and seven drivers retain their existing assets. The choice is saved per browser and changes no shared gameplay or collision data.

Full soft-toon rollout: all six arenas and eight drivers now share the approved shading, outlines and character proportions. Raised decks use brighter tops and contrasting side faces. Cream lip markings and dark edge bands mark exposed ledges while shared platforms, bridge joins and ramp entrances remain open. Each arena retains its own palette. Item boxes are rounded glossy translucent cubes with raised question marks; pickup plays the existing chime and drops sixteen fading glass-like shards, with no flash sphere, expanding ring or cloud. Respawn growth remains. The Original/Soft toon appearance switch now applies across the whole game.

50cc preserves the original pace; 100cc is 35% faster and 150cc is 75% faster, with stronger steering response, grip and braking. Weapons scale with engine class. Choose Speed in setup or between rounds; online hosts control it. Turbo Juice allows two seconds of forward ram damage, respecting shields and invulnerability. Ordinary bumps and drift boosts only shove. Controller menus use D-pad/stick, A select, B back, LB/RB focus cycling and Start pause/resume, with controller dropdowns and an on-screen text keyboard. Held menu buttons are blocked from driving until released. Both art styles remain; confirmation reflects the selected style. Item boxes have iridescent glass, reflections, glowing cores and orbiting sparkles; pickup remains shards and sound only.

Menu browser checks: run the Vite development server and open `/tests/menu-browser.html`. The fixture exercises production GamepadMenu with simulated pad signals and reports selection, text entry, modal focus and pause/back results. Physical controller hardware is still a separate playtest.

Round feedback: the last balloon emits one authoritative eliminated event. Karts spin, rise and shrink over 1.15 seconds with a small star burst, ring and knockout sound; the local camera holds briefly before spectating. Reduced motion uses a simple shrink without spin or lift. Rematches clear the animation. Drift audio layers filtered tire noise and a restrained squeal over the engine, follows actual slip and speed, and fades on release, airtime, pause or mute. Original maps now use lower sun/ambient lighting and filmic highlight compression; Soft Toon lighting is unchanged. For deterministic visual/audio QA, use the Vite dev server at `/tests/feedback-browser.html`.

Spectator switching: after elimination, use your assigned left/right steering keys (P1 A/D, P2 arrows by default), controller LB/RB or D-pad left/right, or on-screen previous/next arrows. Each local view keeps its own target. Camera, item HUD, engine and tire audio follow that selection; eliminated targets are skipped and rematches clear choices. This is local viewing only and sends no extra gameplay input to rivals.

Chaos Cup and battle polish: select Battle format → Chaos Cup for four different arenas, starting with your selected map. The same drivers return each round, points carry forward (10/7/5/4/3/2/1/0 by survival order), and the final screen shows animated podium drivers. Cup ties use round wins, then successful hits. Online hosts advance the shared cup; roster changes wait until it ends. Disconnected seats remain in the cup with bot takeover after the reconnect grace period. Ordinary single rounds and map shuffle remain available.

Hits now identify attacker and shield absorption. Successful hits get a brief local impact burst, balloon-pop sound, confirmation chime and “You hit …” feedback; local damage gets a short edge flash. Eight distinct idle/victory gestures and a Preview victory pose button add personality without changing handling. Arena atmosphere adds drifting clouds, quarry dust, yard leaves and flags, Fortress pennants, Depot water ripples and pulsing Neon signs. Reduced motion keeps the new scenery still.

Settings now has independent Music, Engine and Effects & voices sliders saved per browser, plus an eight-second music preview. Each arena has an original quiet procedural soundtrack. Master mute silences every channel. Mines arm after 0.65 seconds, visibly pulse, and can then hit anyone, including their owner. Self damage grants no KO credit. Bots now lead shots, hold fire behind cover, avoid mines and projectiles, route to cover/height when threatened on their last balloon, and return inside the sudden-death ring.

QA fixtures: `/tests/cup-browser.html` exercises all four rounds using shared scoring/podium markup and real driver portraits; `/tests/feedback-browser.html` previews impacts, elimination, scenery and tire audio under Vite. These fixtures are not included in the production bundle.

Nine-arena update: Ember Keep is a 240 m dark castle arena with four open lava pits, raised stone decks and wide causeways. Falling into lava costs a balloon and returns you to the central courtyard. Sunbreak Beach spans 248 m with long sand lanes, low boardwalks, palms, parasols and a water horizon. Floodlight Stadium spans 256 m with a night pitch, goals, stands, floodlights and small sideline obstacles. Its optional football is pushed by karts, rebounds from walls, and is authoritative online. Crossing a goal mouth below the bar adds to the bonus Blue/Orange tally and triggers fireworks; after two seconds the ball resets stationary at midfield. Goals do not change balloon-battle victory or cup points. All nine maps participate in shuffle and cup selection.

Music now has 27 original arrangements, three per arena. Auto rotates arrangements while playing; Settings → Music selection lets you choose any track or advance with Next music track. The music preference is saved. Setup controls use aligned labels and full-width selectors. Victory arms now point outward from the shoulders rather than rotating inward through the face; animated hand clearance is checked for all eight drivers.

Stadium bowl and floor repair: pitch stripes, field markings, and the center circle are now painted into a single mipmapped turf surface, with no stacked floor decals. Beach boardwalk grain and plank seams are painted on the existing deck top faces; the almost coplanar cap panels and stripes have been removed in Original and Soft Toon. Stadium seating now rises through twelve tiers to a roof rim at 32 m, with more than 3,000 instanced spectators and 44 m floodlights. Thirty-two perimeter boards use an atlas of eight fictional sponsors: Turbo Juice, Bubble Co., Rook Racing, Mango Fizz, Plum Power, Pitstop 64, Neon Tires, and Chaos Club. Decorative stands, spectators and signs stay outside the playable pitch and do not obstruct the chase camera. Owned painted textures and stadium materials are released on map/style changes.

Preview depth fix: the overhead arena camera now fits its near and far clipping planes to the complete padded arena bounds on each view angle. This restores precision between the distant turf, foundation, thin trim and crowd surfaces during preview rotation. The close-up driving cameras retain their existing settings. Tests cover stadium corners across the orbit and separation of the pitch from its foundation in a 24-bit depth buffer.

## Custom MP3 soundtrack (v1.2.0)

Add MP3s directly to `public/music/<arena>/` and rebuild. Arena folders are fortress,
sky, neon, yard, depot, quarry, castle, beach and stadium. Files are discovered by
`scripts/scan-music.mjs` automatically before development or production builds.
In Auto music mode, each arena plays its MP3s in filename order on repeat. Empty
folders or failed MP3s fall back to generated music. Explicit generated-track
selections still override Auto. See `public/music/README.md` for the folder mapping.
