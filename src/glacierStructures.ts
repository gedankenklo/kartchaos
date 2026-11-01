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
 for(const b of EXPANSIONS.glacier.blocks){const t=b.thickness??b.height,geo=new T.BoxGeometry(b.width,t,b.depth).toNonIndexed(),p=geo.getAttribute('position'),tops:number[]=[],sides:number[]=[];
  for(let i=0;i<p.count;i++){const target=i>=12&&i<18?tops:sides;target.push(p.getX(i)+b.x,p.getY(i)+b.height-t/2,p.getZ(i)+b.z);}geo.dispose();
  add(tops,b.color,'glacierDeckTop',true);add(sides,b.color,'glacierDeckShell',false);
 }
 for(const r of EXPANSIONS.glacier.ramps){const geo=createRampSlab({...r,thickness:r.thickness??Math.max(r.bottom,r.top)+1}),p=geo.getAttribute('position'),top:number[]=[],shell:number[]=[];
  for(let i=0;i<p.count;i++){const y=r.thickness?p.getY(i):Math.max(0,p.getY(i));(i<6?top:shell).push(p.getX(i),y,p.getZ(i));}geo.dispose();
  add(top,'#b9e3ed','glacierRampTop',true);add(shell,'#6ca8c3','glacierRampShell',false);
 }
 const paint:number[]=[];
 const quad=(a:number[],b:number[],c:number[],d:number[])=>paint.push(...a,...b,...c,...a,...c,...d);
 for(const e of exposedLedges(EXPANSIONS.glacier.blocks.filter(b=>b.driveable).map(b=>({...b,y:b.height})),EXPANSIONS.glacier.ramps)){
  const point=(along:number,cross:number)=>e.axis==='x'?[along,e.y+.025,cross]:[cross,e.y+.025,along],inside=e.cross+e.inward*.2;
  quad(point(e.from,inside),point(e.to,inside),point(e.to,inside+e.inward*.12),point(e.from,inside+e.inward*.12));
 }
 for(const r of EXPANSIONS.glacier.ramps)for(const side of [-1,1]){const c=r.cross+side*(r.width/2-.24),point=(a:number,cross:number,y:number)=>r.axis==='x'?[a,y+.025,cross]:[cross,y+.025,a];quad(point(r.from,c,r.bottom),point(r.to,c,r.top),point(r.to,c+.12,r.top),point(r.from,c+.12,r.bottom));}
 const geometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(paint,3)),material=new T.MeshBasicMaterial({color:'#d8f7ff',side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});const marks=new T.Mesh(geometry,material);marks.name='glacierSurfacePaint';marks.userData.disposeMaterial=true;marks.raycast=()=>{};root.add(marks);return root;
}
