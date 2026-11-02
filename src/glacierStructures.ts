import * as T from 'three';
import {EXPANSIONS} from './arenas';
import {createRampSlab} from './rampSlab';
import {exposedLedges} from './ledges';
import {surfaceMaterial} from './surfaces';
import {toonMaterial} from './toon';
// Flat deck joins match collision heights exactly. Trim is paint on the surface,
// never rotated boxes that can appear as detached beams below thin bridges.
export function createGlacierStructures(toon=false){
 const root=new T.Group();root.name='glacierStructures';
 const mat=(color:string)=>toon?toonMaterial(color):surfaceMaterial(color,'metal',{roughness:.38,metalness:.05});
 const add=(positions:number[],color:string,name:string,shadows:boolean)=>{const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(positions,3));g.computeVertexNormals();const m=new T.Mesh(g,mat(color));m.name=name;m.castShadow=true;m.receiveShadow=shadows;m.userData.disposeMaterial=!toon;root.add(m);return m;};
 const blocks=EXPANSIONS.glacier.blocks,cuts=(axis:'x'|'y'|'z')=>[...new Set(blocks.flatMap(b=>axis==='y'?[b.height-(b.thickness??b.height),b.height]:axis==='x'?[b.x-b.width/2,b.x+b.width/2]:[b.z-b.depth/2,b.z+b.depth/2]))].sort((a,b)=>a-b),xs=cuts('x'),ys=cuts('y'),zs=cuts('z');
 const cell=(i:number,j:number,k:number)=>{if(i<0||j<0||k<0||i>=xs.length-1||j>=ys.length-1||k>=zs.length-1)return undefined;const x=(xs[i]+xs[i+1])/2,y=(ys[j]+ys[j+1])/2,z=(zs[k]+zs[k+1])/2;return blocks.find(b=>Math.abs(x-b.x)<b.width/2&&Math.abs(z-b.z)<b.depth/2&&y>b.height-(b.thickness??b.height)&&y<b.height);};
 const tops:number[]=[],walls:number[]=[];
 const face=(v:number[][],normal:number[])=>{const [a,b,c,d]=v,n=new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]).cross(new T.Vector3(c[0]-a[0],c[1]-a[1],c[2]-a[2])),target=normal[1]===1?tops:walls;for(const p of n.dot(new T.Vector3(...normal as [number,number,number]))<0?[a,d,c,a,c,b]:[a,b,c,a,c,d])target.push(...p);};
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++)for(let k=0;k<zs.length-1;k++){if(!cell(i,j,k))continue;const [x,X,y,Y,z,Z]=[xs[i],xs[i+1],ys[j],ys[j+1],zs[k],zs[k+1]];
  for(const d of [-1,1]){if(!cell(i+d,j,k)){const v=d<0?x:X;face([[v,y,z],[v,Y,z],[v,Y,Z],[v,y,Z]],[d,0,0]);}if(!cell(i,j+d,k)){const v=d<0?y:Y;face([[x,v,z],[X,v,z],[X,v,Z],[x,v,Z]],[0,d,0]);}if(!cell(i,j,k+d)){const v=d<0?z:Z;face([[x,y,v],[X,y,v],[X,Y,v],[x,Y,v]],[0,0,d]);}}
 }
 add(tops,'#9fc1d4','glacierDeckTop',true);add(walls,'#3b6484','glacierDeckShell',false);
 for(const r of EXPANSIONS.glacier.ramps){const geo=createRampSlab({...r,thickness:r.thickness??Math.max(r.bottom,r.top)+1}),p=geo.getAttribute('position'),top:number[]=[],shell:number[]=[];
  for(let i=0;i<p.count;i++){const y=r.thickness?p.getY(i):Math.max(0,p.getY(i));(i<6?top:shell).push(p.getX(i),y,p.getZ(i));}geo.dispose();
  add(top,'#729fbe','glacierRampTop',true);add(shell,'#2d5574','glacierRampShell',false);
 }
 const paint:number[]=[];
 const quad=(a:number[],b:number[],c:number[],d:number[])=>paint.push(...a,...b,...c,...a,...c,...d);
 for(const e of exposedLedges(EXPANSIONS.glacier.blocks.filter(b=>b.driveable).map(b=>({...b,y:b.height})),EXPANSIONS.glacier.ramps)){
  const point=(along:number,cross:number)=>e.axis==='x'?[along,e.y+.025,cross]:[cross,e.y+.025,along],inside=e.cross+e.inward*.2;
  quad(point(e.from,inside),point(e.to,inside),point(e.to,inside+e.inward*.12),point(e.from,inside+e.inward*.12));
 }
 for(const r of EXPANSIONS.glacier.ramps)for(const side of [-1,1]){const c=r.cross+side*(r.width/2-.24),point=(a:number,cross:number,y:number)=>r.axis==='x'?[a,y+.025,cross]:[cross,y+.025,a];quad(point(r.from,c,r.bottom),point(r.to,c,r.top),point(r.to,c+.12,r.top),point(r.from,c+.12,r.bottom));}
 const geometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(paint,3)),material=new T.MeshBasicMaterial({color:'#fff0bd',side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});const marks=new T.Mesh(geometry,material);marks.name='glacierSurfacePaint';marks.userData.disposeMaterial=true;marks.raycast=()=>{};root.add(marks);return root;
}
