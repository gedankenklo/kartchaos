import {starfallWalkable,cryptLavaAt,stationHeight} from './extraArenaRules';
import {ruinsRavineAt} from './newArenaRules';
import {FORT,rampHeight,type Ramp} from './terrain';
export type Arena='fortress'|'sky'|'neon'|'yard'|'depot'|'quarry'|'castle'|'beach'|'stadium'|'foundry'|'harbour'|'ruins'|'starfall'|'glacier'|'crypt'|'starcore';
export const ARENA_IDS:Arena[]=['fortress','sky','neon','yard','depot','quarry','castle','beach','stadium','foundry','harbour','ruins','starfall','glacier','crypt','starcore'];
export const ARENAS:Record<Arena,{name:string;size:string;scale:number;height:number;extent:number;note:string;icon:string}>={
 starfall:{name:'Starfall Citadels',size:'XXL · 442 M',scale:2.4,height:1.5,extent:92,note:'Space CTF. Twin citadels. Three routes above a planet.',icon:'✦'},
 glacier:{name:'Glacier Slide',size:'XL · 280 M',scale:2,height:1.4,extent:70,note:'Full ice. Sliding bowls. Frozen ridges.',icon:'❅'},
 crypt:{name:'Cinder Crypt',size:'XL · 304 M',scale:2,height:1.6,extent:76,note:'Haunted battlements. Lava moats. Crumbling crypts.',icon:'☠'},
 starcore:{name:'Starcore Sphere',size:'XL · 312 M',scale:2,height:1,extent:80,note:'Open reactor shaft. Charging superlaser. Stay clear of the core.',icon:'◉'},

 fortress:{name:'The Fortress',size:'XL · 307 M',scale:2.4,height:1.5,extent:FORT.extent,note:'Four blocks. Three floors. Endless escapes.',icon:'⚑'},
 sky:{name:'Sky Platforms',size:'L · 138 M',scale:2.15,height:1,extent:37,note:'Open skies. Broad bridges. Dangerous edges.',icon:'☁'},
 neon:{name:'Neon Bowl',size:'L · 148 M',scale:2,height:1.25,extent:37,note:'Open rim. Wide banking. Watch the drop.',icon:'◎'},
 yard:{name:'Copper Yard',size:'S · 85 M',scale:1.25,height:1,extent:34,note:'Compact crossfire with room to powerslide.',icon:'▦'},
 depot:{name:'Tide Depot',size:'L · 232 M',scale:2,height:1,extent:58,note:'Pirate forts. Steal their flag. Bring it home.',icon:'⚑'},
 quarry:{name:'Rift Quarry',size:'XXL · 328 M',scale:2,height:1.4,extent:82,note:'Farmyard garage. Three floors. Roaming cows and open underpasses.',icon:'▤'},
 castle:{name:'Ember Keep',size:'XL · 240 M',scale:2,height:1.2,extent:60,note:'Dark stone. Broad causeways. Open lava pits.',icon:'♜'},
 beach:{name:'Sunbreak Beach',size:'XL · 248 M',scale:2,height:1,extent:62,note:'Sweeping sand, boardwalks and a sunset coast.',icon:'☀'},
 stadium:{name:'Floodlight Stadium',size:'XL · 256 M',scale:2,height:1,extent:64,note:'Random teams. Bonus goals pop rival balloons.',icon:'⚽'},
 foundry:{name:'Clockwork Foundry',size:'L · 232 M',scale:2,height:2,extent:58,note:'Moving belts. Brass machinery. Two-level furnace deck. Elevated horseshoe. Conveyor crossings.',icon:'⚙'},
 harbour:{name:'Frostbite Harbour',size:'XL · 248 M',scale:2,height:2,extent:62,note:'Ice basin. Tall dock lookout. Stepped L-shaped docks.',icon:'❄'},
 ruins:{name:'Overgrown Ruins',size:'XL · 256 M',scale:2,height:2.5,extent:64,note:'Towering temple. High terraces. Twin ravine crossings.',icon:'❧'},
};
export const LAVA_PITS=[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*23,z:z*21,width:18,depth:18})));
export function lavaAt(x:number,z:number){return LAVA_PITS.some(p=>Math.abs(x-p.x)<p.width/2&&Math.abs(z-p.z)<p.depth/2);}
export interface Block {x:number;z:number;width:number;depth:number;height:number;thickness?:number;driveable?:boolean;color:string;}
export interface Expansion {floor:string;alternate:string;wall:string;blocks:Block[];ramps:Ramp[];items:{x:number;z:number;y?:number}[];}
export const EXPANSIONS:Record<'yard'|'depot'|'quarry'|'castle'|'beach'|'stadium'|'foundry'|'harbour'|'ruins'|'starfall'|'glacier'|'crypt'|'starcore',Expansion>={
 starfall:{floor:'#596278',alternate:'#626b83',wall:'#303749',blocks:[{x:0,z:-20,width:24,depth:12,height:3,driveable:true,color:'#8999b4'},{x:0,z:0,width:40,depth:18,height:6,driveable:true,color:'#8290b1'},...[-1,1].flatMap(sign=>[-1,1].flatMap(side=>[{x:sign*76,z:side*22,width:18,depth:18,height:8,color:sign<0?'#647db0':'#a16f88'},{x:sign*76,z:side*22,width:14,depth:14,height:24,color:sign<0?'#647db0':'#a16f88'}])),...[-1,1].map(sign=>({x:sign*60,z:24,width:16,depth:14,height:5,driveable:true,color:'#7c7c9b'}))],ramps:[...[-1,1].map(sign=>({axis:'x' as const,from:sign*34,to:sign*12,cross:-20,width:12,bottom:0,top:3})),...[-1,1].map(sign=>({axis:'x' as const,from:sign*44,to:sign*20,cross:0,width:18,bottom:0,top:6})),...[-1,1].map(sign=>({axis:'z' as const,from:0,to:17,cross:sign*60,width:10,bottom:0,top:5}))],items:[{x:0,z:0},{x:0,z:28},{x:0,z:-28},{x:-35,z:0},{x:35,z:0},{x:-60,z:24},{x:60,z:24},{x:-75,z:0},{x:75,z:0},{x:-35,z:-12},{x:35,z:12}]},
 glacier:{floor:'#a7d6e4',alternate:'#bbdfe9',wall:'#537e9c',blocks:[{x:0,z:-38,width:94,depth:16,height:5,thickness:.6,driveable:true,color:'#a5d8e6'},...[-1,1].map(sign=>({x:sign*38,z:-3,width:18,depth:54,height:5,thickness:.6,driveable:true,color:'#81bed4'})),{x:0,z:-38,width:28,depth:16,height:11,driveable:true,color:'#d4edf1'},{x:0,z:12,width:24,depth:24,height:3,thickness:.6,driveable:true,color:'#acd9e8'}],ramps:[...[-1,1].map(sign=>({axis:'z' as const,from:46,to:24,cross:sign*38,width:14,bottom:0,top:5})),...[-1,1].map(sign=>({axis:'x' as const,from:sign*34,to:sign*14,cross:-38,width:12,bottom:5,top:11,thickness:.45})),{axis:'z',from:46,to:24,cross:0,width:14,bottom:0,top:3},...[-1,1].map(sign=>({axis:'x' as const,from:sign*29,to:sign*12,cross:12,width:12,bottom:5,top:3,thickness:.45}))],items:[{x:0,z:-38},{x:-38,z:-10},{x:38,z:-10},{x:8,z:12},{x:-52,z:48},{x:52,z:48},{x:0,z:54},{x:-54,z:-50},{x:54,z:-50},{x:-16,z:-38},{x:16,z:-38}]},
 crypt:{floor:'#51475e',alternate:'#62526b',wall:'#302b40',blocks:[
 {x:0,z:0,width:40,depth:40,height:4,driveable:true,color:'#76607e'},
 {x:0,z:0,width:14,depth:14,height:10,driveable:true,color:'#99849e'},
 ...[-1,1].flatMap(sign=>[
 {x:sign*46,z:0,width:20,depth:22,height:4,driveable:true,color:'#897486'},
 {x:0,z:sign*46,width:22,depth:20,height:4,driveable:true,color:'#897486'},
 {x:sign*28,z:0,width:16,depth:12,height:4,driveable:true,color:'#aa8a8c'},
 {x:0,z:sign*28,width:12,depth:16,height:4,driveable:true,color:'#aa8a8c'}]),
 ...[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*54,z:z*54,width:10,depth:10,height:16,color:'#49445f'})))
 ],ramps:[...[-1,1].flatMap(sign=>[
 {axis:'x' as const,from:sign*68,to:sign*56,cross:0,width:14,bottom:0,top:4},
 {axis:'z' as const,from:sign*68,to:sign*56,cross:0,width:14,bottom:0,top:4},
 {axis:'x' as const,from:sign*20,to:sign*7,cross:0,width:10,bottom:4,top:10},
 {axis:'z' as const,from:sign*20,to:sign*7,cross:0,width:10,bottom:4,top:10}])],
 items:[{x:0,z:0},{x:0,z:14},{x:0,z:-14},{x:-46,z:0},{x:46,z:0},{x:0,z:-46},{x:0,z:46},{x:-62,z:40},{x:62,z:-40},{x:40,z:62},{x:-40,z:-62},{x:62,z:40},{x:-62,z:-40}]},
 starcore:{floor:'#71849b',alternate:'#64778e',wall:'#354659',blocks:[...[-1,1].flatMap(sign=>[-1,1].map(side=>({x:sign*36,z:side*30,width:9,depth:11,height:4,color:'#66768d'})))],ramps:[],items:[...Array.from({length:8},(_,i)=>({x:Math.sin(i*Math.PI/4)*38,z:Math.cos(i*Math.PI/4)*38})),...Array.from({length:8},(_,i)=>({x:Math.sin(i*Math.PI/4)*70,z:Math.cos(i*Math.PI/4)*70}))]},


 yard:{floor:'#d4bda1',alternate:'#cbb291',wall:'#b7825e',blocks:[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*15,z:z*15,width:7,depth:10,height:3.4,color:x===z?'#bd7957':'#849d9b'}))),ramps:[],items:[{x:0,z:0},{x:0,z:22},{x:0,z:-22},{x:22,z:0},{x:-22,z:0},{x:25,z:25},{x:-25,z:25},{x:25,z:-25},{x:-25,z:-25}]},
 depot:{floor:'#d6bf91',alternate:'#ccb582',wall:'#8f7654',blocks:[
 ...[-30,0,30].map(z=>({x:0,z,width:14,depth:z===0?18:12,height:2.5,driveable:true,color:'#9f7951'})),
 ...[-1,1].flatMap(sign=>[-1,1].map(side=>({x:sign*45,z:side*23,width:9,depth:9,height:8,color:sign<0?'#6f98ad':'#bd8563'}))),
 ...[-1,1].map(sign=>({x:sign*34,z:42,width:20,depth:12,height:5,driveable:true,color:'#a5906d'}))
 ],ramps:[...[-30,0,30].flatMap(cross=>[-1,1].map(sign=>({axis:'x' as const,from:sign*19,to:sign*7,cross,width:cross===0?18:12,bottom:0,top:2.5}))),...[-1,1].map(sign=>({axis:'z' as const,from:18,to:36,cross:sign*34,width:10,bottom:0,top:5}))],items:[{x:-40,z:0},{x:40,z:0},{x:0,z:0},{x:0,z:30},{x:0,z:-30},{x:-25,z:18},{x:25,z:-18},{x:-34,z:42},{x:34,z:42},{x:-28,z:-43},{x:28,z:-43}]},
 quarry:{floor:'#bea579',alternate:'#b59b70',wall:'#88765b',blocks:[
 ...[6,12].flatMap(height=>{const outer=height===6?54:34,inner=height===6?22:12,band=outer-inner,center=(outer+inner)/2;return [-1,1].flatMap(sign=>[
 {x:0,z:sign*center,width:outer*2,depth:band,height,thickness:.6,driveable:true,color:height===6?'#a6674f':'#bc8660'},
 {x:sign*center,z:0,width:band,depth:inner*2,height,thickness:.6,driveable:true,color:height===6?'#a6674f':'#bc8660'}]);})
 ],ramps:[...[-1,1].flatMap(sign=>[
 {axis:'x' as const,from:sign*72,to:sign*54,cross:0,width:16,bottom:0,top:6},
 {axis:'z' as const,from:sign*72,to:sign*54,cross:0,width:16,bottom:0,top:6},
 {axis:'z' as const,from:sign*48,to:sign*34,cross:0,width:14,bottom:6,top:12,thickness:.5}])],
 items:[{x:0,z:0,y:0},...[-1,1].flatMap(sign=>[
 {x:sign*38,z:14,y:0},{x:14,z:sign*38,y:0},{x:sign*64,z:34,y:0},
 {x:sign*40,z:0,y:6},{x:24,z:sign*40,y:6},
 {x:sign*26,z:0,y:12},{x:18,z:sign*26,y:12}])]},
 castle:{floor:'#555363',alternate:'#4b495a',wall:'#34313e',blocks:[...[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*46,z:z*44,width:10,depth:10,height:10,color:'#454052'}))),{x:0,z:40,width:26,depth:16,height:6,driveable:true,color:'#625869'},{x:0,z:-43,width:22,depth:12,height:4,driveable:true,color:'#504b61'}],ramps:[{axis:'z',from:15,to:32,cross:0,width:12,bottom:0,top:6},{axis:'z',from:-19,to:-37,cross:0,width:10,bottom:0,top:4}],items:[{x:0,z:0},{x:0,z:40},{x:0,z:-43},{x:40,z:0},{x:-40,z:0},{x:44,z:23},{x:-44,z:-23},{x:23,z:42},{x:-23,z:-42},{x:0,z:17},{x:0,z:-20},{x:46,z:-20}]},
 beach:{floor:'#e6c99a',alternate:'#dec08c',wall:'#b39d80',blocks:[{x:-28,z:-22,width:26,depth:18,height:3,driveable:true,color:'#b58d65'},{x:28,z:22,width:28,depth:18,height:3,driveable:true,color:'#be9870'},{x:30,z:-30,width:9,depth:8,height:2.5,color:'#a9aba0'},{x:-33,z:32,width:10,depth:8,height:2.8,color:'#b1a594'}],ramps:[{axis:'x',from:-3,to:-15,cross:-22,width:12,bottom:0,top:3},{axis:'x',from:2,to:14,cross:22,width:12,bottom:0,top:3}],items:[{x:0,z:0},{x:-28,z:-22},{x:28,z:22},{x:-43,z:0},{x:43,z:0},{x:0,z:42},{x:0,z:-42},{x:-42,z:-43},{x:42,z:43},{x:40,z:-9},{x:-40,z:9},{x:-12,z:42},{x:12,z:-42}]},
 stadium:{floor:'#417959',alternate:'#396f51',wall:'#35465c',blocks:[...[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*51,z:z*26,width:4,depth:7,height:1.6,color:x>0?'#6a9fb6':'#c2916b'})))],ramps:[],items:[{x:-30,z:-35},{x:30,z:-35},{x:-30,z:35},{x:30,z:35},{x:-40,z:0},{x:40,z:0},{x:0,z:43},{x:0,z:-43},{x:-22,z:0},{x:22,z:0},{x:-10,z:23},{x:10,z:-23}]},
 foundry:{floor:'#8b9293',alternate:'#7f878c',wall:'#706455',blocks:[
...[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*11,z:z*10,width:8,depth:8,height:9,color:'#665746'}))),
{x:-30,z:-16,width:18,depth:34,height:4,driveable:true,color:'#9f8158'},
{x:-5,z:-38,width:84,depth:24,height:4,driveable:true,color:'#9f8158'},
{x:25,z:-20,width:12,depth:24,height:4,driveable:true,color:'#9f8158'},
{x:-5,z:-42,width:30,depth:12,height:8,driveable:true,color:'#a88b5d'},
{x:-32,z:37,width:10,depth:10,height:5,color:'#74665a'},
{x:34,z:30,width:12,depth:8,height:5,color:'#74665a'}],ramps:[
{axis:'z',from:19,to:1,cross:-30,width:12,bottom:0,top:4},
{axis:'z',from:10,to:-8,cross:25,width:12,bottom:0,top:4},
{axis:'x',from:49,to:31,cross:-20,width:10,bottom:0,top:4},
{axis:'x',from:-39,to:-20,cross:-42,width:10,bottom:4,top:8},
{axis:'x',from:29,to:10,cross:-42,width:10,bottom:4,top:8}],items:[
{x:0,z:24},{x:0,z:-24},{x:-30,z:-16},{x:-5,z:-42},{x:25,z:-20},{x:-47,z:0},{x:46,z:0},{x:0,z:45},{x:-47,z:42},{x:46,z:46},{x:0,z:0},{x:43,z:-20}]},
 harbour:{floor:'#d6e4e6',alternate:'#c7dce3',wall:'#9aafbd',blocks:[
{x:-35,z:-32,width:42,depth:14,height:2.5,driveable:true,color:'#9e9783'},
{x:-49,z:-10,width:14,depth:30,height:2.5,driveable:true,color:'#9e9783'},
{x:34,z:20,width:14,depth:48,height:4,driveable:true,color:'#9e9783'},
{x:6,z:43,width:70,depth:12,height:4,driveable:true,color:'#9e9783'},
{x:34,z:43,width:14,depth:12,height:7,driveable:true,color:'#a8aaa0'},
{x:-13,z:10,width:12,depth:10,height:2.7,color:'#8db4c4'},
{x:12,z:-19,width:10,depth:14,height:3.2,color:'#a6c9d3'},
{x:-5,z:-43,width:6,depth:8,height:4,color:'#8a9b9f'}],ramps:[
{axis:'x',from:2,to:-14,cross:-32,width:12,bottom:0,top:2.5},
{axis:'x',from:-24,to:-42,cross:-5,width:12,bottom:0,top:2.5},
{axis:'x',from:9,to:27,cross:8,width:12,bottom:0,top:4},
{axis:'z',from:19,to:37,cross:-10,width:12,bottom:0,top:4},
{axis:'z',from:19,to:37,cross:34,width:10,bottom:4,top:7},
{axis:'x',from:-5,to:27,cross:43,width:10,bottom:4,top:7}],items:[
{x:0,z:0},{x:-30,z:10},{x:20,z:-2},{x:-35,z:-32},{x:-49,z:-10},{x:34,z:43},{x:-10,z:43},{x:47,z:-38},{x:0,z:-53},{x:48,z:48},{x:-43,z:40},{x:4,z:30},{x:32,z:-31}]},
 ruins:{floor:'#a3b88b',alternate:'#93a878',wall:'#6c7d62',blocks:[
{x:0,z:-21,width:44,depth:38,height:3,driveable:true,color:'#a3a080'},
{x:0,z:-26,width:26,depth:18,height:6,driveable:true,color:'#b5ad88'},
{x:-43,z:-2,width:14,depth:22,height:3,driveable:true,color:'#939b78'},
{x:30,z:44,width:22,depth:16,height:4,driveable:true,color:'#a4a688'},
{x:44,z:-26,width:6,depth:8,height:8,color:'#8e9478'},
{x:-48,z:45,width:6,depth:6,height:7,color:'#8e9478'}],ramps:[
{axis:'z',from:8,to:-2,cross:-15,width:10,bottom:0,top:3},
{axis:'z',from:8,to:-2,cross:15,width:10,bottom:0,top:3},
{axis:'z',from:-6,to:-17,cross:0,width:10,bottom:3,top:6},
{axis:'z',from:-55,to:-35,cross:0,width:10,bottom:0,top:6},
{axis:'z',from:25,to:9,cross:-46,width:8,bottom:0,top:3},
{axis:'x',from:1,to:19,cross:44,width:12,bottom:0,top:4}],items:[
{x:0,z:0},{x:0,z:-26},{x:-16,z:-28},{x:16,z:-28},{x:-43,z:-2},{x:30,z:44},{x:-26,z:24},{x:8,z:24},{x:48,z:14},{x:-46,z:-44},{x:42,z:-48},{x:-28,z:47},{x:0,z:55}]},
};
export const isExpansion=(arena:Arena):arena is keyof typeof EXPANSIONS=>arena==='yard'||arena==='depot'||arena==='quarry'||arena==='castle'||arena==='beach'||arena==='stadium'||arena==='foundry'||arena==='harbour'||arena==='ruins'||arena==='starfall'||arena==='glacier'||arena==='crypt'||arena==='starcore';
export function expansionHeight(arena:keyof typeof EXPANSIONS,x:number,z:number,referenceY=Infinity):number {
 if(Math.abs(x)>ARENAS[arena].extent||Math.abs(z)>ARENAS[arena].extent)return -40;
 if(arena==='castle'&&lavaAt(x,z)||arena==='ruins'&&ruinsRavineAt(x,z))return -40;
 const layout=EXPANSIONS[arena];let height=arena==='starcore'?stationHeight(x,z):arena==='depot'&&Math.abs(x)<7||arena==='starfall'&&!starfallWalkable(x,z)||arena==='crypt'&&cryptLavaAt(x,z)?-40:0;
 for(const b of layout.blocks)if(Math.abs(x-b.x)<=b.width/2&&Math.abs(z-b.z)<=b.depth/2&&(!b.thickness||referenceY>=b.height-.85/ARENAS[arena].height))height=Math.max(height,b.height);
 for(const r of layout.ramps){const h=rampHeight(r,x,z);if(h!==undefined&&(!r.thickness||referenceY>=h-.85/ARENAS[arena].height))height=Math.max(height,h);}
 return height;
}
export function expansionNav(arena:keyof typeof EXPANSIONS):{x:number;z:number}[]{
 const e=ARENAS[arena].extent,points:{x:number;z:number}[]=[{x:0,z:0}],layout=EXPANSIONS[arena];
 for(const fx of [-.8,-.45,0,.45,.8])for(const fz of [-.8,-.45,0,.45,.8]){const x=fx*e,z=fz*e;if(expansionHeight(arena,x,z)>=0&&expansionHeight(arena,x,z)<.05)points.push({x,z});}
 if(arena==='crypt')points.push(...layout.items);
 if(arena==='starcore')for(const r of [24,38,50,64,72])for(let i=0;i<12;i++)points.push({x:Math.sin(i*Math.PI/6)*r,z:Math.cos(i*Math.PI/6)*r});
 if(arena==='glacier'||arena==='crypt')for(const x of [-56,-28,0,28,56])for(const z of [-56,-28,0,28,56])if(expansionHeight(arena,x,z)===0)points.push({x,z});
 if(arena==='starfall')for(const x of [-84,-60,-35,0,35,60,84])for(const z of [-28,-14,0,14,28])if(expansionHeight(arena,x,z)===0)points.push({x,z});
 if(arena==='depot')for(const x of [-52,-34,-20,20,34,52])for(const z of [-52,-36,-12,0,12,36,52])if(expansionHeight(arena,x,z)===0)points.push({x,z});
 for(const b of layout.blocks)if(b.driveable){points.push({x:b.x,z:b.z});for(const sx of [-1,1])for(const sz of [-1,1])points.push({x:b.x+sx*(b.width/2-2),z:b.z+sz*(b.depth/2-2)});}
 for(const r of layout.ramps){if(arena==='beach'||arena==='ruins'&&r.bottom===0){const d=Math.sign(r.from-r.to)*5;points.push(r.axis==='x'?{x:r.from+d,z:r.cross}:{x:r.cross,z:r.from+d});}points.push(r.axis==='x'?{x:r.from,z:r.cross}:{x:r.cross,z:r.from},r.axis==='x'?{x:r.to,z:r.cross}:{x:r.cross,z:r.to});}
 return points;
}

