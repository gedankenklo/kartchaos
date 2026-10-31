import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {scanMusic,arenaFolders} from '../scripts/scan-music.mjs';
test('music folders are discovered automatically with safe URLs, stable order and empty fallback',async()=>{const root=await mkdtemp(join(tmpdir(),'kart-music-'));try{await mkdir(join(root,'beach'));for(const file of ['02-Sunset #1.MP3','01-Waves.mp3','ignore.txt'])await writeFile(join(root,'beach',file),'');await mkdir(join(root,'beach','folder.mp3'));const manifest=await scanMusic(root);assert.equal(Object.keys(manifest.arenas).length,arenaFolders.length);assert.deepEqual(manifest.arenas.castle,[]);assert.deepEqual(manifest.arenas.beach,[{title:'01 Waves',url:'/music/beach/01-Waves.mp3'},{title:'02 Sunset #1',url:'/music/beach/02-Sunset%20%231.MP3'}]);}finally{await rm(root,{recursive:true,force:true});}});
