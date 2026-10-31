import {readdir,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
export const arenaFolders=['fortress','sky','neon','yard','depot','quarry','castle','beach','stadium','title','pause'];
export async function scanMusic(root){const arenas={};for(const arena of arenaFolders){const folder=join(root,arena);await mkdir(folder,{recursive:true});const files=(await readdir(folder,{withFileTypes:true})).filter(entry=>entry.isFile()&&/\.mp3$/i.test(entry.name)).map(entry=>entry.name).sort((a,b)=>a.localeCompare(b,'en'));arenas[arena]=files.map(file=>({title:basename(file).replace(/\.mp3$/i,'').replace(/[_-]+/g,' '),url:`/music/${arena}/${encodeURIComponent(file)}`}));}return {version:1,arenas};}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const root=resolve('public/music'),manifest=await scanMusic(root);await writeFile(join(root,'tracks.json'),JSON.stringify(manifest,null,2)+'\n');console.log(`Music: ${Object.values(manifest.arenas).reduce((count,tracks)=>count+tracks.length,0)} MP3s found across ${arenaFolders.length} music folders.`);}

