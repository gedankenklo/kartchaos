import {BEACH_PALMS} from './beachProps';
import {CASTLE_LAMPS} from './castleProps';
import {neonRimContact} from './neonRim';
import {arenaSurface} from './newArenaRules';
import {chooseLighting,type Lighting} from './lighting';
import {newRoundStats,statsFor,type RoundStats} from './matchStats';
import {createFootball,stepFootball,soccerTeam,assignSoccerTeams,type Football} from './football';
import {createChampionship,scoreChampionship,type Championship} from './championship';
// Shared by browser and authoritative server. All distances are metres, time seconds.
import {FORT,fortressSolidHeight,skyHeight,neonHeight,FORT_BRIDGES,FORT_RAMPS,FORT_ITEMS} from './terrain';
import {ARENAS,ARENA_IDS,isExpansion,expansionHeight,expansionNav,EXPANSIONS,type Arena} from './arenas';
export type {Arena} from './arenas';
export {ARENA_IDS} from './arenas';
// Layout coordinates stay compact; simulation and scenery use these world dimensions.
// Karts, weapons and driving speed keep their original size, giving genuine driving room.
export const ARENA_SCALE=Object.fromEntries(ARENA_IDS.map(id=>[id,ARENAS[id].scale])) as Record<Arena,number>;
export const ARENA_HEIGHT=Object.fromEntries(ARENA_IDS.map(id=>[id,ARENAS[id].height])) as Record<Arena,number>;
export const arenaExtent=(arena:Arena)=>ARENAS[arena].extent*ARENA_SCALE[arena];
export type Item = 'bolt' | 'seeker' | 'mine' | 'boost' | 'shield' | 'pulse';
export const ITEMS: Item[] = ['bolt','seeker','mine','boost','shield','pulse'];
export const COLORS = ['#ef6844','#5c78e6','#edc34c','#a57be0','#59bba4','#e779a7','#72c5e7','#b7c75b'];
export const NAMES = ['YOU','BOLT','MANGO','PLUM','MINT','PEACH','SKIP','PIP'];
export const DRIVER_NAMES=['ROOK','BOLT','MANGO','PLUM','MINT','PEACH','SKIP','PIP'];
export function normalizeDrivers(raw:unknown,count:number):number[]{const values=Array.isArray(raw)?raw:[];return Array.from({length:count},(_,i)=>Number.isInteger(values[i])&&values[i]>=0&&values[i]<8?values[i]:i%8);}
export interface Input { gas:number; steer:number; drift:boolean; fire:boolean; hop:boolean; }
export const idle = ():Input => ({gas:0,steer:0,drift:false,fire:false,hop:false});
export interface Kart {team?:'blue'|'orange';stats?:RoundStats;id:number; driver:number; name:string; bot:boolean; x:number; z:number; y:number; angle:number; vx:number; vz:number; vy:number; speed:number; steering:number; yawRate:number; reverseTime:number; driftSide:number; driftSlip:number; pushX:number; pushZ:number; bumpCooldown:number; balloons:number; inv:number; item:Item|null; roulette:number; rouletteSeed:number; rouletteStop:boolean; itemFlash:number; boost:number; ram:number; shield:number; drift:number; cooldown:number; hopHeld:boolean; fireHeld:boolean; target:number; stuck:number; kills:number; damage:number; hits:number; eliminatedAt?:number; }
export interface Shot {id:number; owner:number; kind:'bolt'|'seeker'|'mine'; x:number; z:number; y:number; angle:number; life:number; age?:number; bounces?:number; }
export interface Box {x:number; z:number; y:number; respawn:number;}
export type HitCause='bolt'|'seeker'|'mine'|'ram'|'pulse'|'fall'|'lava'|'ring'|'timeout'|'goal';
export interface Event {impact?:number;contact?:'kick'|'bounce';ownGoal?:boolean;id:number; type:'ballcontact'|'goal'|'eliminated'|'hit'|'fire'|'pickup'|'boost'|'win'|'fall'|'bump'|'itemready'|'shockwave'|'crash'|'ricochet'; x:number; y:number; z:number; player:number;source?:number;blocked?:boolean;remaining?:number;cause?:HitCause;fromX?:number;fromZ?:number;team?:'blue'|'orange';}
export interface Config {soccer?:boolean;arena:Arena; humans:number; bots:number; difficulty:'easy'|'normal'|'hard'; duration:number;speedClass?:50|100|150;drivers?:number[];shuffleMaps?:boolean;mapQueue?:Arena[];championship?:boolean;}
export interface State {lighting?:Lighting;winningTeam?:'blue'|'orange';config:Config; championship?:Championship; ball?:Football; karts:Kart[]; shots:Shot[]; boxes:Box[]; time:number; countdown:number; phase:'countdown'|'playing'|'finished'; winner:number|null; tick:number; seed:number; serial:number; events:Event[];}
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export const angleDiff=(a:number,b:number)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export const distance=(a:{x:number;z:number},b:{x:number;z:number})=>Math.hypot(a.x-b.x,a.z-b.z);
export function ground(arena:Arena,x:number,z:number,referenceY=Infinity):number {
 if(arena==='fortress'){
  const lx=x/ARENA_SCALE.fortress,lz=z/ARENA_SCALE.fortress,solid=fortressSolidHeight(lx,lz);
  const h=solid< -10?solid:solid*ARENA_HEIGHT.fortress;
  return FORT_BRIDGES.filter(b=>Math.abs(lx-b.x)<=b.width/2+1e-7&&Math.abs(lz-b.z)<=b.depth/2+1e-7&&referenceY>=b.y*ARENA_HEIGHT.fortress-.85).reduce((height,b)=>Math.max(height,b.y*ARENA_HEIGHT.fortress),h);
 }
 const lx=x/ARENA_SCALE[arena],lz=z/ARENA_SCALE[arena],h=isExpansion(arena)?expansionHeight(arena,lx,lz):arena==='sky'?skyHeight(lx,lz):neonHeight(Math.hypot(lx,lz));
 return h< -10?h:h*ARENA_HEIGHT[arena];
}
export function ceiling(arena:Arena,x:number,z:number,feet:number):number {
 if(arena!=='fortress')return Infinity;
 const xLocal=x/ARENA_SCALE.fortress,zLocal=z/ARENA_SCALE.fortress;
 return Math.min(Infinity,...FORT_BRIDGES.filter(b=>Math.abs(xLocal-b.x)<=b.width/2&&Math.abs(zLocal-b.z)<=b.depth/2&&feet<(b.y-b.thickness)*ARENA_HEIGHT.fortress).map(b=>(b.y-b.thickness)*ARENA_HEIGHT.fortress));
}
export function solidAt(arena:Arena,x:number,y:number,z:number,includeRim=true):boolean {
 if(arena!=='fortress')return ground(arena,x,z)>y||includeRim&&(arena==='castle'||arena==='beach')&&obstacles(arena).some(o=>y>=0&&y<(o.height??0)&&Math.hypot(x-o.x,z-o.z)<o.r)||includeRim&&arena==='neon'&&!!neonRimContact(x,z,0,y);
 const lx=x/ARENA_SCALE.fortress,lz=z/ARENA_SCALE.fortress;
 if(fortressSolidHeight(lx,lz)*ARENA_HEIGHT.fortress>y)return true;
 return FORT_BRIDGES.some(b=>Math.abs(lx-b.x)<=b.width/2&&Math.abs(lz-b.z)<=b.depth/2&&y>=(b.y-b.thickness)*ARENA_HEIGHT.fortress&&y<=b.y*ARENA_HEIGHT.fortress);
}
export function obstacles(arena:Arena):{x:number;z:number;r:number;height?:number}[] {
 return layoutObstacles(arena).map(o=>({x:o.x*ARENA_SCALE[arena],z:o.z*ARENA_SCALE[arena],r:o.r*ARENA_SCALE[arena],height:o.height===undefined?undefined:o.height*ARENA_HEIGHT[arena]}));
}
export function layoutObstacles(arena:Arena):{x:number;z:number;r:number;height?:number}[] {
 if(arena==='fortress')return [];
 if(arena==='beach')return BEACH_PALMS;
 if(arena==='castle')return CASTLE_LAMPS.map(p=>({x:p.x,z:p.z,r:Math.SQRT2*p.width/2,height:p.height}));
 if(arena==='neon')return [0,1,2,3,4,5].map(i=>({x:Math.sin(i*Math.PI/3)*24,z:Math.cos(i*Math.PI/3)*24,r:2}));
 return [];
}
export interface NavPoint {x:number;z:number;y:number;}
export function nav(arena:Arena):NavPoint[] {
 if(arena==='fortress'){
  const points:NavPoint[]=[{x:0,z:0,y:0}];
  for(const sign of [-1,1])for(const d of [7,FORT.center,FORT.center+FORT.half+3,FORT.extent-7])points.push({x:0,z:sign*d,y:0},{x:sign*d,z:0,y:0});
  for(const sx of [-1,1])for(const sz of [-1,1]){
   points.push({x:sx*(FORT.center+FORT.half+3),z:sz*(FORT.center+FORT.half+3),y:0});
   for(const [x,z] of [[10,10],[10,18],[10,38],[18,10],[38,10],[38,18],[18,38],[38,38],[FORT.upperCenter,FORT.upperCenter]])points.push({x:sx*x,z:sz*z,y:fortressSolidHeight(sx*x,sz*z)});
  }
  for(const r of FORT_RAMPS)for(const t of [0,.5,1])points.push({x:r.axis==='x'?r.from+(r.to-r.from)*t:r.cross,z:r.axis==='z'?r.from+(r.to-r.from)*t:r.cross,y:r.bottom+(r.top-r.bottom)*t});
  for(const b of FORT_BRIDGES){points.push({x:b.x,z:b.z,y:b.y},{x:b.x,z:b.z,y:0});for(const sign of [-1,1])points.push({x:b.x+sign*(b.width> b.depth?b.width/2:0),z:b.z+sign*(b.depth>b.width?b.depth/2:0),y:b.y});}
  return points.map(p=>({x:p.x*ARENA_SCALE.fortress,z:p.z*ARENA_SCALE.fortress,y:p.y*ARENA_HEIGHT.fortress}));
 }
 return layoutNav(arena).map(p=>({x:p.x*ARENA_SCALE[arena],z:p.z*ARENA_SCALE[arena],y:ground(arena,p.x*ARENA_SCALE[arena],p.z*ARENA_SCALE[arena])}));
}
function layoutNav(arena:Arena):{x:number;z:number}[] {
 if(isExpansion(arena))return expansionNav(arena);
 if(arena==='sky')return [{x:0,z:0},...[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*6,z:z*6}))),...[-1,1].flatMap(sign=>[14.5,25].flatMap(d=>[{x:0,z:sign*d},{x:sign*d,z:0}]))];
 if(arena==='neon')return [{x:0,z:0},...Array.from({length:12},(_,i)=>({x:Math.sin(i*Math.PI/6)*22,z:Math.cos(i*Math.PI/6)*22}))];
 return [];
}
export function normalizeSpeedClass(value:unknown):50|100|150 {return value===100?100:value===150?150:50;}
export function speedSettings(value:unknown){const cc=normalizeSpeedClass(value);return {cc,scale:cc===150?1.75:cc===100?1.35:1,turn:cc===150?1.35:cc===100?1.18:1,grip:cc===150?1.25:cc===100?1.12:1};}
export function nextRoundConfig(config:Config,rng= Math.random):Config {
 if(!config.shuffleMaps)return {...config,mapQueue:[]};
 let queue=[...new Set((config.mapQueue??[]).filter(a=>ARENA_IDS.includes(a)&&a!==config.arena))];
 if(!queue.length){queue=ARENA_IDS.filter(a=>a!==config.arena);for(let i=queue.length-1;i>0;i--){const j=Math.floor(clamp(rng(),0,.999999)*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]];}}
 return {...config,arena:queue[0],mapQueue:queue.slice(1)};
}
export function createState(config:Config):State {
 config={...config,soccer:config.arena==='stadium',speedClass:normalizeSpeedClass(config.speedClass),drivers:normalizeDrivers(config.drivers,config.humans)};
 const count=clamp(config.humans+config.bots,2,8);
 const used=new Set(config.drivers),available=DRIVER_NAMES.map((_,i)=>i).filter(i=>!used.has(i));
 const karts=Array.from({length:count},(_,id)=>{
  const a=id/count*Math.PI*2;
  const radius=(isExpansion(config.arena)?7:config.arena==='sky'?8:config.arena==='fortress'?18:21)*ARENA_SCALE[config.arena];
  let x=Math.sin(a)*radius,z=Math.cos(a)*radius;
  if(config.arena==='fortress'){const lane=6*ARENA_SCALE.fortress;if(Math.abs(x)<Math.abs(z))x=clamp(x,-lane,lane);else z=clamp(z,-lane,lane);}
  const driver=id<config.humans?config.drivers![id]:(available.shift()??id%8);
  return {stats:newRoundStats(),id,driver,name:DRIVER_NAMES[driver],bot:id>=config.humans,x,z,y:ground(config.arena,x,z,0),angle:a+Math.PI,vx:0,vz:0,vy:0,speed:0,steering:0,yawRate:0,reverseTime:0,driftSide:0,driftSlip:0,pushX:0,pushZ:0,bumpCooldown:0,balloons:3,inv:0,item:null,roulette:0,rouletteSeed:0,rouletteStop:false,itemFlash:0,boost:0,ram:0,shield:0,drift:0,cooldown:0,hopHeld:false,fireHeld:false,target:0,stuck:0,kills:0,damage:0,hits:0};
 });
 if(config.arena==='stadium')assignSoccerTeams(karts);
 const points=(isExpansion(config.arena)?EXPANSIONS[config.arena].items:config.arena==='fortress'?FORT_ITEMS:config.arena==='sky'?[{x:0,z:0},{x:0,z:24},{x:24,z:0},{x:0,z:-24},{x:-24,z:0},{x:0,z:10},{x:10,z:0},{x:0,z:-10},{x:-10,z:0}]:[0,1,2,3,4,5,6,7].map(i=>({x:Math.sin(i*Math.PI/4)*20,z:Math.cos(i*Math.PI/4)*20}))).map((p:{x:number;z:number;y?:number})=>({x:p.x*ARENA_SCALE[config.arena],z:p.z*ARENA_SCALE[config.arena],y:p.y===undefined?undefined:p.y*ARENA_HEIGHT[config.arena]}));
 const championship=config.championship?createChampionship(config,karts):undefined;
 return {lighting:chooseLighting(config.arena),config,championship,ball:config.arena==='stadium'?createFootball():undefined,karts,shots:[],boxes:points.map(p=>({...p,y:p.y??ground(config.arena,p.x,p.z),respawn:0})),time:config.duration,countdown:3,phase:'countdown',winner:null,tick:0,seed:728463,serial:0,events:[]};
}
export function nextRoundState(previous:State,settings:Config=previous.config):State {
 const cup=previous.championship;if(cup&&!cup.completed){const config={...settings,championship:true,arena:cup.schedule[cup.round],drivers:previous.config.drivers,humans:previous.config.humans,bots:previous.config.bots};const next=createState(config);next.championship={...cup,round:cup.round+1,scored:false,standings:cup.standings.map(row=>({...row})),schedule:[...cup.schedule]};return next;}
 return createState(nextRoundConfig(settings));
}
// Camera, HUD and engine audio must agree on the kart being watched.
export function watchedKart(s:State,id:number,preferred?:number){return s.karts[id]?.balloons>0?s.karts[id]:s.karts.find(k=>k.id===preferred&&k.balloons>0)??s.karts.find(k=>k.balloons>0)??s.karts[id];}
export function cycleSpectator(s:State,id:number,preferred:number|undefined,direction:number){const current=watchedKart(s,id,preferred),alive=s.karts.filter(k=>k.balloons>0);if(s.karts[id]?.balloons>0||!alive.length)return current?.id;const index=alive.findIndex(k=>k.id===current?.id);return alive[(index+(direction<0?-1:1)+alive.length)%alive.length].id;}
function random(s:State){s.seed=(Math.imul(1664525,s.seed)+1013904223)>>>0;return s.seed/4294967296;}
function emit(s:State,type:Event['type'],k:Kart,detail:Partial<Event>={}){s.events.push({id:++s.serial,type,x:k.x,y:k.y,z:k.z,player:k.id,...detail});if(s.events.length>24)s.events.shift();}
export function damage(s:State,k:Kart,owner:number,detail:Pick<Event,'cause'|'fromX'|'fromZ'>={}) {
 const goal=detail.cause==='goal';if(s.phase!=='playing'||k.balloons<=0||(!goal&&k.inv>0))return false;
 if(!goal&&s.ball&&owner!==k.id&&s.karts[owner]&&soccerTeam(s.karts[owner])===soccerTeam(k))return false;
 if(k.shield>0&&!goal){k.shield=0;k.inv=.6;emit(s,'hit',k,{...detail,source:owner,blocked:true,remaining:k.balloons});return false;}
 k.balloons--;k.damage++;k.inv=2.2;k.speed*=.35;k.vy=3;emit(s,'hit',k,{...detail,source:owner,blocked:false,remaining:k.balloons});if(owner!==k.id&&s.karts[owner]){const attacker=s.karts[owner];attacker.hits=(attacker.hits??0)+1;if(detail.cause==='bolt'||detail.cause==='seeker')statsFor(attacker).projectileHits++;if(detail.cause==='ram')statsFor(attacker).turboRams++;}else if(owner===k.id&&detail.cause!=='timeout'&&detail.cause!=='goal')statsFor(k).selfLosses++;
 if(k.balloons===0){k.eliminatedAt=s.tick;emit(s,'eliminated',{...k,y:Math.max(0,k.y)},{source:owner,cause:detail.cause});if(owner!==k.id&&s.karts[owner])s.karts[owner].kills++;}
 return true;
}
export const ROULETTE_DURATION=2.4;
export function rouletteProgress(remaining:number){return 26*(1-Math.pow(clamp(remaining,0,ROULETTE_DURATION)/ROULETTE_DURATION,1.65));}
export function rouletteItem(k:Pick<Kart,'roulette'|'rouletteSeed'>):Item {return ITEMS[((k.rouletteSeed??0)+Math.round(rouletteProgress(k.roulette)))%ITEMS.length];}
export function beginRoulette(s:State,k:Kart,box?:Box){
 if(k.item||k.roulette>0||k.balloons<=0)return;
 k.roulette=ROULETTE_DURATION;k.rouletteSeed=Math.floor(random(s)*ITEMS.length);k.rouletteStop=false;k.itemFlash=0;emit(s,'pickup',box?{...k,x:box.x,y:box.y,z:box.z}:k);
}
export const MINE_ARM_TIME=.65;
export function useItem(s:State,k:Kart) {
 if(!k.item||k.roulette>0||k.balloons<=0||s.phase!=='playing')return;
 const type=k.item;k.item=null;emit(s,'fire',k);
 if(type==='boost'){k.boost=Math.max(k.boost,2);k.ram=2;emit(s,'boost',k,{cause:'ram'});return;}
 if(type==='shield'){k.shield=7;return;}
 if(type==='pulse'){emit(s,'shockwave',k);for(const o of s.karts)if(o.id!==k.id&&distance(o,k)<9&&Math.abs(o.y-k.y)<4)damage(s,o,k.id,{cause:'pulse',fromX:k.x,fromZ:k.z});return;}
 if(type==='bolt'||type==='seeker')statsFor(k).projectilesFired++;
 const back=type==='mine'?-2.8:2.3;
 s.shots.push({id:++s.serial,owner:k.id,kind:type,x:k.x+Math.sin(k.angle)*back,z:k.z+Math.cos(k.angle)*back,y:k.y+(type==='bolt'?.65:1),angle:k.angle,life:type==='mine'?25:type==='bolt'?8:5,age:0,bounces:0});
}
export function clearPath(arena:Arena,a:{x:number;z:number;y?:number},b:{x:number;z:number;y?:number}) {
 let prev=a.y??ground(arena,a.x,a.z);
 const steps=Math.ceil(distance(a,b)/1.8);
 for(let i=1;i<=steps;i++){const x=a.x+(b.x-a.x)*i/steps,z=a.z+(b.z-a.z)*i/steps,h=ground(arena,x,z,prev+.35);if(arena==='fortress'&&Math.max(Math.abs(x),Math.abs(z))>(ARENAS[arena].extent-1.25)*ARENA_SCALE[arena]-1.1||h< -10||Math.abs(h-prev)>1.6||arena==='neon'&&neonRimContact(x,z,1.4,h+.5,.5)||obstacles(arena).some(o=>h<(o.height??2)&&Math.hypot(x-o.x,z-o.z)<o.r+1.4))return false;prev=h;}return Math.abs(prev-(b.y??ground(arena,b.x,b.z)))<1.6;
}
const routes=new WeakMap<Kart,{tick:number;goalX:number;goalZ:number;goalY:number;point:{x:number;z:number}}>();
function waypoint(s:State,k:Kart,goal:{x:number;z:number;y?:number}) {
 const cached=routes.get(k);if(cached&&s.tick-cached.tick<20&&Math.hypot(goal.x-cached.goalX,goal.z-cached.goalZ)<5&&Math.abs((goal.y??ground(s.config.arena,goal.x,goal.z))-cached.goalY)<1&&distance(k,cached.point)>2&&clearPath(s.config.arena,k,cached.point))return cached.point;
 const point=findWaypoint(s,k,goal);routes.set(k,{tick:s.tick,goalX:goal.x,goalZ:goal.z,goalY:goal.y??ground(s.config.arena,goal.x,goal.z),point});return point;
}
const navigation=new Map<Arena,{points:NavPoint[];edges:{to:number;cost:number}[][]}>();
export function navGraph(arena:Arena){let graph=navigation.get(arena);if(!graph){const points=nav(arena),edges=points.map(()=>[] as {to:number;cost:number}[]);for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)if(clearPath(arena,points[i],points[j])&&clearPath(arena,points[j],points[i])){const cost=distance(points[i],points[j]);edges[i].push({to:j,cost});edges[j].push({to:i,cost});}graph={points,edges};navigation.set(arena,graph);}return graph;}
export function findWaypoint(s:State,k:Kart,goal:{x:number;z:number;y?:number}) {
 if(clearPath(s.config.arena,k,goal))return goal;
 const graph=navGraph(s.config.arena),nodes=[{x:k.x,z:k.z,y:k.y},...graph.points,goal],end=nodes.length-1;
 const links=nodes.map(()=>[] as {to:number;cost:number}[]);
 graph.edges.forEach((edges,i)=>links[i+1]=edges.map(e=>({to:e.to+1,cost:e.cost})));
 for(let j=1;j<end;j++){if(clearPath(s.config.arena,k,nodes[j]))links[0].push({to:j,cost:distance(k,nodes[j])});if(clearPath(s.config.arena,nodes[j],goal))links[j].push({to:end,cost:distance(nodes[j],goal)});}
 const costs=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),done=new Set<number>();costs[0]=0;
 for(let n=0;n<nodes.length;n++){
  let u=-1;for(let j=0;j<nodes.length;j++)if(!done.has(j)&&(u<0||costs[j]<costs[u]))u=j;
  if(u===end||u<0||!Number.isFinite(costs[u]))break;done.add(u);
  for(const edge of links[u]){const j=edge.to,c=costs[u]+edge.cost;if(!done.has(j)&&c<costs[j]){costs[j]=c;previous[j]=u;}}
 }
 let i=end;while(previous[i]>0)i=previous[i];if(previous[i]===0)return nodes[i];const reachable=links[0].map(edge=>nodes[edge.to]).sort((a,b)=>(distance(a,goal)+distance(k,a)*.3)-(distance(b,goal)+distance(k,b)*.3));return reachable[0]??k;
}
const fortressRegroup=new WeakMap<Kart,{since:number;goal:NavPoint|null}>();
const retreatGoals=new WeakMap<Kart,{tick:number;goal:NavPoint}>();
export function botGoal(s:State,k:Kart){
 const enemies=s.karts.filter(o=>o.id!==k.id&&o.balloons>0&&(!s.ball||!s.config.soccer||soccerTeam(o)!==soccerTeam(k))).sort((a,b)=>(distance(k,a)+Math.abs(k.y-a.y)*3-(3-a.balloons)*6)-(distance(k,b)+Math.abs(k.y-b.y)*3-(3-b.balloons)*6));const foe=enemies[0];if(!foe)return {goal:k,foe:k,tactic:'idle'};
 // Break perimeter pursuit loops after a short chase, then commit back to the blocks.
 if(s.config.arena==='fortress'){
  let regroup=fortressRegroup.get(k);
  if(!regroup||s.tick<regroup.since){regroup={since:s.tick,goal:null};fortressRegroup.set(k,regroup);}
  const outer=Math.max(Math.abs(k.x),Math.abs(k.z))>arenaExtent('fortress')-20;
  if(regroup.goal&&Math.max(Math.abs(k.x),Math.abs(k.z))<120)regroup.goal=null;
  if(!outer&&!regroup.goal)regroup.since=s.tick;
  if(outer&&!regroup.goal&&s.tick-regroup.since>120){
   const reach=46*ARENA_SCALE.fortress;
   regroup.goal=Math.abs(k.x)>Math.abs(k.z)?{x:Math.sign(k.x)*reach,z:clamp(k.z,-reach,reach),y:0}:{x:clamp(k.x,-reach,reach),z:Math.sign(k.z)*reach,y:0};
  }
  if(regroup.goal)return {goal:regroup.goal,foe,tactic:'regroup'};
 }
 const close=enemies.reduce((a,b)=>distance(k,a)<distance(k,b)?a:b),fragile=k.balloons===1&&!k.shield&&!(s.config.arena==='sky'&&k.item==='boost'),pressure=fragile&&distance(k,close)<26;
 if(s.time<=45&&Math.hypot(k.x,k.z)>dangerRadius(s)*.8)return {goal:{x:0,z:0,y:0},foe,tactic:'ring'};

 if(pressure&&!(k.item==='pulse'&&distance(k,foe)<8)){
  const cached=retreatGoals.get(k);if(cached&&s.tick-cached.tick<30)return {goal:cached.goal,foe,tactic:'retreat'};
  const candidates=navGraph(s.config.arena).points.filter(p=>distance(k,p)>7&&Math.hypot(p.x,p.z)<(s.time<=45?dangerRadius(s)*.75:arenaExtent(s.config.arena)));
  const score=(p:NavPoint)=>Math.min(...enemies.map(e=>distance(p,e)))*.8+(!clearPath(s.config.arena,close,p)?18:0)+Math.min(10,p.y)*.7-distance(k,p)*.3-s.shots.filter(m=>m.kind==='mine'&&distance(m,p)<7).length*60;
  const ranked=candidates.map(goal=>({goal,score:score(goal)})).sort((a,b)=>b.score-a.score);if(ranked[0]){retreatGoals.set(k,{tick:s.tick,goal:ranked[0].goal});return {goal:ranked[0].goal,foe,tactic:'retreat'};}
 }
 const boxes=s.boxes.filter(b=>b.respawn<=0).sort((a,b)=>(distance(k,a)+Math.abs(k.y-a.y)*2)-(distance(k,b)+Math.abs(k.y-b.y)*2));
 if(!k.item&&!k.roulette&&boxes[0]&&(distance(k,boxes[0])<55||distance(k,foe)>35))return {goal:boxes[0],foe,tactic:'rearm'};
 const lead={x:foe.x+foe.vx*.28,z:foe.z+foe.vz*.28,y:foe.y};return {goal:clearPath(s.config.arena,foe,lead)?lead:foe,foe,tactic:'attack'};
}
const skyProgress=new WeakMap<Kart,{tick:number;x:number;z:number}>();
const botRecovery=new WeakMap<Kart,{remaining:number;heading:number;reverse:boolean}>();
export function botInput(s:State,k:Kart):Input {
 if(s.config.arena==='sky'||s.config.arena==='fortress'){const progress=skyProgress.get(k);if(!progress||s.tick<progress.tick||distance(k,progress)>4)skyProgress.set(k,{tick:s.tick,x:k.x,z:k.z});else if(s.tick-progress.tick>120){k.stuck=Math.max(k.stuck,.9);skyProgress.set(k,{tick:s.tick,x:k.x,z:k.z});}}
 let recovery=botRecovery.get(k);
 if(!recovery&&k.stuck>.8){
  // Commit to an escape instead of cancelling reverse as soon as the kart moves.
  const safe=(angle:number,length:number)=>clearPath(s.config.arena,k,{x:k.x+Math.sin(angle)*length,z:k.z+Math.cos(angle)*length,y:k.y});
  const headings=Array.from({length:16},(_,i)=>k.angle+(i+1)*Math.PI/8).filter(a=>safe(a,9));
  const heading=headings.sort((a,b)=>Math.abs(angleDiff(a,k.angle))-Math.abs(angleDiff(b,k.angle)))[0]??k.angle+Math.PI;
  recovery={remaining:2.6,heading,reverse:safe(k.angle+Math.PI,6)};botRecovery.set(k,recovery);routes.delete(k);k.stuck=0;
 }
 if(recovery){const backing=recovery.reverse&&recovery.remaining>1.5,error=angleDiff(recovery.heading,k.angle);return {gas:backing?-1:s.config.arena==='sky'?.45:.65,steer:clamp(error*1.8,-1,1)*(backing?-1:1),drift:false,hop:false,fire:false};}
 const {goal,foe,tactic}=botGoal(s,k);if(foe===k)return idle();const wp=waypoint(s,k,goal);let desired=Math.atan2(wp.x-k.x,wp.z-k.z);
 for(const o of obstacles(s.config.arena))if(distance(k,o)<o.r+5&&Math.abs(angleDiff(Math.atan2(o.x-k.x,o.z-k.z),k.angle))<1.2)desired+=angleDiff(Math.atan2(o.x-k.x,o.z-k.z),k.angle)>0?-.7:.7;
 for(const hazard of s.shots){if(Math.abs(hazard.y-k.y)>3)continue;const d=distance(k,hazard);if(hazard.kind==='mine'&&(hazard.age??0)<MINE_ARM_TIME)continue;if(d< (hazard.kind==='mine'?8:10)&&Math.abs(angleDiff(Math.atan2(hazard.x-k.x,hazard.z-k.z),k.angle))<.9)desired+=angleDiff(Math.atan2(hazard.x-k.x,hazard.z-k.z),k.angle)>0?-.85:.85;}
 const error=angleDiff(desired,k.angle),aim=Math.abs(angleDiff(Math.atan2(foe.x-k.x,foe.z-k.z),k.angle)),range=distance(k,foe),sameLevel=Math.abs(k.y-foe.y)<3,visible=clearPath(s.config.arena,k,foe),diff=s.config.difficulty;
 const pace=diff==='easy'?.65:diff==='hard'?1:.85,ahead=Math.max(7,Math.abs(k.speed)*.65),edge=s.config.arena==='sky'&&ground('sky',k.x+Math.sin(k.angle)*ahead,k.z+Math.cos(k.angle)*ahead)< -10;
  const scale=speedSettings(s.config.speedClass).scale,hazardMap=s.config.arena==='sky'||s.config.arena==='castle'||s.config.arena==='neon'||s.config.arena==='ruins';
 const travel=Math.hypot(k.vx,k.vz)>2?Math.atan2(k.vx,k.vz):k.angle,look=Math.max(3,Math.abs(k.speed)*.55);
 const aheadX=k.x+Math.sin(travel)*look,aheadZ=k.z+Math.cos(travel)*look;
 const unsafe=!clearPath(s.config.arena,k,{x:aheadX,z:aheadZ,y:ground(s.config.arena,aheadX,aheadZ,k.y+.35)});
 const cruise=hazardMap?(s.config.arena==='sky'?.9:.7)/Math.sqrt(scale):pace,corner=clamp(1-Math.abs(error)*.85,.1,1);
 const throttle=Math.min(pace,cruise,corner,unsafe?.13:1,edge?.1:1),desiredSpeed=20*scale*throttle;
 const braking=k.speed>desiredSpeed+2&&(unsafe||Math.abs(error)>.65);
 const boostSafe=clearPath(s.config.arena,k,{x:k.x+Math.sin(k.angle)*31*scale*2.1,z:k.z+Math.cos(k.angle)*31*scale*2.1,y:k.y});
 const fire=!!k.item&&(k.item==='shield'&&(range<24||k.balloons===1)||k.item==='boost'&&boostSafe&&!unsafe&&Math.abs(error)<.25&&(tactic==='retreat'||aim<.45&&(range<38||s.config.arena==='sky')&&visible)||k.item==='mine'&&range<14&&(aim>1.6||tactic==='retreat')||k.item==='pulse'&&range<8&&sameLevel||(k.item==='bolt'||k.item==='seeker')&&visible&&sameLevel&&aim<(k.item==='seeker'?.85:.25)&&range<50);
 return {gas:braking?-1:throttle,steer:clamp(error*1.8,-1,1),drift:!hazardMap&&!unsafe&&Math.abs(error)>.5&&Math.abs(error)<1.2&&Math.abs(k.speed)>10,hop:false,fire};
}
export function drive(s:State,k:Kart,input:Input,dt:number) {
 if(k.balloons<=0)return;
 const floor=ground(s.config.arena,k.x,k.z,k.y),onGround=k.y<=floor+.15;
 k.inv=Math.max(0,k.inv-dt);k.boost=Math.max(0,k.boost-dt);k.ram=Math.max(0,(k.ram??0)-dt);k.shield=Math.max(0,k.shield-dt);k.cooldown=Math.max(0,k.cooldown-dt);k.itemFlash=Math.max(0,(k.itemFlash??0)-dt);
 k.pushX=(k.pushX??0)*Math.exp(-2.8*dt);k.pushZ=(k.pushZ??0)*Math.exp(-2.8*dt);k.bumpCooldown=Math.max(0,(k.bumpCooldown??0)-dt);
 k.steering??=0;k.yawRate??=0;k.reverseTime??=0;k.driftSide??=0;k.driftSlip??=0;
 const settings=speedSettings(s.config.speedClass),scale=settings.scale,cruise=20*scale,maxSpeed=(k.boost>0?31:20)*scale;
 if(input.gas>0){k.reverseTime=0;if(k.speed<0)k.speed=Math.min(0,k.speed+38*dt);else {const target=cruise*input.gas;k.speed+=clamp(target-k.speed,-13*scale*dt,28*scale*(1-.35*Math.abs(k.speed)/cruise)*dt);}}
 else if(input.gas<0){if(k.speed>.1){k.speed=Math.max(0,k.speed-36*Math.pow(scale,1.35)*-input.gas*dt);k.reverseTime=0;}else {k.reverseTime+=dt;if(k.reverseTime>.16)k.speed=Math.max(-8*-input.gas,k.speed-13*-input.gas*dt);}}
 else {k.reverseTime=0;k.speed*=Math.exp(-.65*dt);if(Math.abs(k.speed)<.04)k.speed=0;}
 if(k.boost>0)k.speed=Math.min(maxSpeed,Math.max(0,k.speed)+45*scale*dt);
 k.speed=clamp(k.speed,-8,maxSpeed);
 const steerResponse=Math.abs(input.steer)<Math.abs(k.steering)?24:16;
 k.steering+=(input.steer-k.steering)*(1-Math.exp(-steerResponse*dt));
 if(input.drift&&onGround&&k.speed>7&&!k.driftSide&&Math.abs(input.steer)>.2){k.driftSide=Math.sign(input.steer);k.angle+=k.driftSide*.12;k.vy=Math.max(k.vy,3.2);}
 const drifting=input.drift&&k.speed>7&&k.driftSide!==0;
 const steering=drifting?clamp(k.driftSide*.55+k.steering*.65,-1,1):k.steering;
 const targetYaw=steering*(2.7*settings.turn/(1+Math.abs(k.speed)/scale*.045))*(drifting?.85:1)*clamp(k.speed/3,-1,1)*(onGround||drifting?1:.55);
 k.yawRate+=(targetYaw-k.yawRate)*(1-Math.exp(-18*dt));k.angle+=k.yawRate*dt;
 if(drifting){if(onGround||k.y-floor<.8)k.drift+=dt;}
 else {if(k.drift>1&&!input.drift){k.boost=Math.max(k.boost,.8);emit(s,'boost',k);}k.drift=0;k.driftSide=0;}
 // The travel direction is deliberately outside the kart's facing direction.
 // Countersteering reduces that slip; release lets the tires regain grip.
 const targetSlip=drifting?k.driftSide*(.38+.26*Math.max(0,k.driftSide*k.steering)):0;
 k.driftSlip+=(targetSlip-k.driftSlip)*(1-Math.exp(-dt*(drifting?8:10)));
 const travel=k.angle-k.driftSlip,grip=drifting?6:onGround?14:2.2;
 const surface=arenaSurface(s.config.arena,k.x,k.z,k.y);const traction=1-Math.exp(-grip*settings.grip*surface.grip*dt);
 k.vx+=(Math.sin(travel)*k.speed-k.vx)*traction;
 k.vz+=(Math.cos(travel)*k.speed-k.vz)*traction;
 const oldX=k.x,oldZ=k.z;
 let nx=k.x+(k.vx+k.pushX+(onGround?surface.vx:0))*dt,nz=k.z+(k.vz+k.pushZ+(onGround?surface.vz:0))*dt;
 const newFloor=ground(s.config.arena,nx,nz,k.y);
 // Remove only the velocity into the wall. Never bounce the throttle into reverse.
 const crash=()=>{if(k.cooldown<=0&&Math.hypot(k.vx+k.pushX,k.vz+k.pushZ)>5){k.cooldown=.65;emit(s,'crash',k);}};
 const slide=(normalX:number,normalZ:number)=>{if((k.vx+k.pushX)*normalX+(k.vz+k.pushZ)*normalZ>5)crash();const external=k.pushX*normalX+k.pushZ*normalZ;if(external>0){k.pushX-=normalX*external;k.pushZ-=normalZ*external;}const into=k.vx*normalX+k.vz*normalZ;if(into<=0)return;const ratio=into/Math.max(1,Math.hypot(k.vx,k.vz));k.vx-=normalX*into;k.vz-=normalZ*into;k.speed*=ratio>.94?.28:1-.06*ratio;};
 if(newFloor>k.y+.85){const freeX=ground(s.config.arena,nx,k.z,k.y)<=k.y+.85,freeZ=ground(s.config.arena,k.x,nz,k.y)<=k.y+.85;if(freeX&&(!freeZ||Math.abs(k.vx)>Math.abs(k.vz))){slide(0,Math.sign(nz-k.z));nz=k.z;}else if(freeZ){slide(Math.sign(nx-k.x),0);nx=k.x;}else{crash();nx=k.x;nz=k.z;k.vx=0;k.vz=0;k.pushX=0;k.pushZ=0;k.speed*=.28;}}
 if(s.config.arena!=='sky'&&s.config.arena!=='neon'){
  const scale=ARENA_SCALE[s.config.arena];
  {const limit=(ARENAS[s.config.arena].extent-1.25)*scale-1.1;if(Math.abs(nx)>limit){slide(Math.sign(nx),0);nx=clamp(nx,-limit,limit);}if(Math.abs(nz)>limit){slide(0,Math.sign(nz));nz=clamp(nz,-limit,limit);}}
 }
 for(const o of obstacles(s.config.arena)){const d=Math.hypot(nx-o.x,nz-o.z);if(d<o.r+1.1&&k.y<(o.height??2)){const normalX=(nx-o.x)/(d||1),normalZ=(nz-o.z)/(d||1);slide(-normalX,-normalZ);nx=o.x+normalX*(o.r+1.15);nz=o.z+normalZ*(o.r+1.15);}}
 if(s.config.arena==='neon'){const contact=neonRimContact(nx,nz,1.1,k.y+.7,.7);if(contact){const {normalX,normalZ}=contact;const into=k.vx*normalX+k.vz*normalZ;if(into<0){crash();k.vx-=1.45*into*normalX;k.vz-=1.45*into*normalZ;k.speed*=.6;}const push=k.pushX*normalX+k.pushZ*normalZ;if(push<0){k.pushX-=1.4*push*normalX;k.pushZ-=1.4*push*normalZ;}nx=contact.x;nz=contact.z;}}
 k.x=nx;k.z=nz;
 if(input.hop&&!k.hopHeld&&onGround)k.vy=7;
 k.hopHeld=input.hop;
 k.vy-=21*dt;k.y+=k.vy*dt;
 const h=ground(s.config.arena,k.x,k.z,k.y+.4);if(k.y<h&&k.y>h-1.5){k.y=h;k.vy=0;}
 if(k.y<(s.config.arena==='castle'?-4:-14)){damage(s,k,k.id,{cause:s.config.arena==='castle'?'lava':'fall'});k.x=0;k.z=0;k.y=ground(s.config.arena,0,0)+1;k.vy=0;k.speed=0;k.boost=0;k.ram=0;k.vx=0;k.vz=0;k.pushX=0;k.pushZ=0;k.inv=3;emit(s,'fall',k);}
 if(k.roulette>0){
  if(input.fire&&!k.fireHeld)k.rouletteStop=true;
  k.roulette=Math.max(0,k.roulette-dt);
  if(k.roulette<=0||(k.rouletteStop&&ROULETTE_DURATION-k.roulette>=.35)){k.item=rouletteItem(k);k.roulette=0;k.rouletteStop=false;k.itemFlash=.65;emit(s,'itemready',k);}
 }else if(input.fire&&!k.fireHeld)useItem(s,k);
 k.fireHeld=input.fire;
 if(Math.hypot(k.x-oldX,k.z-oldZ)<dt&&Math.abs(input.gas)>.1)k.stuck+=dt;else k.stuck=Math.max(0,k.stuck-dt);
 const recovery=botRecovery.get(k);if(recovery){recovery.remaining-=dt;k.stuck=0;if(recovery.remaining<=0){botRecovery.delete(k);routes.delete(k);}}
}
// Collision impulse is independent of tire traction, so shoves persist through steering.
export function collideKarts(s:State){
 for(let i=0;i<s.karts.length;i++)for(let j=i+1;j<s.karts.length;j++){
  const a=s.karts[i],b=s.karts[j],d=distance(a,b);
  if(!a.balloons||!b.balloons||d>=2.3||Math.abs(a.y-b.y)>=1.7)continue;
  const nx=d>.001?(b.x-a.x)/d:1,nz=d>.001?(b.z-a.z)/d:0,overlap=(2.3-d)/2;
  for(const [k,sign] of [[a,-1],[b,1]] as [Kart,number][]){
   const x=k.x+nx*overlap*sign,z=k.z+nz*overlap*sign;
   const limit=(ARENAS[s.config.arena].extent-1.25)*ARENA_SCALE[s.config.arena]-1.1;
   const inside=s.config.arena==='sky'||s.config.arena==='neon'||Math.max(Math.abs(x),Math.abs(z))<=limit;
   if(inside&&ground(s.config.arena,x,z,k.y)<=k.y+.85){k.x=x;k.z=z;}
  }
  const closing=(a.vx+(a.pushX??0)-b.vx-(b.pushX??0))*nx+(a.vz+(a.pushZ??0)-b.vz-(b.pushZ??0))*nz;
  if(closing>.4&&(a.bumpCooldown??0)<=0&&(b.bumpCooldown??0)<=0){
   const aToward=(a.vx+(a.pushX??0))*nx+(a.vz+(a.pushZ??0))*nz,bToward=-(b.vx+(b.pushX??0))*nx-(b.vz+(b.pushZ??0))*nz;
   const hitA=(a.ram??0)>0&&a.boost>0&&a.speed>8&&aToward>6&&Math.sin(a.angle)*nx+Math.cos(a.angle)*nz>.35&&closing>4;
   const hitB=(b.ram??0)>0&&b.boost>0&&b.speed>8&&bToward>6&&-Math.sin(b.angle)*nx-Math.cos(b.angle)*nz>.35&&closing>4;
   if(hitA)damage(s,b,a.id,{cause:'ram',fromX:a.x,fromZ:a.z});if(hitB)damage(s,a,b.id,{cause:'ram',fromX:b.x,fromZ:b.z});
   const impulse=clamp(closing*.72+(a.boost>0||b.boost>0?3:0),1,21);
   a.pushX=(a.pushX??0)-nx*impulse;a.pushZ=(a.pushZ??0)-nz*impulse;
   b.pushX=(b.pushX??0)+nx*impulse;b.pushZ=(b.pushZ??0)+nz*impulse;
   a.bumpCooldown=b.bumpCooldown=.22;a.vy=Math.max(a.vy,Math.min(2.6,impulse*.13));b.vy=Math.max(b.vy,Math.min(2.6,impulse*.13));emit(s,'bump',a);emit(s,'bump',b);
  }
 }
}
// Substeps and swept hits prevent the fast pod tunnelling through a wall or kart.
export function advanceRicochet(s:State,p:Shot,dt:number){
 if(p.life<=0)return;p.age=(p.age??0)+dt;p.bounces??=0;
 const arena=s.config.arena,radius=.55,velocity=32*speedSettings(s.config.speedClass).scale,parts=Math.max(1,Math.ceil(velocity*dt/.22)),h=dt/parts;
 const rebound=()=>{p.bounces!++;if(p.bounces!>12){p.life=0;return;}emit(s,'ricochet',{...s.karts[p.owner],x:p.x,y:p.y,z:p.z});};
 for(let i=0;i<parts&&p.life>0;i++){
  const ox=p.x,oz=p.z;let vx=Math.sin(p.angle),vz=Math.cos(p.angle),nx=ox+vx*velocity*h,nz=oz+vz*velocity*h,bounced=false;
  if(arena!=='sky'&&arena!=='neon'){
   {const limit=(ARENAS[arena].extent-1.25)*ARENA_SCALE[arena]-radius;if(Math.abs(nx)>limit){vx=-vx;nx=clamp(nx,-limit+.02,limit-.02);bounced=true;}if(Math.abs(nz)>limit){vz=-vz;nz=clamp(nz,-limit+.02,limit-.02);bounced=true;}}
  }
  const blocked=(x:number,z:number)=>solidAt(arena,x,p.y,z,false);
  const bx=blocked(nx+Math.sign(vx)*radius,oz)||blocked(nx+Math.sign(vx)*radius,oz+radius*.65)||blocked(nx+Math.sign(vx)*radius,oz-radius*.65);
  const bz=blocked(ox,nz+Math.sign(vz)*radius)||blocked(ox+radius*.65,nz+Math.sign(vz)*radius)||blocked(ox-radius*.65,nz+Math.sign(vz)*radius);
  if(bx){vx=-vx;nx=ox;bounced=true;}if(bz){vz=-vz;nz=oz;bounced=true;}
  if(!bx&&!bz&&blocked(nx,nz)){vx=-vx;vz=-vz;nx=ox;nz=oz;bounced=true;}
  for(const o of obstacles(arena)){const d=Math.hypot(nx-o.x,nz-o.z);if(p.y<(o.height??2.6)&&d<o.r+radius){const ax=d>.001?(nx-o.x)/d:-vx,az=d>.001?(nz-o.z)/d:-vz,dot=vx*ax+vz*az;if(dot<0){vx-=2*dot*ax;vz-=2*dot*az;bounced=true;}nx=o.x+ax*(o.r+radius+.02);nz=o.z+az*(o.r+radius+.02);}}
  if(arena==='neon'){const contact=neonRimContact(nx,nz,radius,p.y,radius);if(contact){const dot=vx*contact.normalX+vz*contact.normalZ;if(dot<0){vx-=2*dot*contact.normalX;vz-=2*dot*contact.normalZ;bounced=true;}nx=contact.x;nz=contact.z;}}
  p.x=nx;p.z=nz;p.angle=Math.atan2(vx,vz);if(bounced)rebound();
  const floor=ground(arena,p.x,p.z,p.y-.35);if(floor< -10){p.life=0;break;}if(floor<=p.y+.4)p.y=floor+.65;
  for(const k of s.karts){if(s.ball&&s.config.soccer&&k.id!==p.owner&&soccerTeam(k)===soccerTeam(s.karts[p.owner]))continue;if(!k.balloons||Math.abs(k.y+.8-p.y)>1.7||(k.id===p.owner&&(p.bounces===0||p.age<.4)))continue;const dx=p.x-ox,dz=p.z-oz,t=clamp(((k.x-ox)*dx+(k.z-oz)*dz)/(dx*dx+dz*dz||1),0,1);if(Math.hypot(k.x-ox-dx*t,k.z-oz-dz*t)<1.65){damage(s,k,p.owner,{cause:'bolt',fromX:k.x-Math.sin(p.angle)*5,fromZ:k.z-Math.cos(p.angle)*5});p.life=0;break;}}
 }
}
export function dangerRadius(s:State){const start=(s.config.arena==='neon'||s.config.arena==='sky'?1.35:Math.SQRT2)*arenaExtent(s.config.arena);return s.time>45?start:Math.max(7,start*s.time/45);}
export function finish(s:State) {
 if(s.ball){const alive=s.karts.filter(k=>k.balloons>0),teams=new Set(alive.map(soccerTeam));if(teams.size>1)return;s.winningTeam=alive.length?soccerTeam(alive[0]):undefined;s.winner=alive[0]?.id??null;s.phase='finished';emit(s,'win',alive[0]??s.karts[0],{team:s.winningTeam});scoreChampionship(s);return;}
 const alive=s.karts.filter(k=>k.balloons>0);
 if(alive.length<=1){s.phase='finished';s.winner=alive[0]?.id??null;emit(s,'win',alive[0]??s.karts[0]);scoreChampionship(s);}
}
export function step(s:State,inputs:Record<number,Input>,dt=1/60) {
 if(s.phase==='finished')return;
 s.tick++;
 if(s.phase==='countdown'){s.countdown-=dt;if(s.countdown<=0)s.phase='playing';return;}
 s.time=Math.max(0,s.time-dt);
 for(const b of s.boxes)b.respawn=Math.max(0,b.respawn-dt);
 for(const k of s.karts){drive(s,k,k.bot?botInput(s,k):inputs[k.id]??idle(),dt);if(k.balloons<=0)continue;
  for(const b of s.boxes)if(!k.item&&!k.roulette&&b.respawn<=0&&distance(k,b)<2.5&&Math.abs(k.y-b.y)<2){beginRoulette(s,k,b);b.respawn=6;}
  if(s.time<=45&&Math.hypot(k.x,k.z)>dangerRadius(s))damage(s,k,k.id,{cause:'ring'});
 }
 collideKarts(s);stepFootball(s,dt);
 for(const p of s.shots){p.life-=dt;if(p.kind!=='bolt')p.age=(p.age??0)+dt;if(p.kind==='bolt'){advanceRicochet(s,p,dt);continue;}
  if(p.kind==='seeker'){const target=s.karts.filter(k=>k.id!==p.owner&&k.balloons>0&&(!s.ball||!s.config.soccer||soccerTeam(k)!==soccerTeam(s.karts[p.owner]))).sort((a,b)=>distance(p,a)-distance(p,b))[0];if(target){p.angle+=clamp(angleDiff(Math.atan2(target.x-p.x,target.z-p.z),p.angle),-2*dt,2*dt);p.y+=(target.y+1-p.y)*dt*3;}}
  const ox=p.x,oz=p.z,velocity=p.kind==='mine'?0:38*speedSettings(s.config.speedClass).scale;
  p.x+=Math.sin(p.angle)*velocity*dt;p.z+=Math.cos(p.angle)*velocity*dt;
  if(p.kind==='mine')p.y=ground(s.config.arena,p.x,p.z,p.y-.4)+.4;
  if(solidAt(s.config.arena,p.x,p.y+.15,p.z)||Math.abs(p.x)>arenaExtent(s.config.arena)+2||Math.abs(p.z)>arenaExtent(s.config.arena)+2){p.life=0;continue;}
  for(const k of s.karts){if(s.ball&&s.config.soccer&&k.id!==p.owner&&soccerTeam(k)===soccerTeam(s.karts[p.owner]))continue;if((k.id===p.owner&&p.kind!=='mine')||(p.kind==='mine'&&(p.age??0)<MINE_ARM_TIME)||!k.balloons||Math.abs(k.y+1-p.y)>2)continue;
   const dx=p.x-ox,dz=p.z-oz,t=clamp(((k.x-ox)*dx+(k.z-oz)*dz)/(dx*dx+dz*dz||1),0,1);
   if(Math.hypot(k.x-ox-dx*t,k.z-oz-dz*t)<1.8){damage(s,k,p.owner,{cause:p.kind,fromX:p.kind==='mine'?p.x:k.x-Math.sin(p.angle)*5,fromZ:p.kind==='mine'?p.z:k.z-Math.cos(p.angle)*5});p.life=0;break;}
  }
 }
 s.shots=s.shots.filter(p=>p.life>0);
 if(s.time<=0)for(const k of s.karts)if(k.balloons>0)damage(s,k,k.id,{cause:'timeout'});
 finish(s);
}












