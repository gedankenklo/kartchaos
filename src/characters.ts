import {applyToon,contactShadow} from './toon';
import {surfaceMaterial} from './surfaces';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {COLORS,clamp,type Kart} from './sim';

export const CREW=[
 {name:'ROOK',species:'Fox',fur:'#dd955e',cream:'#ffe2b4',tag:'Quick paws. Quicker getaways.'},
 {name:'BOLT',species:'Raccoon',fur:'#a5acbb',cream:'#e9e5db',tag:'A little mischief goes a long way.'},
 {name:'MANGO',species:'Duck',fur:'#f0ca69',cream:'#fff0be',tag:'Cool under pressure. Loud under fire.'},
 {name:'PLUM',species:'Rabbit',fur:'#d1bccf',cream:'#fff0e7',tag:'Big ears. Bigger escape plans.'},
 {name:'MINT',species:'Frog',fur:'#80bda2',cream:'#d8ecc5',tag:'A smooth operator with a mean hop.'},
 {name:'PEACH',species:'Cat',fur:'#dfb79e',cream:'#ffead5',tag:'Nine lives would make this too easy.'},
 {name:'SKIP',species:'Dog',fur:'#c9aa84',cream:'#fbe8c9',tag:'Here for the ride. Staying for the chaos.'},
 {name:'PIP',species:'Bear',fur:'#ab8a6e',cream:'#f2d8ad',tag:'Soft paws. Absolutely no mercy.'},
] as const;
const materials=new Map<string,T.MeshStandardMaterial>();
function material(color:string){let m=materials.get(color);if(!m){m=surfaceMaterial(color,color==='#303440'?'rubber':'paint',{roughness:.62,metalness:.03,flatShading:false});materials.set(color,m);}return m;}
function mesh(parent:T.Object3D,geometry:T.BufferGeometry,color:string,x=0,y=0,z=0){const m=new T.Mesh(geometry,material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const box=(p:T.Object3D,c:string,x:number,y:number,z:number,w:number,h:number,d:number,r=.08)=>mesh(p,new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),c,x,y,z);
function ball(p:T.Object3D,c:string,x:number,y:number,z:number,sx:number,sy=sx,sz=sx){const m=mesh(p,new T.SphereGeometry(1,16,12),c,x,y,z);m.scale.set(sx,sy,sz);return m;}
const cylinder=(p:T.Object3D,c:string,x:number,y:number,z:number,r:number,h:number)=>mesh(p,new T.CylinderGeometry(r,r,h,16),c,x,y,z);
function limb(parent:T.Object3D,c:string,from:T.Vector3,to:T.Vector3,r:number){const delta=to.clone().sub(from),m=mesh(parent,new T.CapsuleGeometry(r,Math.max(.01,delta.length()-r*2),4,8),c);m.position.copy(from).add(to).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
function group(parent:T.Object3D,name:string,x=0,y=0,z=0){const g=new T.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;}
// Batch rigid details by material, retaining the named animation groups. This
// keeps the more detailed drivers inexpensive when rendered in four viewports.
function batchDetails(parent:T.Object3D){
 for(const child of [...parent.children])if(child instanceof T.Group)batchDetails(child);
 const buckets=new Map<T.Material,T.Mesh[]>();
 for(const child of parent.children)if(child instanceof T.Mesh&&!child.name&&!Array.isArray(child.material)){const bucket=buckets.get(child.material)??[];bucket.push(child);buckets.set(child.material,bucket);}
 for(const [material,parts]of buckets)if(parts.length>1){const geometries=parts.map(part=>{part.updateMatrix();const geometry=part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone();return geometry.applyMatrix4(part.matrix);});const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!geometry)continue;const combined=new T.Mesh(geometry,material);combined.castShadow=true;combined.receiveShadow=true;parent.add(combined);for(const part of parts){parent.remove(part);part.geometry.dispose();}}
}

const latex=new Map<string,T.MeshPhysicalMaterial>();
export function balloonMaterial(color:string){let m=latex.get(color);if(!m){m=new T.MeshPhysicalMaterial({color,roughness:.16,metalness:0,clearcoat:1,clearcoatRoughness:.08,transparent:true,opacity:.84,depthWrite:false,ior:1.38,specularIntensity:1.25});latex.set(color,m);}return m;}
export function createKart(id:number,trial=false):T.Group {
 const root=new T.Group(),c=COLORS[id],character=CREW[id],dark='#343846',ivory='#fff0cf';root.userData.driverId=id;
 const shade='#'+new T.Color(c).multiplyScalar(.66).getHexString();
 const chassis=group(root,'chassis');
 // Rounded bodywork, cream racing stripe, a low seat and exposed rear engine.
 box(chassis,dark,0,.37,0,1.78,.23,2.5,.09);
 box(chassis,c,0,.63,.08,1.87,.44,2.6,.16);
 box(chassis,c,0,.86,.88,1.67,.38,1.07,.15);
 box(chassis,ivory,0,1.055,.92,.24,.025,.78,.006);
 box(chassis,ivory,0,.51,1.48,1.98,.18,.26,.07);
 box(chassis,'#6b7180',0,.49,-1.4,1.81,.17,.25,.05);
 box(chassis,shade,0,.86,-1.19,1.57,.24,.41,.09);
 box(chassis,dark,0,.92,-.54,1.06,.68,.63,.16);
 box(chassis,'#53576a',0,1.14,-.77,.88,.48,.15,.09);
 box(chassis,'#626a77',0,.77,-1.38,.74,.3,.23,.04);
 for(const x of [-.24,0,.24])box(chassis,'#b1b8ba',x,.95,-1.35,.09,.08,.23,.025);
 for(const x of [-.73,.73]){const exhaust=cylinder(chassis,'#858c96',x,.68,-1.44,.105,.36);exhaust.rotation.x=Math.PI/2;const tip=cylinder(chassis,dark,x,.68,-1.63,.073,.015);tip.rotation.x=Math.PI/2;}
 // Nose badge and little cream lamps make the front recognizable.
 const badge=cylinder(chassis,shade,0,.92,1.432,.17,.03);badge.rotation.x=Math.PI/2;
 box(chassis,ivory,0,.92,1.454,.08,.16,.02,.006);
 for(const x of [-.6,.6])ball(chassis,'#ffe9a9',x,.86,1.4,.15,.09,.045);
 for(const z of [-.87,.91]){
  const axle=cylinder(root,'#747d89',0,.42,z,.065,2.2);axle.rotation.z=Math.PI/2;
  for(const side of [-1,1]){
   const pivot=group(root,z>0?'frontWheel':'rearWheel',side*1.02,.46,z),spin=group(pivot,'wheelSpin');
   const tire=cylinder(spin,'#303440',0,0,0,.46,.37);tire.rotation.z=Math.PI/2;
   const rim=cylinder(spin,'#dedbcf',side*.195,0,0,.29,.025);rim.rotation.z=Math.PI/2;
   const hub=cylinder(spin,c,side*.214,0,0,.18,.04);hub.rotation.z=Math.PI/2;
   const bolt=cylinder(spin,'#777f8a',side*.24,0,0,.065,.025);bolt.rotation.z=Math.PI/2;
  }
 }
 const driver=group(chassis,'driver');
 ball(driver,shade,0,1.19,-.27,.37,.43,.33);
 box(driver,ivory,0,1.24,.024,.34,.4,.035,.01);
 cylinder(driver,c,0,1.56,-.27,.28,.14);
 for(const side of [-1,1]){
  const arm=group(driver,side===1?'rightArm':'leftArm',side*.3,1.4,-.22);limb(arm,shade,new T.Vector3(),new T.Vector3(side*.1,-.27,.64),.115);ball(arm,ivory,side*.09,-.28,.66,.14,.13,.16);
 }
 const wheel=group(chassis,'steeringWheel',0,1.13,.49);wheel.rotation.x=-.58;
 mesh(wheel,new T.TorusGeometry(.36,.055,8,20),dark);
 box(wheel,'#a0a6aa',0,0,0,.55,.045,.04,.01);
 box(wheel,'#a0a6aa',0,-.12,0,.04,.24,.04,.01);
 const head=group(driver,'head',0,2.02,-.3);
 ball(head,character.fur,0,0,0,.54,.49,.47);
 if(id===1)ball(head,dark,0,.015,.37,.46,.24,.14);
 // Team-colored pilot cap; the ears keep each silhouette distinct.
 const cap=mesh(head,new T.SphereGeometry(.56,20,12,0,Math.PI*2,0,Math.PI/2),c,0,.12,-.055);cap.scale.set(1,.78,.94);
 box(head,shade,0,.13,.38,.85,.1,.18,.04);
 if(id===0||id===5){for(const side of [-1,1]){const ear=mesh(head,new T.ConeGeometry(.23,id===0?.55:.4,4),character.fur,side*.4,.49,-.015);ear.rotation.z=-side*.18;const inner=mesh(head,new T.ConeGeometry(.12,id===0?.34:.25,4),'#e3a4a1',side*.4,.51,.11);inner.rotation.z=-side*.18;}}
 else if(id===3){for(const side of [-1,1]){ball(head,character.fur,side*.29,.75,-.05,.16,.51,.14);ball(head,'#e8aeb7',side*.29,.77,.065,.078,.36,.045);}}
 else if(id===6){for(const side of [-1,1]){const ear=ball(head,'#92775e',side*.52,-.03,-.03,.16,.37,.16);ear.rotation.z=side*.24;}}
 else if(id===1||id===7){for(const side of [-1,1]){ball(head,character.fur,side*.43,.39,-.08,.2,.2,.15);ball(head,character.cream,side*.43,.4,.04,.105,.11,.025);}}
 else if(id===4){for(const side of [-1,1])ball(head,character.fur,side*.31,.22,.32,.23,.22,.19);}
 else {box(head,'#ffdf89',0,.5,.03,.21,.15,.19,.07);}
 if(id===2){box(head,'#e9a457',0,-.15,.46,.59,.15,.36,.06);for(const x of [-.11,.11])ball(head,'#af7846',x,-.105,.59,.025);}
 else {ball(head,character.cream,0,-.19,.39,.33,.23,.17);if(id!==4)ball(head,'#49414a',0,-.1,.55,id===0?.09:.085,.065,.055);}
 const eyes=group(head,'eyes');
 const eyeY=id===4?.24:.02,eyeZ=id===4?.47:.443;
 eyes.position.y=eyeY;
 for(const side of [-1,1]){
  ball(eyes,'#fff9e9',side*.205,0,eyeZ,.118,.145,.055);
  ball(eyes,'#333541',side*.19,.003,eyeZ+.051,.059,.088,.025);
  ball(eyes,'#ffffff',side*.19-.018,.04,eyeZ+.072,.022,.025,.01);
  if(id!==2)ball(head,'#e9ac94',side*.36,-.12,.37,.065,.037,.025);
 }
 // A short curved smile, large enough to read on the portrait without visual noise.
 const smileCurve=new T.QuadraticBezierCurve3(new T.Vector3(-.095,-.255,.542),new T.Vector3(0,-.32,.569),new T.Vector3(.095,-.255,.542));
 if(id!==2)mesh(head,new T.TubeGeometry(smileCurve,10,.012,5,false),'#725c55');
 const scarf=group(driver,'scarfTail',0,1.52,-.68);box(scarf,c,0,0,-.22,.2,.07,.52,.025);box(scarf,ivory,0,.002,-.42,.2,.075,.08,.02);
 for(let i=0;i<3;i++){
  const b=group(root,'balloon'+i,(i-1)*.8,2.8+Math.abs(i-1)*.12,-.99);
  ball(b,c,0,0,0,.39,.49,.39).material=balloonMaterial(c);ball(b,'#fff3df',-.12,.2,.3,.05,.11,.025);
  mesh(b,new T.ConeGeometry(.065,.12,8),c,0,-.53,0);
  const anchor=group(chassis,'balloonAnchor'+i,(i-1)*.6,.96,-1.13);
  mesh(anchor,new T.CylinderGeometry(.065,.065,.09,8),'#5d6065',0,-.045,0);
  const line=new T.Line(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(12),3)),new T.LineBasicMaterial({color:'#655c65'}));line.name='tether'+i;line.frustumCulled=false;root.add(line);
 }
 const shield=mesh(root,new T.SphereGeometry(2,16,12),'#a0e6ed',0,1,0);shield.name='shield';shield.material=new T.MeshStandardMaterial({color:'#a0e6ed',transparent:true,opacity:.22,wireframe:true});shield.visible=false;
 batchDetails(root);if(trial){chassis.scale.set(1.035,1,1.025);root.getObjectByName('head')!.scale.setScalar(1.07);for(const pivot of root.children)if(pivot.name==='frontWheel'||pivot.name==='rearWheel'){pivot.position.y=.49;pivot.scale.setScalar(1.065);}applyToon(root,true);root.add(contactShadow());}updateBalloonRig(root,{},0);return root;
}
type Pose=Pick<Kart,'speed'|'steering'|'drift'|'boost'|'vy'> & Partial<Pick<Kart,'balloons'|'yawRate'|'pushX'|'pushZ'|'angle'>>;
type BalloonMotion={x:number;z:number;vx:number;vz:number;previousSpeed:number;previousVy:number};
export function updateBalloonRig(model:T.Group,k:Partial<Pose>,now:number,dt=0){
 const chassis=model.getObjectByName('chassis')!;chassis.updateMatrix();
 const states:BalloonMotion[]=model.userData.balloonMotion??=Array.from({length:3},()=>({x:0,z:0,vx:0,vz:0,previousSpeed:k.speed??0,previousVy:k.vy??0}));
 const speed=k.speed??0,yaw=k.yawRate??(k.steering??0)*Math.min(Math.abs(speed)/12,1)*1.5;
 const acceleration=dt>0?clamp((speed-states[0].previousSpeed)/dt,-40,40):0;
 const verticalImpulse=dt>0?clamp(((k.vy??0)-states[0].previousVy)/dt,-45,45):0;
 const angle=k.angle??0,sidePush=(k.pushX??0)*Math.cos(angle)-(k.pushZ??0)*Math.sin(angle),backPush=(k.pushX??0)*Math.sin(angle)+(k.pushZ??0)*Math.cos(angle);
 for(let i=0;i<3;i++){
  const b=model.getObjectByName('balloon'+i)!,anchor=model.getObjectByName('balloonAnchor'+i)!,line=model.getObjectByName('tether'+i) as T.Line,m=states[i];
  const targetX=clamp(-yaw*speed*.047-sidePush*.065,-1.45,1.45)+Math.sin(now*1.7+i*.9)*.12;
  const targetZ=clamp(-speed*.023-acceleration*.023-backPush*.045,-1.05,.85)+Math.cos(now*1.4+i)*.1;
  // Substeps keep a damped pendulum stable at both high and low frame rates.
  let remaining=Math.min(dt,.1);while(remaining>0){const h=Math.min(remaining,1/120),spring=14+i*1.1;m.vx+=((targetX-m.x)*spring-m.vx*3.5)*h;m.vz+=((targetZ-m.z)*spring-m.vz*3.5)*h;m.x+=m.vx*h;m.z+=m.vz*h;remaining-=h;}
  m.previousSpeed=speed;m.previousVy=k.vy??0;
  const start=anchor.position.clone().applyMatrix4(chassis.matrix),length=1.18+Math.abs(i-1)*.12;
  const offset=new T.Vector3((i-1)*.2+m.x,0,.14+m.z);if(offset.length()>length*.8)offset.setLength(length*.8);const horizontal=offset.x*offset.x+offset.z*offset.z;
  const end=start.clone().add(offset);end.y=start.y+Math.sqrt(length*length-horizontal)+Math.sin(now*2.7+i)*.035-clamp(verticalImpulse*.0015,-.06,.06);
  b.visible=line.visible=i<(k.balloons??3);b.rotation.set(-m.z*.22,0,-m.x*.25);b.updateMatrix();const knot=new T.Vector3(0,-.59,0).applyEuler(b.rotation);b.position.copy(end).sub(knot);b.updateMatrix();
  const p=line.geometry.getAttribute('position') as T.BufferAttribute;for(let j=0;j<4;j++){const t=j/3,v=start.clone().lerp(end,t);v.z-=Math.sin(t*Math.PI)*.055;p.setXYZ(j,v.x,v.y,v.z);}p.needsUpdate=true;
 }
}
export const PERSONALITIES=['The fox salute','Double trouble wave','Victory head-bob','Bunny bounce','Frog wiggle','The cool nod','Happy paw wave','Big bear stretch'];
export function personalityPose(id:number,now:number,victory=false,reduced=false){const profiles=[[1.3,.11,.05,.15],[2.2,.05,.12,.23],[3.1,.18,.03,.06],[3.8,.09,.07,.1],[1.7,.06,.17,.19],[.8,.05,.09,.3],[3.5,.12,.14,.2],[1.05,.13,.045,.08]],p=profiles[id]??profiles[0],t=reduced?0:now*p[0]+id*.7;return {nod:Math.sin(t)*p[1],tilt:Math.cos(t*.8)*p[2],turn:Math.sin(t*.6)*p[3],lift:reduced?0:Math.max(0,Math.sin(t*(id===3?1.8:1)))*(victory?.16:.025),left:victory&&[1,3,4,7].includes(id)?-1.35+Math.sin(t)*.2:0,right:victory?-1.5+Math.sin(t*(id===6?2:1))*.25:0};}
export function animateKart(model:T.Group,k:Pose,dt:number,now:number){
 const victory=!!model.userData.celebrating,personality=personalityPose(model.userData.driverId??0,now,victory,!!model.userData.reduced),idle=Math.abs(k.speed)<2?1:.12;const steering=k.steering??0,chassis=model.getObjectByName('chassis')!,driver=model.getObjectByName('driver')!,head=model.getObjectByName('head')!;
 const accel=clamp((k.speed-(model.userData.previousSpeed??k.speed))/Math.max(dt,.008),-35,35);model.userData.previousSpeed=k.speed;
 const blend=1-Math.exp(-dt*12);
 chassis.rotation.z+=(-steering*Math.min(Math.abs(k.speed)/20,1)*.065-chassis.rotation.z)*blend;
 chassis.rotation.x+=(clamp(accel*.0014-k.vy*.009,-.075,.075)-chassis.rotation.x)*blend;
 chassis.position.y=Math.sin(now*9)*Math.min(Math.abs(k.speed),20)*.0008;
 driver.rotation.z+=(-steering*.1-driver.rotation.z)*blend;head.rotation.y+=(steering*.15-head.rotation.y)*blend;
 head.rotation.x=personality.nod*(victory?1:idle);head.rotation.z=personality.tilt*(victory?1:idle);head.rotation.y+=personality.turn*(victory?1:idle)*blend;driver.position.y=personality.lift*(victory?1:idle);for(const side of ['left','right'] as const){const arm=model.getObjectByName(side+'Arm');if(arm){arm.rotation.set(0,0,0);if(victory&&(side==='right'||personality.left!==0)){const sign=side==='left'?-1:1,rest=new T.Vector3(sign*.09,-.28,.66).normalize(),wave=model.userData.reduced?0:Math.sin(now*(1.5+(model.userData.driverId??0)*.23)+sign);const target=new T.Vector3(sign*.95,.25+wave*.15,.18+Math.cos(now*1.3)*.035).normalize();arm.quaternion.setFromUnitVectors(rest,target);}}}
 const eyes=model.getObjectByName('eyes')!,blink=(now+(model.userData.driverId??0)*.57)%4.7;eyes.scale.y=blink>4.54?Math.max(.06,Math.abs(blink-4.62)/.08):1;
 const counter=k.drift>.03?-(model.userData.driftSide??Math.sign(steering))*.65:0;
 model.getObjectByName('steeringWheel')!.rotation.z=-(steering*.5+counter);model.getObjectByName('scarfTail')!.rotation.x=Math.sin(now*7)*(.07+Math.abs(k.speed)*.006);
 model.traverse(o=>{if(o.name==='frontWheel')o.rotation.y=clamp(steering*.36+counter,-.55,.55);if(o.name==='wheelSpin')o.rotation.x=(o.rotation.x+k.speed*dt/.46)%(Math.PI*2);});
 updateBalloonRig(model,k,now,dt);
}

