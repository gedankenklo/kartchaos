import assert from 'node:assert/strict';
import {createState,step,ARENA_IDS} from '../src/sim';
// Keep drivers alive to exercise navigation for two minutes instead of ending
// the match after a few falls. Items, collisions and all driving physics remain on.
const seconds=120,dt=1/60;
for(const arena of ARENA_IDS)for(const speedClass of [50,100,150] as const){
 const s=createState({arena,humans:0,bots:4,duration:300,difficulty:'normal',speedClass});s.phase='playing';
 const samples=s.karts.map(k=>({x:k.x,z:k.z,still:0,longest:0,travel:0}));let falls=0,lastEvent=0;
 for(let tick=0;tick<seconds*60;tick++){
  for(const k of s.karts){k.inv=100;k.balloons=3;}
  step(s,{});
  for(const event of s.events)if(event.id>lastEvent){if(event.type==='fall')falls++;lastEvent=Math.max(lastEvent,event.id);}
  for(const k of s.karts){const sample=samples[k.id],distance=Math.hypot(k.x-sample.x,k.z-sample.z);assert.ok(Number.isFinite(k.x+k.y+k.z+k.speed),`${arena} ${speedClass}: invalid kart state`);sample.travel+=distance;sample.still=distance<dt?sample.still+dt:0;sample.longest=Math.max(sample.longest,sample.still);sample.x=k.x;sample.z=k.z;}
 }
 const stalled=Math.max(...samples.map(sample=>sample.longest)),travel=Math.min(...samples.map(sample=>sample.travel));
 console.log(JSON.stringify({arena,speedClass,seconds,falls,longestStall:Number(stalled.toFixed(2)),leastTravel:Math.round(travel)}));
 assert.ok(stalled<4,`${arena} ${speedClass}: persistent wall stall`);assert.ok(travel>300,`${arena} ${speedClass}: inactive bot`);
 assert.ok(falls<=(arena==='sky'||arena==='neon'?18:arena==='castle'||arena==='ruins'||arena==='depot'?5:0),`${arena} ${speedClass}: excessive hazard falls`);
}
console.log('Navigation: '+ARENA_IDS.length*3+' two-minute scenarios passed ('+ARENA_IDS.length*6+' simulated match minutes).');

