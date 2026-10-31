import type {Arena} from './sim';
export type MusicScene=Arena|'title'|'pause';
export interface MusicFile {title:string;url:string;}
export class ArenaMusic {
 tracks:Partial<Record<MusicScene,MusicFile[]>>={};failed=new Set<string>();positions=new Map<MusicScene,number>();arena:MusicScene|null=null;file:MusicFile|null=null;media:HTMLAudioElement|null=null;source:MediaElementAudioSourceNode|null=null;pending=false;blocked=false;generation=0;
 constructor(private createMedia:()=>HTMLAudioElement=()=>new Audio()){}
 async load(){try{const response=await fetch('/music/tracks.json');if(!response.ok)return;const data=await response.json();for(const [arena,tracks] of Object.entries(data.arenas??{})){if(Array.isArray(tracks))this.tracks[arena as MusicScene]=tracks.filter((track:any)=>typeof track.title==='string'&&typeof track.url==='string'&&track.url.startsWith(`/music/${arena}/`)&&!track.url.includes('..'));}}catch{/* Generated music remains available offline or without a manifest. */}}
 pause(){this.generation++;this.pending=false;this.media?.pause();}
 unlock(){this.blocked=false;}
 next(arena:MusicScene){this.positions.set(arena,(this.positions.get(arena)??0)+1);if(this.arena===arena){this.pause();this.file=null;}}
 update(arena:MusicScene,active:boolean,context:AudioContext,destination:AudioNode):string|null {
  if(!active){if(this.media&&!this.media.paused)this.pause();return null;}
  if(this.arena!==arena){this.pause();this.file=null;this.arena=arena;}
  const tracks=(this.tracks[arena]??[]).filter(track=>!this.failed.has(track.url));if(!tracks.length){this.pause();this.file=null;return null;}
  const track=tracks[(this.positions.get(arena)??0)%tracks.length];
  if(!this.media){this.media=this.createMedia();this.media.preload='metadata';this.source=context.createMediaElementSource(this.media);this.source.connect(destination);this.media.onended=()=>{if(this.arena)this.next(this.arena);};this.media.onerror=()=>{if(this.file){this.failed.add(this.file.url);this.pause();this.file=null;}};}
  if(this.file?.url!==track.url){this.pause();this.file=track;this.media.src=track.url;this.media.load();}
  if(this.media.paused&&!this.pending&&!this.blocked){this.pending=true;const generation=this.generation;void this.media.play().then(()=>{if(generation===this.generation)this.pending=false;}).catch((error:unknown)=>{if(generation!==this.generation)return;this.pending=false;if((error as {name?:string})?.name==='NotAllowedError')this.blocked=true;else if((error as {name?:string})?.name!=='AbortError'){this.failed.add(track.url);this.file=null;}});}
  return track.title;
 }
}


