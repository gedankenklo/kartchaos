import {ruinsRavineAt} from './newArenaRules';
import {rampHeight,type Ramp} from './terrain';
export type Arena='fortress'|'sky'|'neon'|'yard'|'depot'|'quarry'|'castle'|'beach'|'stadium'|'foundry'|'harbour'|'ruins';
export const ARENA_IDS:Arena[]=['fortress','sky','neon','yard','depot','quarry','castle','beach','stadium','foundry','harbour','ruins'];
export const ARENAS:Record<Arena,{name:string;size:string;scale:number;height:number;extent:number;note:string;icon:string}>={
 fortress:{name:'The Fortress',size:'XL · 269 M',scale:2.4,height:1.5,extent:56,note:'Four blocks. Three floors. Endless escapes.',icon:'⚑'},
 sky:{name:'Sky Platforms',size:'L · 138 M',scale:2.15,height:1,extent:37,note:'Open skies. Broad bridges. Dangerous edges.',icon:'☁'},
 neon:{name:'Neon Bowl',size:'L · 148 M',scale:2,height:1.25,extent:37,note:'Open rim. Wide banking. Watch the drop.',icon:'◎'},
 yard:{name:'Copper Yard',size:'S · 85 M',scale:1.25,height:1,extent:34,note:'Compact crossfire with room to powerslide.',icon:'▦'},
 depot:{name:'Tide Depot',size:'M · 136 M',scale:1.7,height:1.25,extent:40,note:'Raised piers, long ramps and broad channels.',icon:'≋'},
 quarry:{name:'Rift Quarry',size:'L · 208 M',scale:2,height:1.4,extent:52,note:'Three terraces. Wide valleys. Big ambushes.',icon:'▲'},
 castle:{name:'Ember Keep',size:'XL · 240 M',scale:2,height:1.2,extent:60,note:'Dark stone. Broad causeways. Open lava pits.',icon:'♜'},
 beach:{name:'Sunbreak Beach',size:'XL · 248 M',scale:2,height:1,extent:62,note:'Sweeping sand, boardwalks and a sunset coast.',icon:'☀'},
 stadium:{name:'Floodlight Stadium',size:'XL · 256 M',scale:2,height:1,extent:64,note:'Random teams. Bonus goals pop rival balloons.',icon:'⚽'},
 foundry:{name:'Clockwork Foundry',size:'L · 232 M',scale:2,height:1,extent:58,note:'Moving belts. Brass machinery. Broad factory lanes.',icon:'⚙'},
 harbour:{name:'Frostbite Harbour',size:'XL · 248 M',scale:2,height:1,extent:62,note:'Slippery ice. Grippy docks. An icebreaker at anchor.',icon:'❄'},
 ruins:{name:'Overgrown Ruins',size:'XL · 256 M',scale:2,height:1,extent:64,note:'Jungle courtyards. Temple terraces. Ravine causeways.',icon:'❧'},
};
export const LAVA_PITS=[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*23,z:z*21,width:18,depth:18})));
export function lavaAt(x:number,z:number){return LAVA_PITS.some(p=>Math.abs(x-p.x)<p.width/2&&Math.abs(z-p.z)<p.depth/2);}
export interface Block {x:number;z:number;width:number;depth:number;height:number;driveable?:boolean;color:string;}
export interface Expansion {floor:string;alternate:string;wall:string;blocks:Block[];ramps:Ramp[];items:{x:number;z:number}[];}
export const EXPANSIONS:Record<'yard'|'depot'|'quarry'|'castle'|'beach'|'stadium'|'foundry'|'harbour'|'ruins',Expansion>={
 yard:{floor:'#d4bda1',alternate:'#cbb291',wall:'#b7825e',blocks:[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*15,z:z*15,width:7,depth:10,height:3.4,color:x===z?'#bd7957':'#849d9b'}))),ramps:[],items:[{x:0,z:0},{x:0,z:22},{x:0,z:-22},{x:22,z:0},{x:-22,z:0},{x:25,z:25},{x:-25,z:25},{x:25,z:-25},{x:-25,z:-25}]},
 depot:{floor:'#acced0',alternate:'#9fbfc3',wall:'#75959f',blocks:[{x:-20,z:-5,width:14,depth:30,height:4,driveable:true,color:'#789cb0'},{x:20,z:5,width:14,depth:30,height:4,driveable:true,color:'#d8ad86'}],ramps:[{axis:'z',from:-30,to:-20,cross:-20,width:8,bottom:0,top:4},{axis:'z',from:20,to:10,cross:-20,width:8,bottom:0,top:4},{axis:'z',from:-20,to:-10,cross:20,width:8,bottom:0,top:4},{axis:'z',from:30,to:20,cross:20,width:8,bottom:0,top:4}],items:[{x:0,z:0},{x:0,z:28},{x:0,z:-28},{x:-20,z:-5},{x:20,z:5},{x:-33,z:0},{x:33,z:0},{x:-30,z:32},{x:30,z:-32}]},
 quarry:{floor:'#dfc39b',alternate:'#d6b589',wall:'#b88665',blocks:[{x:-26,z:-24,width:24,depth:18,height:5,driveable:true,color:'#be8b70'},{x:26,z:-12,width:18,depth:34,height:7,driveable:true,color:'#b17c68'},{x:-12,z:28,width:34,depth:18,height:4.5,driveable:true,color:'#cc9e79'},{x:5,z:-41,width:8,depth:10,height:5,color:'#b4836b'},{x:39,z:38,width:8,depth:10,height:6,color:'#bb8c71'},{x:-41,z:2,width:8,depth:8,height:5,color:'#c39474'}],ramps:[{axis:'x',from:-5,to:-14,cross:-24,width:8,bottom:0,top:5},{axis:'z',from:-3,to:-15,cross:-26,width:8,bottom:0,top:5},{axis:'x',from:7,to:17,cross:-12,width:8,bottom:0,top:7},{axis:'z',from:25,to:5,cross:26,width:8,bottom:0,top:7},{axis:'z',from:5,to:19,cross:-12,width:9,bottom:0,top:4.5},{axis:'x',from:18,to:5,cross:28,width:8,bottom:0,top:4.5}],items:[{x:0,z:0},{x:-26,z:-24},{x:26,z:-12},{x:-12,z:28},{x:-42,z:30},{x:42,z:-30},{x:0,z:43},{x:-6,z:-43},{x:42,z:0},{x:-43,z:-30},{x:12,z:7}]},
 castle:{floor:'#555363',alternate:'#4b495a',wall:'#34313e',blocks:[...[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*46,z:z*44,width:10,depth:10,height:10,color:'#454052'}))),{x:0,z:40,width:26,depth:16,height:6,driveable:true,color:'#625869'},{x:0,z:-43,width:22,depth:12,height:4,driveable:true,color:'#504b61'}],ramps:[{axis:'z',from:15,to:32,cross:0,width:12,bottom:0,top:6},{axis:'z',from:-19,to:-37,cross:0,width:10,bottom:0,top:4}],items:[{x:0,z:0},{x:0,z:40},{x:0,z:-43},{x:40,z:0},{x:-40,z:0},{x:44,z:23},{x:-44,z:-23},{x:23,z:42},{x:-23,z:-42},{x:0,z:17},{x:0,z:-20},{x:46,z:-20}]},
 beach:{floor:'#e6c99a',alternate:'#dec08c',wall:'#b39d80',blocks:[{x:-28,z:-22,width:26,depth:18,height:3,driveable:true,color:'#b58d65'},{x:28,z:22,width:28,depth:18,height:3,driveable:true,color:'#be9870'},{x:30,z:-30,width:9,depth:8,height:2.5,color:'#a9aba0'},{x:-33,z:32,width:10,depth:8,height:2.8,color:'#b1a594'}],ramps:[{axis:'x',from:-3,to:-15,cross:-22,width:12,bottom:0,top:3},{axis:'x',from:2,to:14,cross:22,width:12,bottom:0,top:3}],items:[{x:0,z:0},{x:-28,z:-22},{x:28,z:22},{x:-43,z:0},{x:43,z:0},{x:0,z:42},{x:0,z:-42},{x:-42,z:-43},{x:42,z:43},{x:40,z:-9},{x:-40,z:9},{x:-12,z:42},{x:12,z:-42}]},
 stadium:{floor:'#417959',alternate:'#396f51',wall:'#35465c',blocks:[...[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*51,z:z*26,width:4,depth:7,height:1.6,color:x>0?'#6a9fb6':'#c2916b'})))],ramps:[],items:[{x:-30,z:-35},{x:30,z:-35},{x:-30,z:35},{x:30,z:35},{x:-40,z:0},{x:40,z:0},{x:0,z:43},{x:0,z:-43},{x:-22,z:0},{x:22,z:0},{x:-10,z:23},{x:10,z:-23}]},
 foundry:{floor:'#8b9293',alternate:'#7f878c',wall:'#706455',blocks:[...[-1,1].map(x=>({x:x*26,z:0,width:16,depth:40,height:4,driveable:true,color:'#9f8158'})),...[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*43,z:z*40,width:6,depth:7,height:4,color:'#74665a'})))],ramps:[...[-1,1].flatMap(x=>[-1,1].map(z=>({axis:'z' as const,from:z*34,to:z*20,cross:x*26,width:10,bottom:0,top:4})))],items:[{x:0,z:0},{x:0,z:-24},{x:0,z:24},{x:-26,z:0},{x:26,z:0},{x:-43,z:0},{x:43,z:0},{x:0,z:44},{x:0,z:-44},{x:-42,z:22},{x:42,z:-22}]},
 harbour:{floor:'#d6e4e6',alternate:'#c7dce3',wall:'#9aafbd',blocks:[...[-1,1].map(z=>({x:0,z:z*32,width:66,depth:12,height:2.5,driveable:true,color:'#9e9783'})),...[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*44,z:z*36,width:6,depth:7,height:3.5,color:'#8a9b9f'})))],ramps:[...[-1,1].flatMap(z=>[-20,20].map(x=>({axis:'z' as const,from:z*12,to:z*26,cross:x,width:10,bottom:0,top:2.5})))],items:[{x:0,z:0},{x:-20,z:0},{x:20,z:0},{x:0,z:-32},{x:0,z:32},{x:-44,z:0},{x:44,z:0},{x:0,z:48},{x:0,z:-48},{x:40,z:20},{x:-40,z:-20},{x:20,z:46},{x:-20,z:-46}]},
 ruins:{floor:'#a3b88b',alternate:'#93a878',wall:'#6c7d62',blocks:[...[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*26,z:z*24,width:22,depth:20,height:4.5,driveable:true,color:'#a3a080'}))),...[-1,1].map(z=>({x:0,z:z*24,width:30,depth:8,height:4.5,driveable:true,color:'#a4a688'})),...[-1,1].map(x=>({x:x*48,z:0,width:6,depth:6,height:7,color:'#8e9478'}))],ramps:[...[-1,1].flatMap(x=>[-1,1].flatMap(z=>[{axis:'z' as const,from:z*2,to:z*14,cross:x*26,width:10,bottom:0,top:4.5},{axis:'x' as const,from:x*49,to:x*37,cross:z*24,width:10,bottom:0,top:4.5}]))],items:[{x:0,z:0},{x:0,z:-24},{x:0,z:24},{x:-26,z:-24},{x:26,z:-24},{x:-26,z:24},{x:26,z:24},{x:0,z:45},{x:0,z:-45},{x:48,z:45},{x:-48,z:-45},{x:-48,z:45},{x:48,z:-45}]},
};
export const isExpansion=(arena:Arena):arena is keyof typeof EXPANSIONS=>arena==='yard'||arena==='depot'||arena==='quarry'||arena==='castle'||arena==='beach'||arena==='stadium'||arena==='foundry'||arena==='harbour'||arena==='ruins';
export function expansionHeight(arena:keyof typeof EXPANSIONS,x:number,z:number):number {
 if(Math.abs(x)>ARENAS[arena].extent||Math.abs(z)>ARENAS[arena].extent)return -40;
 if(arena==='castle'&&lavaAt(x,z)||arena==='ruins'&&ruinsRavineAt(x,z))return -40;
 const layout=EXPANSIONS[arena];let height=0;
 for(const b of layout.blocks)if(Math.abs(x-b.x)<=b.width/2&&Math.abs(z-b.z)<=b.depth/2)height=Math.max(height,b.height);
 for(const r of layout.ramps){const h=rampHeight(r,x,z);if(h!==undefined)height=Math.max(height,h);}
 return height;
}
export function expansionNav(arena:keyof typeof EXPANSIONS):{x:number;z:number}[]{
 const e=ARENAS[arena].extent,points:{x:number;z:number}[]=[{x:0,z:0}],layout=EXPANSIONS[arena];
 for(const fx of [-.8,-.45,0,.45,.8])for(const fz of [-.8,-.45,0,.45,.8]){const x=fx*e,z=fz*e;if(expansionHeight(arena,x,z)>=0&&expansionHeight(arena,x,z)<.05)points.push({x,z});}
 for(const b of layout.blocks)if(b.driveable){points.push({x:b.x,z:b.z});for(const sx of [-1,1])for(const sz of [-1,1])points.push({x:b.x+sx*(b.width/2-2),z:b.z+sz*(b.depth/2-2)});}
 for(const r of layout.ramps){points.push(r.axis==='x'?{x:r.from,z:r.cross}:{x:r.cross,z:r.from},r.axis==='x'?{x:r.to,z:r.cross}:{x:r.cross,z:r.to});}
 return points;
}

