import {createGlow} from './visualPolish';
// A short overshoot, then a damped settling jiggle; reduced motion reveals instantly.
export function heldItemReveal(age:number,reduced=false){if(reduced||age>=.75)return {scale:1,lift:0,tilt:0};const t=Math.max(0,age),fade=Math.exp(-8*t);return {scale:Math.max(.08,1-fade*Math.cos(15*t)),lift:Math.sin(t*15)*fade*.18,tilt:Math.sin(t*23)*fade*.24};}
import * as T from 'three';
import type {Item,Kart} from './sim';
import {toonMaterial} from './toon';
const COLORS:Record<Item,string>={bolt:'#65c788',seeker:'#b494f4',mine:'#f29a58',boost:'#f5c65d',shield:'#76d8f4',pulse:'#c5a4ff'};
export function createHeldItem(item:Item,toon=false){
 const root=new T.Group();root.name='held-'+item;const glow=createGlow(COLORS[item],4.6,.8),core=createGlow(COLORS[item],2.2,.65);glow.name='heldItemGlow';core.name='heldItemGlowCore';root.add(glow,core);
 const material=(color:string,basic=false)=>basic?new T.MeshBasicMaterial({color,side:T.DoubleSide,toneMapped:false}):toon?toonMaterial(color).clone():new T.MeshStandardMaterial({color,roughness:.34,metalness:.12,emissive:color,emissiveIntensity:.07});
 const mesh=(geo:T.BufferGeometry,color:string,x=0,y=0,z=0,basic=false)=>{const m=new T.Mesh(geo,material(color,basic));m.position.set(x,y,z);m.userData.disposeMaterial=true;m.castShadow=m.receiveShadow=false;m.raycast=()=>{};root.add(m);return m;};
 if(item==='bolt'){const shell=mesh(new T.SphereGeometry(.58,12,8),COLORS.bolt);shell.scale.y=.62;const rim=mesh(new T.TorusGeometry(.53,.1,6,24),'#fff0c2');rim.rotation.x=Math.PI/2;mesh(new T.CylinderGeometry(.4,.4,.15,12),'#315e52',0,-.22);for(let i=0;i<6;i++){const a=i*Math.PI/3,plate=mesh(new T.BoxGeometry(.055,.07,.5),'#326749',Math.sin(a)*.23,.3,Math.cos(a)*.23);plate.rotation.y=a;}}
 if(item==='seeker'){const body=mesh(new T.CylinderGeometry(.23,.27,.85,12),COLORS.seeker);body.rotation.x=Math.PI/2;const nose=mesh(new T.ConeGeometry(.23,.35,12),'#f8cfef',0,0,.59);nose.rotation.x=Math.PI/2;for(const side of [-1,1])mesh(new T.BoxGeometry(.18,.08,.4),'#6e4c99',side*.3,-.09,-.25);const eye=mesh(new T.TorusGeometry(.16,.04,6,16),'#a5f6ff',0,0,.49,true);eye.rotation.y=0;}
 if(item==='mine'){mesh(new T.CylinderGeometry(.48,.55,.22,12),'#725044',0,-.18);mesh(new T.SphereGeometry(.4,10,8),COLORS.mine,0,.02);for(let i=0;i<6;i++){const a=i*Math.PI/3,spike=mesh(new T.ConeGeometry(.105,.25,6),'#ffe4ab',Math.sin(a)*.39,.02,Math.cos(a)*.39);spike.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(Math.sin(a),0,Math.cos(a)));}mesh(new T.SphereGeometry(.1,8,6),'#ff6458',0,.42,0,true);}
 if(item==='boost'){mesh(new T.CylinderGeometry(.3,.3,.85,12),'#52bbaa');for(const side of [-1,1])mesh(new T.CylinderGeometry(.32,.32,.1,12),'#fff0c2',0,side*.43);mesh(new T.CylinderGeometry(.15,.15,.16,8),'#4e6474',0,.56);const bolt=new T.Shape();bolt.moveTo(.09,.3);bolt.lineTo(-.15,-.02);bolt.lineTo(-.02,-.02);bolt.lineTo(-.09,-.3);bolt.lineTo(.17,.07);bolt.lineTo(.03,.07);bolt.closePath();mesh(new T.ShapeGeometry(bolt),'#ffe081',0,0,.315,true);}
 if(item==='shield'){const shape=new T.Shape();shape.moveTo(0,.65);shape.lineTo(.5,.34);shape.lineTo(.4,-.28);shape.lineTo(0,-.65);shape.lineTo(-.4,-.28);shape.lineTo(-.5,.34);shape.closePath();mesh(new T.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:false}),'#e7f9ff',0,0,-.06);const inner=mesh(new T.ShapeGeometry(shape),'#55b9dc',0,0,.075,true);inner.scale.setScalar(.78);const back=mesh(new T.ShapeGeometry(shape),'#55b9dc',0,0,-.075,true);back.scale.setScalar(.78);const badge=mesh(new T.OctahedronGeometry(.17),'#f2ffff',0,0,.12,true);badge.scale.z=.3;}
 if(item==='pulse'){mesh(new T.OctahedronGeometry(.25),'#c8fbff',0,0,0,true);for(let i=0;i<3;i++){const ring=mesh(new T.TorusGeometry(.32+i*.13,.045,6,32),i%2?'#a5edff':COLORS.pulse);ring.rotation.set(i*.5,i*.7,0);}}
 const halo=mesh(new T.TorusGeometry(.48,.025,5,32),COLORS[item],0,-.65,0,true);halo.name='heldHoverHalo';halo.rotation.x=Math.PI/2;halo.material.transparent=true;halo.material.opacity=.4;halo.material.depthWrite=false;
 root.scale.setScalar(.78);return root;
}
export class HeldItemDisplay extends T.Group {
 item:Item|null=null;model?:T.Group;revealAge=0;
 motion=new T.Vector3();velocity=new T.Vector3();target=new T.Vector3();previousSpeed?:number;previousVy?:number;
 constructor(public toon=false){super();this.name='heldItemDisplay';this.visible=false;this.position.set(1.8,1.55,-1.45);}
 clearModel(){if(this.model){const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();this.model.traverse(o=>{if(o instanceof T.Sprite)materials.add(o.material);if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.remove(this.model);this.model=undefined;}this.item=null;this.revealAge=0;this.motion.set(0,0,0);this.velocity.set(0,0,0);this.previousSpeed=this.previousVy=undefined;}
 update(k:Pick<Kart,'item'|'roulette'|'balloons'|'id'>&Partial<Pick<Kart,'speed'|'yawRate'|'steering'|'angle'|'pushX'|'pushZ'|'vy'>>,now:number,reduced=false,playing=true,dt=1/60){
  const item=playing&&k.balloons>0&&k.roulette<=0?k.item:null;
  if(item!==this.item){this.clearModel();if(item){this.model=createHeldItem(item,this.toon);this.add(this.model);this.item=item;}}
  this.visible=!!item;if(!this.model)return;
  this.revealAge=Math.min(1,this.revealAge+Math.max(0,Math.min(.1,dt)));
  const glow=this.model.getObjectByName('heldItemGlow') as T.Sprite,core=this.model.getObjectByName('heldItemGlowCore') as T.Sprite;const pulse=reduced?0:Math.sin(now*2.4+k.id);glow.material.opacity=.8+pulse*.1;glow.scale.setScalar(4.6+pulse*.2);core.material.opacity=.65+pulse*.05;
  const pop=heldItemReveal(this.revealAge,reduced);this.model.scale.setScalar(.78*pop.scale);
  const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v)),speed=k.speed??0,vy=k.vy??0;
  const acceleration=dt>0&&this.previousSpeed!==undefined?clamp((speed-this.previousSpeed)/dt,-50,50):0;
  const landing=dt>0&&this.previousVy!==undefined?clamp((vy-this.previousVy)/dt,-60,60):0;
  this.previousSpeed=speed;this.previousVy=vy;
  const angle=k.angle??0,side=(k.pushX??0)*Math.cos(angle)-(k.pushZ??0)*Math.sin(angle),back=(k.pushX??0)*Math.sin(angle)+(k.pushZ??0)*Math.cos(angle);
  const yaw=k.yawRate??(k.steering??0)*1.4,t=reduced?0:now;
  const target=this.target.set(clamp(-yaw*speed*.006-side*.014+Math.sin(t*1.6+k.id)*.025,-.16,.28),clamp(-landing*.0018,-.08,.08),clamp(-acceleration*.006-speed*.002-back*.012+Math.cos(t*1.3+k.id)*.02,-.32,.2));
  if(reduced){this.motion.set(0,0,0);this.velocity.set(0,0,0);}else{
   // A damped spring gives the item inertia without frame-rate-dependent wobble.
   let remaining=clamp(dt,0,.1);while(remaining>0){const h=Math.min(remaining,1/120);this.velocity.x+=(target.x-this.motion.x)*32*h;this.velocity.y+=(target.y-this.motion.y)*32*h;this.velocity.z+=(target.z-this.motion.z)*32*h;this.velocity.multiplyScalar(Math.exp(-8*h));this.motion.addScaledVector(this.velocity,h);remaining-=h;}
   this.motion.x=clamp(this.motion.x,-.18,.32);this.motion.y=clamp(this.motion.y,-.1,.1);this.motion.z=clamp(this.motion.z,-.36,.24);
  }
  this.position.set(1.8+this.motion.x,1.55+this.motion.y+pop.lift+(reduced?0:Math.sin(t*2.1+k.id)*.045),-1.45+this.motion.z);
  this.model.rotation.set(this.motion.z*.35,Math.PI+(reduced?0:item==='shield'?Math.sin(t*.8)*.25:t*.35),-this.motion.x*.8+pop.tilt+(reduced?0:Math.sin(t*1.4+k.id)*.035));
 }
}