export class DriverPortrait {
 renderer:T.WebGLRenderer; scene=new T.Scene(); camera=new T.PerspectiveCamera(38,1,.1,40);model:T.Group;host:HTMLElement;celebrating=false;
 constructor(host:HTMLElement,id=0,public trial=false){this.host=host;this.renderer=new T.WebGLRenderer({antialias:true,alpha:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setClearColor('#ede6db',1);this.renderer.outputColorSpace=T.SRGBColorSpace;if(trial){this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;}host.appendChild(this.renderer.domElement);this.scene.add(new T.HemisphereLight('#fff8e8','#8d859b',2));const light=new T.DirectionalLight('#fff2dc',2.7);light.position.set(-4,8,5);this.scene.add(light);const fill=new T.DirectionalLight('#e6edff',1);fill.position.set(5,3,-4);this.scene.add(fill);this.model=createKart(id,this.trial);this.scene.add(this.model);this.camera.position.set(4.4,2.8,6.4);this.camera.lookAt(0,1.65,0);}
 select(id:number){this.renderer.toneMapping=this.trial?T.ACESFilmicToneMapping:T.NoToneMapping;this.scene.remove(this.model);this.model.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){if(!o.userData.sharedGeometry)o.geometry.dispose();if(o.userData.disposeMaterial)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});this.model=createKart(id,this.trial);this.scene.add(this.model);}
 render(dt:number,now:number){const w=this.host.clientWidth,h=this.host.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.model.userData.celebrating=this.celebrating;this.model.userData.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.model.rotation.y=Math.sin(now*.35)*.3;animateKart(this.model,{speed:0,steering:Math.sin(now*.6)*.13,drift:0,boost:0,vy:0},dt,now);this.renderer.render(this.scene,this.camera);}
 dispose(){this.model.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){if(!o.userData.sharedGeometry)o.geometry.dispose();if(o.userData.disposeMaterial)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});this.renderer.dispose();this.renderer.domElement.remove();}
}
