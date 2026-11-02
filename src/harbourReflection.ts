import * as T from 'three';
import {ARENAS,EXPANSIONS} from './arenas';
import {harbourIceAt} from './newArenaRules';
// Cut the reflector to the basin, leaving snow, dock foundations and ramps dry.
// XY vertices rotate into world XZ, exactly like the existing ice reflector.
export function harbourIceGeometry(){
 const scale=ARENAS.harbour.scale,xs=new Set([-41,-29,-24,24,29,41]),zs=new Set([-39,-12,16,37]);
 for(const b of EXPANSIONS.harbour.blocks){xs.add(b.x-b.width/2);xs.add(b.x+b.width/2);zs.add(b.z-b.depth/2);zs.add(b.z+b.depth/2);}
 for(const r of EXPANSIONS.harbour.ramps){const along=r.axis==='x'?xs:zs,cross=r.axis==='x'?zs:xs;along.add(r.from);along.add(r.to);cross.add(r.cross-r.width/2);cross.add(r.cross+r.width/2);}
 const x=[...xs].sort((a,b)=>a-b),z=[...zs].sort((a,b)=>a-b),v:number[]=[];
 for(let i=0;i<x.length-1;i++)for(let j=0;j<z.length-1;j++){
  if(!harbourIceAt((x[i]+x[i+1])/2*scale,(z[j]+z[j+1])/2*scale,0))continue;
  const x0=x[i]*scale,x1=x[i+1]*scale,z0=z[j]*scale,z1=z[j+1]*scale;v.push(x0,-z0,0,x1,-z1,0,x1,-z0,0,x0,-z0,0,x0,-z1,0,x1,-z1,0);
 }
 const geometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));geometry.computeVertexNormals();return geometry;
}
