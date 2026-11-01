import {damage,ground,type State,type Kart} from './sim';
import {soccerTeam,assignSoccerTeams,type Team} from './football';
export const FLAG_BASES={blue:{x:-92,z:0,y:0},orange:{x:92,z:0,y:0}};
export interface Flag {team:Team;x:number;y:number;z:number;carrier:number|null;home:boolean;returnIn:number;lock:number;}
export interface CaptureFlags {flags:Flag[];scores:[number,number];cooldown:number;}
export const otherTeam=(t:Team):Team=>t==='blue'?'orange':'blue';
export function createFlags():CaptureFlags{return {flags:(['blue','orange'] as Team[]).map(team=>({team,...FLAG_BASES[team],carrier:null,home:true,returnIn:0,lock:0})),scores:[0,0],cooldown:0};}
export function assignFlagTeams(karts:Kart[]){assignSoccerTeams(karts);const counts={blue:0,orange:0};for(const k of karts){const team=soccerTeam(k),base=FLAG_BASES[team];Object.assign(k,{x:base.x+(team==='blue'?8:-8),z:(counts[team]++-1)*7,y:0,angle:team==='blue'?Math.PI/2:-Math.PI/2});}}
function notify(s:State,flag:Flag,action:'taken'|'dropped'|'returned',player:number){s.events.push({id:++s.serial,type:'flag',player,team:flag.team,flagAction:action,x:flag.x,y:flag.y,z:flag.z});if(s.events.length>24)s.events.shift();}
function home(s:State,f:Flag,player=0){Object.assign(f,FLAG_BASES[f.team],{carrier:null,home:true,returnIn:0,lock:.4});notify(s,f,'returned',player);}
export function dropFlag(s:State,k:Kart){const f=s.ctf?.flags.find(f=>f.carrier===k.id);if(!f)return;const y=ground('depot',k.x,k.z,k.y);if(y< -10){home(s,f,k.id);return;}Object.assign(f,{x:k.x,z:k.z,y,carrier:null,home:false,returnIn:15,lock:.8});notify(s,f,'dropped',k.id);}
export function stepFlags(s:State,dt:number){const c=s.ctf;if(!c||s.phase!=='playing')return;c.cooldown=Math.max(0,c.cooldown-dt);
 for(const f of c.flags){f.lock=Math.max(0,f.lock-dt);if(f.carrier!==null){const k=s.karts.find(k=>k.id===f.carrier);if(!k||!k.balloons){if(k)dropFlag(s,k);else home(s,f);continue;}f.x=k.x;f.y=k.y;f.z=k.z;}else if(!f.home){f.returnIn-=dt;if(f.returnIn<=0||ground('depot',f.x,f.z,f.y)< -10)home(s,f);}}
 if(c.cooldown>0)return;
 for(const f of c.flags){if(f.carrier!==null||f.lock>0)continue;const nearby=s.karts.filter(k=>k.balloons>0&&Math.hypot(k.x-f.x,k.z-f.z)<3.8&&Math.abs(k.y-f.y)<2).sort((a,b)=>Number(soccerTeam(b)===f.team)-Number(soccerTeam(a)===f.team)||a.id-b.id);
 for(const k of nearby){if(soccerTeam(k)===f.team){if(!f.home){home(s,f,k.id);break;}}else if(k.ram<=0){f.carrier=k.id;f.home=false;f.returnIn=0;notify(s,f,'taken',k.id);break;}}}
 for(const f of c.flags){if(f.carrier===null)continue;const k=s.karts.find(k=>k.id===f.carrier)!;const team=soccerTeam(k),base=FLAG_BASES[team],own=c.flags.find(o=>o.team===team)!;if(own.home&&Math.hypot(k.x-base.x,k.z-base.z)<5&&Math.abs(k.y)<2){c.scores[team==='blue'?0:1]++;c.cooldown=2.5;for(const flag of c.flags)Object.assign(flag,FLAG_BASES[flag.team],{carrier:null,home:true,returnIn:0,lock:2.5});s.events.push({id:++s.serial,type:'goal',capture:true,player:k.id,source:k.id,team,x:base.x,y:2,z:base.z});for(const victim of s.karts)if(victim.balloons&&soccerTeam(victim)!==team)damage(s,victim,k.id,{cause:'goal',capture:true});break;}}
}
export function flagBotGoal(s:State,k:Kart){const c=s.ctf!,team=soccerTeam(k),own=c.flags.find(f=>f.team===team)!,enemy=c.flags.find(f=>f.team!==team)!;
 if(enemy.carrier===k.id)return own.home?FLAG_BASES[team]:{x:FLAG_BASES[team].x*.8,z:k.id%2?12:-12,y:0};
 if(!own.home)return own;
 const mates=s.karts.filter(o=>o.balloons&&soccerTeam(o)===team).sort((a,b)=>a.id-b.id),role=mates.findIndex(o=>o.id===k.id);
 if(enemy.carrier!==null){const carrier=s.karts.find(o=>o.id===enemy.carrier)!;return {x:carrier.x,z:carrier.z+(k.id%2?9:-9),y:carrier.y};}
 if(role===1&&mates.length>2){const threat=s.karts.filter(o=>o.balloons&&soccerTeam(o)!==team).sort((a,b)=>Math.hypot(a.x-own.x,a.z-own.z)-Math.hypot(b.x-own.x,b.z-own.z))[0];if(threat&&Math.hypot(threat.x-own.x,threat.z-own.z)<45)return threat;return {x:own.x*.65,z:14,y:0};}
 return enemy;
}
