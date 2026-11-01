import * as T from 'three';
import {EXPANSIONS} from './arenas';
import {surfaceMaterial} from './surfaces';
import {toonMaterial} from './toon';
// Render the union of dock blocks: overlapping L-shaped decks and the lookout
// share one skin, rather than drawing coincident side walls and deck tops.
export function createHarbourDocks(toon=false){
 const blocks=EXPANSIONS.harbour.blocks,xs=[...new Set(blocks.flatMap(b=>[b.x-b.width/2,b.x+b.width/2]))].sort((a,b)=>a-b),zs=[...new Set(blocks.flatMap(b=>[b.z-b.depth/2,b.z+b.depth/2]))].sort((a,b)=>a-b);
 const cell=(i:number,j:number)=>i<0||j<0||i>=xs.length-1||j>=zs.length-1?undefined:blocks.filter(b=>Math.abs((xs[i]+xs[i+1])/2-b.x)<b.width/2&&Math.abs((zs[j]+zs[j+1])/2-b.z)<b.depth/2).sort((a,b)=>b.height-a.height)[0];
 const tops={vertices:[] as number[],colors:[] as number[]},walls={vertices:[] as number[],colors:[] as number[]};
 const quad=(points:number[][],normal:number[],color:T.Color)=>{const [a,b,c,d]=points,n=new T.Vector3(...b as [number,number,number]).sub(new T.Vector3(...a as [number,number,number])).cross(new T.Vector3(...c as [number,number,number]).sub(new T.Vector3(...a as [number,number,number])));const ordered=n.dot(new T.Vector3(...normal as [number,number,number]))<0?[a,d,c,a,c,b]:[a,b,c,a,c,d];const target=normal[1]===1?tops:walls;for(const p of ordered){target.vertices.push(...p);target.colors.push(color.r,color.g,color.b);}};
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){
  const b=cell(i,j);if(!b)continue;const [x0,x1,z0,z1,h]=[xs[i],xs[i+1],zs[j],zs[j+1],b.height],base=new T.Color(b.color),top=toon?base.clone().lerp(new T.Color('#fff1cf'),.24):base,side=base.clone().multiplyScalar(toon?.84:.92);
  quad([[x0,h,z0],[x1,h,z0],[x1,h,z1],[x0,h,z1]],[0,1,0],top);
  for(const [di,dj] of [[-1,0],[1,0],[0,-1],[0,1]]){const lower=cell(i+di,j+dj)?.height??0;if(lower>=h)continue;
   if(di){const x=di<0?x0:x1;quad([[x,lower,z0],[x,h,z0],[x,h,z1],[x,lower,z1]],[di,0,0],side);}else{const z=dj<0?z0:z1;quad([[x0,lower,z],[x1,lower,z],[x1,h,z],[x0,h,z]],[0,0,dj],side);}
  }
 }
 const root=new T.Group();root.name='harbourDockSkin';
 for(const [name,data,receive] of [['harbourDockTops',tops,true],['harbourDockWalls',walls,false]] as const){
  const geometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(data.vertices,3)).setAttribute('color',new T.Float32BufferAttribute(data.colors,3));geometry.computeVertexNormals();
  const material=toon?toonMaterial('#ffffff',new T.Color(0),0,T.FrontSide,true):surfaceMaterial('#ffffff','wood',{vertexColors:true});
  const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=receive;mesh.userData.disposeMaterial=!toon;root.add(mesh);
 }
 return root;
}
