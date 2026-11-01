import {createState,step,arenaExtent,type Config} from '../src/sim';
import assert from 'node:assert/strict';
for(const speedClass of [50,100,150] as const)for(const [label,balloons,corner] of [['fragile',1,false],['healthy',3,false],['corner',1,true]] as const){
 const s=createState({arena:'fortress',humans:0,bots:4,duration:300,difficulty:'normal',speedClass});s.phase='playing';s.boxes=[];const edge=arenaExtent('fortress')-5;
 s.karts.forEach((k,i)=>Object.assign(k,{x:edge,z:corner?edge-24+i*6:-12+i*8,y:0,angle:0,speed:10,vx:0,vz:10,balloons,inv:100}));
 const samples=s.karts.map(()=>({wall:0,longest:0,total:0,inside:false}));
 for(let tick=0;tick<45*60;tick++){s.karts.forEach(k=>{k.inv=100;k.balloons=balloons;});step(s,{});s.karts.forEach((k,i)=>{const band=Math.max(Math.abs(k.x),Math.abs(k.z))>arenaExtent('fortress')-20,p=samples[i];p.wall=band?p.wall+1/60:0;p.longest=Math.max(p.longest,p.wall);if(tick>300&&band)p.total++;p.inside||=Math.max(Math.abs(k.x),Math.abs(k.z))<120;});}
 const longest=Math.max(...samples.map(p=>p.longest)),fraction=Math.max(...samples.map(p=>p.total/(40*60))),entered=samples.filter(p=>p.inside).length;
 console.log(JSON.stringify({speedClass,label,longestWall:Number(longest.toFixed(2)),wallFraction:Number(fraction.toFixed(3)),entered}));
 if(process.argv.includes('--check')){assert.ok(longest<10,`${label} ${speedClass}: prolonged wall loop`);assert.ok(fraction<.35,`${label} ${speedClass}: excessive perimeter time`);assert.equal(entered,4,`${label} ${speedClass}: failed to rejoin battle`);}
}
