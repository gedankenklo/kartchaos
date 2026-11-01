import * as T from 'three';
import {ARENAS,LAVA_PITS,type Arena} from './arenas';
export interface Suspension {offset:number;velocity:number;}
export function stepSuspension(state:Suspension,dt:number,kick=0){const time=Math.max(0,Math.min(.06,dt));state.velocity=Math.max(-2,Math.min(2,state.velocity+kick));const steps=Math.max(1,Math.ceil(time*120)),h=time/steps;for(let i=0;i<steps;i++){state.velocity+=(-95*state.offset-11*state.velocity)*h;state.offset+=state.velocity*h;state.offset=Math.max(-.12,Math.min(.1,state.offset));}return state.offset;}
let glowMap:T.DataTexture|undefined;
export function glowTexture(){if(!glowMap){const size=64,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const radius=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5),i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=255;data[i+3]=Math.round(Math.pow(Math.max(0,1-radius),2.7)*180);}glowMap=new T.DataTexture(data,size,size);glowMap.magFilter=T.LinearFilter;glowMap.needsUpdate=true;}return glowMap;}
export function createGlow(color:string,size:number,opacity=.35){const material=new T.SpriteMaterial({map:glowTexture(),color,transparent:true,opacity,blending:T.AdditiveBlending,depthWrite:false,depthTest:true,toneMapped:false});const sprite=new T.Sprite(material);sprite.scale.setScalar(size);sprite.userData.disposeMaterial=true;sprite.userData.softGlow=true;sprite.raycast=()=>{};return sprite;}
export class ArenaAtmosphere extends T.Group {
 particles?:T.Points;water?:T.ShaderMaterial;colors?:T.BufferAttribute;glows:T.Sprite[]=[];kind:Arena;
 constructor(arena:Arena){super();this.name='arenaAtmosphere';this.kind=arena;const info=ARENAS[arena],scale=info.scale,height=info.height,e=info.extent*scale;
  if(arena==='castle'){
   const positions=new Float32Array(96*3);for(let i=0;i<96;i++){const pit=LAVA_PITS[i%4];positions[i*3]=(pit.x+Math.sin(i*2.399)*pit.width*.4)*scale;positions[i*3+1]=i%12*.65;positions[i*3+2]=(pit.z+Math.cos(i*2.399)*pit.depth*.4)*scale;}
   this.particles=new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(positions,3)),new T.PointsMaterial({map:glowTexture(),color:'#ffb565',size:.6,transparent:true,opacity:.7,depthWrite:false,blending:T.AdditiveBlending}));this.particles.name='castleEmbers';this.add(this.particles);
   for(const x of [-8,8])for(const z of [-9,9]){const glow=createGlow('#ffac55',5,.3);glow.position.set(x*scale,3.4*height,z*scale);this.glows.push(glow);this.add(glow);}
  }
  if(arena==='beach'||arena==='depot'){
   this.water=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec3 p;void main(){p=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}',fragmentShader:'varying vec3 p;uniform float time;void main(){float wave=sin(p.x*.13+p.z*.19-time*.65+sin(p.z*.08)*1.5);float foam=smoothstep(.88,.99,wave);gl_FragColor=vec4(vec3(.79,.94,.91),foam*.42);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
   for(const sign of [-1,1])for(const axis of ['x','z']){const across=axis==='x',mesh=new T.Mesh(new T.PlaneGeometry(across?24:e*2+48,across?e*2:24),this.water);mesh.rotation.x=-Math.PI/2;mesh.position.set(across?sign*(e+12):0,arena==='beach'?-.15:-1.5*height+.25,across?0:sign*(e+12));mesh.raycast=()=>{};mesh.userData.foam=true;this.add(mesh);}
  }
  if(arena==='stadium'){
   const positions=new Float32Array(384*3),colors=new Float32Array(384*3);for(let i=0;i<384;i++){const side=i%4,row=Math.floor(i/4)%12,across=((i*17)%89/88*2-1)*(info.extent+3+row*2.5),r=(info.extent+4.3+row*2.5);positions[i*3]=(side%2?r:across)*scale*(side===3?-1:1);positions[i*3+1]=(2.2*(row+1)+3)*height;positions[i*3+2]=(side%2?across:r)*scale*(side===2?-1:1);colors.set(new T.Color(i%3?'#b8e5ff':'#ffe5af').toArray(),i*3);}
   this.colors=new T.BufferAttribute(colors,3);this.particles=new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(positions,3)).setAttribute('color',this.colors),new T.PointsMaterial({map:glowTexture(),size:2.1,transparent:true,opacity:.9,depthWrite:false,vertexColors:true,blending:T.AdditiveBlending}));this.particles.name='stadiumCrowdLights';this.add(this.particles);
   for(const x of [-1,1])for(const z of [-1,1]){const glow=createGlow('#fff0c2',17,.35);glow.position.set(x*(info.extent+3)*scale,44*height,z*(info.extent+3)*scale);this.glows.push(glow);this.add(glow);}
  }
  this.traverse(object=>{object.raycast=()=>{};});
 }
 update(now:number,reduced=false){for(const child of this.children)if(child.userData.foam)child.visible=!reduced;const time=reduced?0:now;this.glows.forEach((glow,index)=>{glow.visible=!reduced;glow.material.opacity=.27+Math.sin(time*.9+index)*.035;});if(this.water)this.water.uniforms.time.value=time;
  if(this.particles){this.particles.geometry.setDrawRange(0,reduced?24:Infinity);if(this.kind==='castle'){const p=this.particles.geometry.getAttribute('position') as T.BufferAttribute;for(let i=0;i<p.count;i++)p.setY(i,((i*.83+time*.8)%8)-1);p.needsUpdate=true;}
   if(this.colors){for(let i=0;i<this.colors.count;i++){const phase=.25+.75*Math.pow((Math.sin(time*.75+i*.31)+1)/2,5);this.colors.setXYZ(i,phase,phase*(i%3?.85:.95),phase*(i%3?1:.65));}this.colors.needsUpdate=true;}}
 }
 dispose(){const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();this.traverse(object=>{if(object instanceof T.Points||object instanceof T.Mesh){geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);}else if(object instanceof T.Sprite)materials.add(object.material);});geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());this.removeFromParent();}
}


