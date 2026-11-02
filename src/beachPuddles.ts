import * as T from 'three';
export const BEACH_PUDDLES=[{x:0,z:0,rx:12,rz:8},{x:-80,z:20,rx:11,rz:7},{x:75,z:-55,rx:13,rz:8},{x:-22,z:80,rx:12,rz:8},{x:25,z:-90,rx:13,rz:7}];
export const beachPuddleAt=(x:number,z:number)=>BEACH_PUDDLES.some(p=>((x-p.x)/p.rx)**2+((z-p.z)/p.rz)**2<1);
// XY geometry rotates into the world XZ plane, sharing one reflection pass.
export function beachPuddleGeometry(){const v:number[]=[];for(const p of BEACH_PUDDLES)for(let i=0;i<64;i++){const a=i*Math.PI/32,b=(i+1)*Math.PI/32;v.push(p.x,-p.z,0,p.x+Math.cos(b)*p.rx,-p.z-Math.sin(b)*p.rz,0,p.x+Math.cos(a)*p.rx,-p.z-Math.sin(a)*p.rz,0);}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();return g;}
