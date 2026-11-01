import {advanceGlobe,globeDelta,globeDistance} from './globe';
import {angleDiff,clamp,type State,type Kart} from './sim';
// Keep authoritative physics at 60 Hz; interpolate a separate display pose.
export class RenderInterpolation {
 source?:State;tick=-1;previous=new Map<number,Kart>();
 capture(s:State){this.source=s;this.tick=s.tick;this.previous=new Map(s.karts.map(k=>[k.id,{...k}]));}
 sample(s:State,alpha:number):State{
  if(this.source!==s||s.tick!==this.tick+1)return s;
  const t=clamp(alpha,0,1);
  return {...s,karts:s.karts.map(k=>{const p=this.previous.get(k.id);if(p?.orb&&k.orb){if(p.balloons!==k.balloons||globeDistance(p,k)>5)return k;const d=globeDelta(p,k),m=advanceGlobe(p,d.x*t,d.z*t,p.angle);return {...k,x:m.x,z:m.z,y:p.y+(k.y-p.y)*t,angle:m.angle+angleDiff(k.angle,advanceGlobe(p,d.x,d.z,p.angle).angle)*t};}if(!p||p.balloons!==k.balloons||Math.hypot(k.x-p.x,k.z-p.z,k.y-p.y)>5)return k;return {...k,x:p.x+(k.x-p.x)*t,y:p.y+(k.y-p.y)*t,z:p.z+(k.z-p.z)*t,angle:p.angle+angleDiff(k.angle,p.angle)*t};})};
 }
}
