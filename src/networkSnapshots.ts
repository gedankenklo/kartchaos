import type {State,Kart} from './sim';
type Changes={set:Record<string,unknown>;remove:string[]};
export interface Snapshot {frame:number;base:number;full?:State;delta?:{state:Changes;karts:[number,Changes][];boxes:[number,number][];shots?:State['shots'];events:State['events']};}
const omitted=new Set(['karts','boxes','shots','events']);
function fields(value:object,cache:Map<string,string>,skip=new Set<string>()):Changes{
 const set:Record<string,unknown>={},remove:string[]=[],seen=new Set<string>();
 for(const [key,v] of Object.entries(value)){if(skip.has(key)||v===undefined)continue;seen.add(key);const json=JSON.stringify(v);if(cache.get(key)!==json){set[key]=v;cache.set(key,json);}}
 for(const key of cache.keys())if(!seen.has(key)){remove.push(key);cache.delete(key);}
 return {set,remove};
}
function apply<T extends object>(value:T,patch:Changes):T{const result={...value,...patch.set} as T;for(const key of patch.remove)delete (result as Record<string,unknown>)[key];return result;}
// Cache serialized field values, not references to the mutable simulation.
// One encoder serves the whole room. Routine packets omit all unchanged fields.
export class SnapshotEncoder{
 frame=0;source?:State;state=new Map<string,string>();karts=new Map<number,Map<string,string>>();boxes:number[]=[];shots='';serial=0;
 encode(s:State):Snapshot{
  const full=this.source!==s||this.frame%40===0;const base=this.frame++;this.source=s;
  const state=fields(s,this.state,omitted),karts:[number,Changes][]=[];
  for(const k of s.karts){let cache=this.karts.get(k.id);if(!cache){cache=new Map();this.karts.set(k.id,cache);}const patch=fields(k,cache);if(Object.keys(patch.set).length||patch.remove.length)karts.push([k.id,patch]);}
  const boxes:[number,number][]=[];s.boxes.forEach((box,i)=>{if(this.boxes[i]!==box.respawn)boxes.push([i,box.respawn]);});this.boxes=s.boxes.map(b=>b.respawn);
  const shotsJSON=JSON.stringify(s.shots),shots=shotsJSON!==this.shots?s.shots:undefined;this.shots=shotsJSON;
  const events=s.events.filter(e=>e.id>this.serial);this.serial=s.serial;
  return full?{frame:this.frame,base:0,full:s}:{frame:this.frame,base,delta:{state,karts,boxes,shots,events}};
 }
 keyframe(s:State):Snapshot{return {frame:this.frame,base:0,full:s};}
}
export class SnapshotDecoder{
 state?:State;frame=0;
 reset(){this.state=undefined;this.frame=0;}
 decode(packet:Snapshot):State|undefined{
  if(packet.full){this.state=packet.full;this.frame=packet.frame;return this.state;}
  if(!this.state||packet.base!==this.frame||!packet.delta)return undefined;
  const d=packet.delta,s=apply(this.state,d.state),updates=new Map(d.karts);
  s.karts=s.karts.map(k=>updates.has(k.id)?apply<Kart>(k,updates.get(k.id)!):k);
  const boxes=new Map(d.boxes);s.boxes=s.boxes.map((b,i)=>boxes.has(i)?{...b,respawn:boxes.get(i)!}:b);
  s.shots=d.shots??s.shots;s.events=[...s.events,...d.events].slice(-24);
  this.state=s;this.frame=packet.frame;return s;
 }
}
