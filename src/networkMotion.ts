import {angleDiff,clamp,type State,type Kart} from './sim';
type Pose=Pick<Kart,'x'|'y'|'z'|'angle'>;
const pose=(k:Pose):Pose=>({x:k.x,y:k.y,z:k.z,angle:k.angle});
function blend<T extends Pose>(a:Pose,b:T,t:number):T{return {...b,x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t,angle:a.angle+angleDiff(b.angle,a.angle)*t};}
export class NetworkMotion{
 snapshots:{at:number;s:State}[]=[];errors=new Map<number,{at:number;pose:Pose}>();previous=new Map<number,Kart>();last?:State;delay=100;
 reset(){this.snapshots=[];this.errors.clear();this.previous.clear();this.last=undefined;this.delay=100;}
 receive(authority:State,predicted:State,old:State|null,ids:number[],now:number){
  if(!this.last||authority.config.arena!==this.last.config.arena||authority.phase!==this.last.phase||authority.tick<this.last.tick)this.reset();
  for(const id of ids){const a=old?.karts[id],b=predicted.karts[id];if(!a||!b)continue;const error=this.errors.get(id),decay=error?Math.exp(-(now-error.at)/100):0;
   const offset={x:a.x-b.x+(error?.pose.x??0)*decay,y:a.y-b.y+(error?.pose.y??0)*decay,z:a.z-b.z+(error?.pose.z??0)*decay,angle:angleDiff(a.angle,b.angle)+(error?.pose.angle??0)*decay};
   if(a.balloons!==b.balloons||Math.hypot(offset.x,offset.y,offset.z)>8)this.errors.delete(id);else this.errors.set(id,{at:now,pose:offset});
  }
  this.previous.clear();this.snapshots.push({at:now,s:authority});if(this.snapshots.length>20)this.snapshots.shift();this.last=authority;
 }
 capture(s:State,ids:number[]){for(const id of ids)if(s.karts[id])this.previous.set(id,{...s.karts[id]});}
 sample(s:State,ids:number[],now:number,alpha=1):State{
  if(s.phase!=='playing')return s;const target=now-this.delay,frames=this.snapshots;let a=frames[0],b=a;
  for(let i=1;i<frames.length;i++){b=frames[i];if(b.at>=target)break;a=b;}
  const t=a&&b?clamp((target-a.at)/Math.max(1,b.at-a.at),0,1):1;
  const karts=s.karts.map(k=>{
   if(ids.includes(k.id)){const previous=this.previous.get(k.id);let result=previous&&previous.balloons===k.balloons&&Math.hypot(k.x-previous.x,k.y-previous.y,k.z-previous.z)<5?blend(previous,k,clamp(alpha,0,1)):{...k};const error=this.errors.get(k.id);if(error){const decay=Math.exp(-(now-error.at)/100);result={...result,x:result.x+error.pose.x*decay,y:result.y+error.pose.y*decay,z:result.z+error.pose.z*decay,angle:result.angle+error.pose.angle*decay};}return result;}
   const p=a?.s.karts[k.id],q=b?.s.karts[k.id];if(!p||!q||p.balloons!==k.balloons||q.balloons!==k.balloons||Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z)>12)return k;
   const result=blend(p,{...k,x:q.x,y:q.y,z:q.z,angle:q.angle},t);for(const field of ['speed','steering','yawRate','driftSlip','vx','vz','vy'] as const)result[field]=p[field]+(q[field]-p[field])*t;return result;
  });
  const shots=s.shots.map(shot=>{const p=a?.s.shots.find(p=>p.id===shot.id),q=b?.s.shots.find(p=>p.id===shot.id);return p&&q&&Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z)<15?blend(p,{...shot,x:q.x,y:q.y,z:q.z,angle:q.angle},t):shot;});
  let ball=s.ball;const p=a?.s.ball,q=b?.s.ball;if(ball&&p&&q&&p.respawn===0&&q.respawn===0&&ball.respawn===0&&p.goals[0]===ball.goals[0]&&p.goals[1]===ball.goals[1])ball={...ball,x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t,z:p.z+(q.z-p.z)*t};
  const ctf=s.ctf?{...s.ctf,flags:s.ctf.flags.map(f=>f.carrier===null?f:{...f,...pose(karts[f.carrier])})}:undefined;
  return {...s,karts,shots,ball,ctf};
 }
}
