import type {Ramp} from './terrain';
export interface Deck {x:number;z:number;width:number;depth:number;y:number;}
export interface Ledge {axis:'x'|'z';cross:number;from:number;to:number;y:number;inward:number;}
// Split only exposed perimeter spans. Shared floor seams and ramp mouths stay open.
export function exposedLedges(decks:Deck[],ramps:Ramp[]=[]):Ledge[]{
 const result:Ledge[]=[],epsilon=.001;
 for(const d of decks)for(const axis of ['x','z'] as const)for(const side of [-1,1]){
  const cross=(axis==='x'?d.z:d.x)+side*(axis==='x'?d.depth:d.width)/2,start=(axis==='x'?d.x-d.width/2:d.z-d.depth/2),end=(axis==='x'?d.x+d.width/2:d.z+d.depth/2);let spans:[number,number][]=[[start,end]];
  const remove=(lo:number,hi:number)=>{spans=spans.flatMap(([a,b])=>hi<=a||lo>=b?[[a,b] as [number,number]]:[[a,Math.max(a,lo)],[Math.min(b,hi),b]].filter(([u,v])=>v-u>epsilon) as [number,number][]);};
  for(const other of decks){if(other===d||Math.abs(other.y-d.y)>epsilon)continue;const near=(axis==='x'?other.z:other.x)-side*(axis==='x'?other.depth:other.width)/2;if(Math.abs(near-cross)<epsilon)remove((axis==='x'?other.x-other.width/2:other.z-other.depth/2),(axis==='x'?other.x+other.width/2:other.z+other.depth/2));}
  for(const r of ramps){if(r.axis===axis)continue;for(const [along,height] of [[r.from,r.bottom],[r.to,r.top]])if(Math.abs(height-d.y)<epsilon&&Math.abs(along-cross)<epsilon)remove(r.cross-r.width/2-.12,r.cross+r.width/2+.12);}
  for(const [from,to] of spans)result.push({axis,cross,from,to,y:d.y,inward:-side});
 }
 return result;
}
