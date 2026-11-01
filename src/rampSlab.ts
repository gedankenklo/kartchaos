import * as T from 'three';
import type {Ramp} from './terrain';
// A closed, consistently wound slab avoids double-sided self-shadow stripes.
export function createRampSlab(r:Ramp){
 const p=(along:number,cross:number,y:number)=>new T.Vector3(...(r.axis==='x'?[along,y,cross]:[cross,y,along]) as [number,number,number]);
 const a=p(r.from,r.cross-r.width/2,r.bottom),b=p(r.to,r.cross-r.width/2,r.top),c=p(r.to,r.cross+r.width/2,r.top),d=p(r.from,r.cross+r.width/2,r.bottom),drop=new T.Vector3(0,-(r.thickness??.45),0),points=[a,b,c,d,...[a,b,c,d].map(v=>v.clone().add(drop))],center=points.reduce((sum,v)=>sum.add(v),new T.Vector3()).multiplyScalar(1/8),vertices:number[]=[];
 for(const face of [[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]]){let [a,b,c,d]=face.map(i=>points[i]);const normal=b.clone().sub(a).cross(c.clone().sub(a)),out=a.clone().add(b).add(c).add(d).multiplyScalar(.25).sub(center);if(normal.dot(out)<0)[b,d]=[d,b];for(const v of [a,b,c,a,c,d])vertices.push(v.x,v.y,v.z);}
 const geometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();return geometry;
}
