# Your arena soundtrack

Drop MP3 files into the matching folder below, upload to GitHub and let Render rebuild.
No filename list or code edits are needed. Files are discovered automatically during npm run build.

fortress = The Fortress
sky = Sky Platforms
neon = Neon Bowl
yard = Copper Yard
depot = Tide Depot
quarry = Rift Quarry
castle = Ember Keep
beach = Sunbreak Beach
stadium = Floodlight Stadium
foundry = Clockwork Foundry
harbour = Frostbite Harbour
ruins = Overgrown Ruins

Examples: public/music/beach/Sunset.mp3 or public/music/castle/01-Dark-Keep.mp3.
Keep files directly inside the arena folder. Each arena round chooses a random starting MP3. Further tracks play in alphabetical
order and repeat the playlist. One MP3 repeats. Empty folders use generated music.
Unreadable MP3s are skipped; if none work, generated music takes over.

Settings > Music selection must be Auto (the default). Selecting a named generated
track explicitly overrides the arena MP3s. Next music track skips to the next MP3.
The existing Music slider, mute, pause and preview controls apply to MP3s too.

GitHub does not retain empty folders, so keep the .gitkeep placeholder or upload
an MP3 into each folder you use. Do not upload just the music folder at repository
root: it belongs INSIDE public/. Leave tracks.json alone; the build regenerates it.
To test locally use npm run dev. Rebuild/restart after adding or deleting MP3s.

## Main menu and pause (v1.2.1)

public/music/title/ = main menu, setup and lobby music
public/music/pause/ = pause screen music

These folders follow the same MP3 discovery and looping rules as the arenas.
Empty folders use generated music. Title music starts after your first menu click or controller selection.
Resuming a match returns
to the arena soundtrack. Preview arena music in Settings temporarily previews
the selected arena, then returns to the menu or pause soundtrack.

