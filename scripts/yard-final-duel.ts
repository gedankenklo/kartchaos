import assert from 'node:assert/strict';
import {createState,step,botGoal} from '../src/sim';
for(const cc of [50,100,150] as const)for(const layout of [0,1,2]){
 const s=createState({arena:'yard',humans:0,bots:2,difficulty:'normal',duration:300,speedClass:cc});s.phase='playing';
 s.karts.forEach((k,i)=>Object.assign(k,{x:layout===0?0:layout===1?(i?-55:55):(i?-35:35),z:layout===0?(i?-10:10):layout===1?0:(i?35:-35),y:0,angle:i?0:Math.PI,item:'boost',balloons:1}));
 let minRange=Infinity,boosts=0,last=0,retreat=0,shots=0;
 for(let tick=0;tick<60*60;tick++){for(const k of s.karts){k.inv=100;k.balloons=1;if(botGoal(s,k).tactic==='retreat')retreat++;}step(s,{});minRange=Math.min(minRange,Math.hypot(s.karts[0].x-s.karts[1].x,s.karts[0].z-s.karts[1].z));for(const e of s.events)if(e.id>last){last=e.id;if(e.type==='boost')boosts++;if(e.type==='fire')shots++;}}
 console.log(JSON.stringify({cc,layout,minRange:+minRange.toFixed(2),boosts,shots,retreat}));assert.equal(retreat,0);assert.ok(minRange<6,'final pair must close to fighting range');assert.ok(boosts>0,'turbo must be used');
}
