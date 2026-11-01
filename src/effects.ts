import {GOAL_FIREWORK_COUNT,fireworkPose} from './celebrations';
import * as T from 'three';
import {clamp,type Event} from './sim';
export const ELIMINATION_TIME=1.15;
export function eliminationPose(age:number,reduced=false){const t=clamp(age/ELIMINATION_TIME,0,1);return {visible:t<1,scale:reduced?1-t:Math.max(.001,1-Math.pow(t,3)),rise:reduced?0:Math.sin(t*Math.PI*.75)*2.8,spin:reduced?0:t*t*Math.PI*3,tilt:reduced?0:Math.sin(t*Math.PI)*.35};}
export const BOX_GROW_TIME=.65;
export function boxGrowScale(respawn:number){if(respawn<=0)return 1;if(respawn>=BOX_GROW_TIME)return 0;const t=1-respawn/BOX_GROW_TIME,x=t-1;return 1+2.70158*x*x*x+1.70158*x*x;}
type Burst={group:T.Group;age:number;duration:number;type:'shockwave'|'pickup'|'eliminated'|'hit'|'goal';rings:T.Mesh[];mine?:boolean;trails?:T.LineSegments;shell?:T.Mesh;shards?:T.InstancedMesh;};
const glow=(color:string,opacity=1)=>new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
export class BattleEffects extends T.Group {
 bursts:Burst[]=[];
 constructor(public reduced=false){super();}
 spawn(event:Event){
  if(event.type!=='shockwave'&&event.type!=='pickup'&&event.type!=='eliminated'&&event.type!=='hit'&&event.type!=='goal')return;
  if(this.bursts.length>=24)this.removeBurst(this.bursts[0]);
  const group=new T.Group(),rings:T.Mesh[]=[];group.position.set(event.x,event.y+(event.type==='pickup'?1.6:.45),event.z);if(event.type==='goal')group.position.set(0,0,0);this.add(group);
  const shock=event.type==='shockwave',ko=event.type==='eliminated',impact=event.type==='hit',goal=event.type==='goal',mine=impact&&event.cause==='mine'&&!event.blocked;
  for(let i=0;i<(shock?3:ko||impact?1:0);i++){const ring=new T.Mesh(new T.RingGeometry(shock?.94:.87,1,64),glow(shock?(i===1?'#ad65e5':'#51c9ef'):'#f9df8e'));if(shock&&i>0)(ring.material as T.MeshBasicMaterial).blending=T.NormalBlending;ring.rotation.x=-Math.PI/2;ring.position.y=i*.18;group.add(ring);rings.push(ring);}
  let shell:T.Mesh|undefined;if(impact){shell=new T.Mesh(new T.IcosahedronGeometry(1,1),glow(event.blocked?'#8edfe6':mine?'#ffad57':'#fff3bd',mine?.85:.65));shell.position.y=1.3;group.add(shell);}
  if(shock){shell=new T.Mesh(new T.SphereGeometry(1,28,14),new T.MeshBasicMaterial({color:'#73dbf3',transparent:true,opacity:.24,depthWrite:false,side:T.DoubleSide}));group.add(shell);}
  let shards:T.InstancedMesh|undefined;
  if(!shock){shards=new T.InstancedMesh(ko||goal?new T.OctahedronGeometry(goal?.6:.28):new T.TetrahedronGeometry(.28),goal?new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}):new T.MeshPhysicalMaterial({color:0xffffff,roughness:.19,clearcoat:1,flatShading:true,transparent:true,opacity:.87,depthWrite:false}),goal?(this.reduced?96:GOAL_FIREWORK_COUNT):mine?32:16);for(let i=0;i<(goal?(this.reduced?96:GOAL_FIREWORK_COUNT):mine?32:16);i++)shards.setColorAt(i,new T.Color((ko||goal?['#ffe278','#fff6c6','#f68b67','#a0e6ef']:['#b188e6','#f6dfa0','#91e3e3','#e3c9ff'])[i%4]));shards.frustumCulled=false;group.add(shards);}
  let trails:T.LineSegments|undefined;if(goal&&!this.reduced){const geometry=new T.BufferGeometry(),positions=new Float32Array(GOAL_FIREWORK_COUNT*6),colors=new Float32Array(GOAL_FIREWORK_COUNT*6);for(let i=0;i<GOAL_FIREWORK_COUNT;i++){const color=new T.Color(['#ffe59b','#ff87ce','#8eebff','#c5ffa0'][i%4]);colors.set(color.toArray(),i*6);colors.set(color.toArray(),i*6+3);}geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('color',new T.BufferAttribute(colors,3));trails=new T.LineSegments(geometry,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));trails.frustumCulled=false;group.add(trails);}
  this.bursts.push({group,age:0,duration:goal?5.8:mine?.85:shock?.95:ko?ELIMINATION_TIME:impact?.26:.75,type:event.type,mine,rings,shell,shards,trails});
  this.pose(this.bursts[this.bursts.length-1]);
 }
 private pose(b:Burst){
  const t=clamp(b.age/b.duration,0,1),fade=1-t,shock=b.type==='shockwave';
  b.rings.forEach((r,i)=>{const phase=clamp((t-i*.12)/(1-i*.12),0,1),radius=this.reduced?(shock?9:2):shock?Math.sin(phase*Math.PI/2)*9:.5+phase*(b.mine?7:2.8);r.scale.setScalar(Math.max(.01,radius));(r.material as T.MeshBasicMaterial).opacity=(phase>0||this.reduced?1:0)*fade*.9;});
  if(shock){const radius=this.reduced?9:Math.max(.1,Math.sin(t*Math.PI/2)*9);b.shell!.scale.set(radius,Math.max(.1,radius*.3),radius);(b.shell!.material as T.MeshBasicMaterial).opacity=fade*fade*.24;}
  else {
   if(b.type==='hit'&&b.shell){b.shell.scale.setScalar(.8+t*(b.mine?5.5:1.4));(b.shell.material as T.MeshBasicMaterial).opacity=fade*fade*.65;}
   if(b.type==='goal'){const dummy=new T.Object3D(),trailPositions=b.trails?.geometry.getAttribute('position') as T.BufferAttribute|undefined;for(let i=0;i<b.shards!.count;i++){const p=fireworkPose(i,b.age,this.reduced);dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(i+t*5,i*.2+t*4,t*3);dummy.scale.setScalar(Math.max(.001,p.scale));dummy.updateMatrix();b.shards!.setMatrixAt(i,dummy.matrix);if(trailPositions){trailPositions.setXYZ(i*2,p.x,p.y,p.z);trailPositions.setXYZ(i*2+1,p.scale>.02?p.tx:p.x,p.scale>.02?p.yTail:p.y,p.scale>.02?p.zTail:p.z);}}b.shards!.instanceMatrix.needsUpdate=true;(b.shards!.material as T.MeshBasicMaterial).opacity=1;if(trailPositions)trailPositions.needsUpdate=true;if(b.trails)(b.trails.material as T.LineBasicMaterial).opacity=.85*Math.min(1,fade*5);return;}
   const dummy=new T.Object3D();for(let i=0;i<b.shards!.count;i++){const angle=i*2.399,r=this.reduced?.65:.35+b.age*(b.mine?8+(i%4):1.7+(i%4)*.55);dummy.position.set(Math.sin(angle)*r,this.reduced?0:b.type==='eliminated'?b.age*(5+(i%3)) -3*b.age*b.age:b.age*(1.4+(i%3)*.45)-5.8*b.age*b.age,Math.cos(angle)*r);
   dummy.rotation.set(t*5+i,t*7,t*3+i);dummy.scale.setScalar(Math.max(.01,fade));dummy.updateMatrix();b.shards!.setMatrixAt(i,dummy.matrix);}b.shards!.instanceMatrix.needsUpdate=true;(b.shards!.material as T.MeshPhysicalMaterial).opacity=fade*.87;
  }
 }
 update(dt:number){for(const b of [...this.bursts]){b.age+=dt;if(b.age>=b.duration)this.removeBurst(b);else this.pose(b);}}
 private removeBurst(b:Burst){b.group.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.LineSegments){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});b.group.removeFromParent();this.bursts.splice(this.bursts.indexOf(b),1);}
 clearBursts(){for(const b of [...this.bursts])this.removeBurst(b);}
}



