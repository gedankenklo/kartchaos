import {quarryCows,quarryChickens} from './quarryFarm';
import {soccerTeam,teamColor} from './football';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from 'three';
import {ARENAS,type Arena} from './arenas';
import {COLORS,type State} from './sim';
import {createGlow,glowTexture} from './visualPolish';
type Actor={root:T.Group;kind:string;seed:number;radius:number;y:number;speed:number;};
export class ArenaLife extends T.Group {
 actors:Actor[]=[];dust:T.Points[]=[];birds?:T.InstancedMesh;fans?:T.InstancedMesh;fanArms?:T.InstancedMesh;fanHeads?:T.InstancedMesh;cache=new Map<string,T.MeshStandardMaterial>();boards:T.Mesh[]=[];boardCanvas?:HTMLCanvasElement;boardTexture?:T.CanvasTexture;boardSignature='';owned=new Set<T.Material>();dummy=new T.Object3D();
 constructor(public arena:Arena){super();this.name='arenaLife';const info=ARENAS[arena],e=info.extent*info.scale;
  const actor=(kind:string,seed:number,radius:number,y:number,speed:number)=>{const root=new T.Group();root.name=kind;this.add(root);const a={root,kind,seed,radius,y,speed};this.actors.push(a);return root;};
  if(arena==='depot'||arena==='beach'){
   for(let i=0;i<(arena==='depot'?5:5);i++){const ship=actor('sailboat',i*1.31,Math.SQRT2*e+35+(i%3)*22,arena==='beach'?-.1:-1.4,i%2?.014:-.011);this.boat(ship,i,false);}
   if(arena==='depot')this.colossus(actor('harborColossus',3.3,Math.SQRT2*e+93,-2,.009));
   else {for(let i=0;i<3;i++){const ski=actor('jetSki',i*2.1,Math.SQRT2*e+29+i*13,-.15,.055+i*.006);this.box(ski,i%2?'#e58c55':'#69b7c6',0,.45,0,1.5,.7,3.5);this.ellipsoid(ski,'#f5ead4',0,1.15,-.1,.45,.65,.45);const wake=new T.Mesh(new T.ConeGeometry(1.5,7,3),this.mat('#d9ffff',true,.25));wake.rotation.x=Math.PI/2;wake.scale.z=.04;wake.position.set(0,.05,-4);ski.add(wake);}
    for(let i=0;i<3;i++)this.seaCreature(actor('dolphin',i*4.2,Math.SQRT2*e+55+i*15,-1.8,.018),false);
    this.seaCreature(actor('whale',2.8,Math.SQRT2*e+92,-5,.006),true);
   }
  }
  if(arena==='quarry'){
   for(const cow of quarryCows(0)){
    const root=actor('farmCow',cow.id,0,0,0);root.userData.cowId=cow.id;root.scale.set(info.scale,info.height,info.scale);
    this.box(root,'#f2e8d5',0,1.45,0,1.6,1.35,2.5);
    for(let i=0;i<3;i++)this.box(root,'#453d3b',(i%2?-.81:.81),1.5+(i%2)*.25,-.65+i*.6,.05,.7,.75);
    this.box(root,'#f2e8d5',0,2,1.4,1.15,1.1,.9);this.box(root,'#cf9b88',0,1.7,1.92,1,.45,.3);
    for(const side of [-1,1]){this.box(root,'#453d3b',side*.42,2.15,1.87,.12,.14,.08);this.box(root,'#ede1bf',side*.4,2.7,1.35,.18,.4,.18);this.box(root,'#e7c7ae',side*.76,2.27,1.3,.5,.25,.3);
     for(const z of [-.8,.8]){const leg=this.box(root,'#eee2cc',side*.56,.48,z,.35,.95,.35);leg.name='cowLeg';leg.userData.phase=side*z;this.box(leg,'#49413a',0,-.38,0,.38,.2,.38);}}
    this.box(root,'#56453a',0,1.15,-1.48,.15,1.2,.15);
   }
   for(const chicken of quarryChickens(0)){
    const root=actor('farmChicken',chicken.id,0,0,0);root.userData.chickenId=chicken.id;
    this.ellipsoid(root,'#f7edda',0,.65,0,.48,.55,.65);this.ellipsoid(root,'#f7edda',0,1.12,.4,.3,.35,.3);this.box(root,'#d86249',0,1.45,.4,.12,.25,.3);this.box(root,'#e9b34b',0,1.08,.72,.15,.12,.24);
    for(const sign of [-1,1]){this.box(root,'#dfab48',sign*.2,.16,0,.07,.32,.07);const wing=this.box(root,'#dfd1b6',sign*.48,.7,0,.15,.5,.65);wing.name='chickenWing';wing.userData.side=sign;}
   }
   // Barns, silos and pasture fences remain beyond the collision boundary.
   for(const sign of [-1,1]){
    const barn=new T.Group();barn.position.set(sign*(e+30),0,sign*55);barn.rotation.y=-sign*.3;this.add(barn);
    this.box(barn,'#9c5546',0,7,0,26,14,20);this.box(barn,'#e5cf9b',0,5,10.08,9,10,.15);this.box(barn,'#725b47',0,4.5,10.2,7,9,.15);
    for(const side of [-1,1]){const roof=this.box(barn,'#58665d',side*7,16,0,16,1,24);roof.rotation.z=-side*.48;this.box(barn,'#f2dcad',side*11,7,10.15,.5,14,.2);}
    const silo=new T.Mesh(new T.CylinderGeometry(5,5,21,12),this.mat('#a7aba0'));silo.position.set(sign*(e+42),10.5,sign*15);this.add(silo);const cap=new T.Mesh(new T.ConeGeometry(5.5,5,12),this.mat('#6f7c77'));cap.position.copy(silo.position).y=23.5;this.add(cap);
    for(let i=0;i<13;i++){const x=-e-10+i*(e*2+20)/12,z=sign*(e+12);this.box(this,'#a38e66',x,2,z,.65,4,.65);if(i<12)for(const y of [1.3,2.8])this.box(this,'#d6bb85',x+(e*2+20)/24,y,z,(e*2+20)/12,.35,.3);}
   }

   for(let i=0;i<3;i++){const positions=new Float32Array(150*3);const material=new T.PointsMaterial({map:glowTexture(),color:'#b28e64',size:1.7,transparent:true,opacity:.36,depthWrite:false});this.owned.add(material);const points=new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(positions,3)),material);points.name='dustDevil';points.position.set(Math.sin(i*2.1+.5)*(e+55),0,Math.cos(i*2.1+.5)*(e+55));points.frustumCulled=false;this.dust.push(points);this.add(points);}
   for(let i=0;i<5;i++){const weed=actor('tumbleweed',i*1.7,Math.SQRT2*e+12+i%2*13,-1.5*info.height+1.7,.018);const material=new T.MeshStandardMaterial({color:'#a5875a',wireframe:true});this.owned.add(material);weed.add(new T.Mesh(new T.IcosahedronGeometry(1.7,1),material));for(let ring=0;ring<3;ring++){const twig=new T.Mesh(new T.TorusGeometry(1.45,.07,4,14),this.mat('#b99e6a'));twig.rotation.set(ring,ring*1.3,ring*.4);weed.add(twig);}}
  }
  if(arena==='castle'){
   for(let i=0;i<4;i++){const beast=actor('skyBeast',i*1.8,e+25+i*16,35+i*8,.018);this.ellipsoid(beast,'#655776',0,0,0,1.8,1.3,4);this.ellipsoid(beast,'#786887',0,.4,3.6,.9,.8,1.5);for(const side of [-1,1]){const wing=new T.Group();wing.name='wing';wing.position.set(side*1.1,0,0);wing.userData.side=side;const geometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([0,0,2,side*9,0,-2,side*3,0,-4],3));geometry.computeVertexNormals();const membrane=new T.Mesh(geometry,this.mat('#766280'));(membrane.material as T.MeshStandardMaterial).side=T.DoubleSide;wing.add(membrane);beast.add(wing);}}
   for(const sx of [-1,1])for(const sz of [-1,1]){const ghost=actor('towerGhost',(sx+1)*2+(sz+1),0,21,0);ghost.userData.anchor=new T.Vector3(sx*46*info.scale,21,sz*44*info.scale);this.ellipsoid(ghost,'#c2ece0',0,1,0,1,1.6,.8,true);const skirt=new T.Mesh(new T.ConeGeometry(1.15,2.5,8,1,true),this.mat('#b9e5d9',true,.65));skirt.rotation.z=Math.PI;skirt.position.y=-.1;ghost.add(skirt);for(const side of [-1,1])this.ellipsoid(ghost,'#3b465b',side*.3,1.25,.73,.13,.22,.07);}
  }
  if(arena==='sky')for(let i=0;i<4;i++){const airship=actor('airship',i*1.6,e+50+i*20,18+i*5,.008);this.ellipsoid(airship,i%2?'#bca8ca':'#d9c99c',0,4,0,4,4,11);this.box(airship,'#655a60',0,-1,0,3,2,6);this.box(airship,'#a0cfda',0,-.7,3.04,2.2,.6,.1);for(const side of [-1,1]){this.box(airship,'#8a7e87',side*4,0,-4,.2,5,1);const prop=new T.Group();prop.name='propeller';prop.position.set(side*4,-1,-4);this.box(prop,'#efdfbb',0,0,0,.18,3,.2);this.box(prop,'#efdfbb',0,0,0,3,.18,.2);airship.add(prop);}}
  if(arena==='neon')for(let i=0;i<6;i++){const ship=actor('spaceShip',i*1.1,e+70+i%3*25,30+i*6,.022);this.ellipsoid(ship,i%2?'#8d95be':'#b7c6cc',0,0,0,5,.8,3);this.ellipsoid(ship,'#83cfdd',0,.9,.3,1.8,.9,1.6);const glow=createGlow('#8fe8ff',8,.5);glow.position.set(0,-.3,-3);ship.add(glow);this.owned.add(glow.material);}
  if(arena==='fortress'){
   const geometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([-1.4,0,-.3,0,.2,.6,-.2,0,-.4,1.4,0,-.3,.2,0,-.4,0,.2,.6],3));geometry.computeVertexNormals();this.birds=new T.InstancedMesh(geometry,this.mat('#596c70'),40);this.birds.name='fortressBirdFlock';this.birds.frustumCulled=false;this.add(this.birds);
  }
  if(arena==='yard'){
   this.fans=new T.InstancedMesh(new T.CapsuleGeometry(.55,1.2,3,5),this.mat('#ffffff'),32);this.fans.name='yardAudience';this.fanHeads=new T.InstancedMesh(new T.IcosahedronGeometry(.38,0),this.mat('#e8c6a4'),32);this.fanHeads.frustumCulled=false;this.add(this.fanHeads);this.fanArms=new T.InstancedMesh(new T.CapsuleGeometry(.14,.9,3,4),this.mat('#f1cfaa'),64);this.fans.frustumCulled=this.fanArms.frustumCulled=false;this.add(this.fans,this.fanArms);
   for(let i=0;i<32;i++)this.fans.setColorAt(i,new T.Color(COLORS[i%8]));for(let sign of [-1,1])this.box(this,'#917258',sign*(e+8),1.2,0,5,2.4,e*1.7);
  }
  if(arena==='stadium'&&typeof document!=='undefined'){
   this.boardCanvas=document.createElement('canvas');this.boardCanvas.width=1024;this.boardCanvas.height=512;this.boardTexture=new T.CanvasTexture(this.boardCanvas);this.boardTexture.colorSpace=T.SRGBColorSpace;this.boardTexture.anisotropy=4;
   const screenMaterial=new T.MeshBasicMaterial({map:this.boardTexture,toneMapped:false});this.owned.add(screenMaterial);for(const sign of [-1,1]){const frame=new T.Group();frame.position.set(sign*75,42,sign*(e+57));frame.rotation.y=sign>0?Math.PI:0;this.box(frame,'#26364c',0,0,-.8,67,29,2);const screen=new T.Mesh(new T.PlaneGeometry(64,26),screenMaterial);screen.position.z=.3;screen.name='stadiumSurvivorScoreboard';frame.add(screen);this.boards.push(screen);for(const x of [-25,25])this.box(frame,'#344860',x,-18,-.8,1.4,10,1.4);this.add(frame);}
  }
  this.batch(this);this.traverse(object=>{object.raycast=()=>{};});this.update(0,false);
 }
 batch(root:T.Group){for(const child of root.children)if(child instanceof T.Group)this.batch(child);const buckets=new Map<T.Material,T.Mesh[]>();for(const child of root.children)if(child instanceof T.Mesh&&!(child instanceof T.InstancedMesh)&&!child.name&&!Array.isArray(child.material)){const parts=buckets.get(child.material)??[];parts.push(child);buckets.set(child.material,parts);}for(const [material,parts] of buckets)if(parts.length>1){const geometries=parts.map(part=>{part.updateMatrix();return part.geometry.clone().applyMatrix4(part.matrix);}),geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!geometry)continue;for(const part of parts){part.removeFromParent();part.geometry.dispose();}root.add(new T.Mesh(geometry,material));}}
 mat(color:string,transparent=false,opacity=1){const key=color+transparent+opacity,existing=this.cache.get(key);if(existing)return existing;const material=new T.MeshStandardMaterial({color,flatShading:true,roughness:.8,transparent,opacity,depthWrite:!transparent});this.owned.add(material);this.cache.set(key,material);return material;}
 box(parent:T.Object3D,color:string,x:number,y:number,z:number,w:number,h:number,d:number){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),this.mat(color));mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 ellipsoid(parent:T.Object3D,color:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,ghost=false){const mesh=new T.Mesh(new T.IcosahedronGeometry(1,1),this.mat(color,ghost,ghost?.68:1));mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;}
 boat(parent:T.Group,index:number,large:boolean){const factor=large?2:1;this.box(parent,index%2?'#779aa3':'#bd8c68',0,.5,0,4*factor,2*factor,11*factor);this.box(parent,'#e8dfc5',0,2*factor,-1,3*factor,1.5*factor,6*factor);if(large){this.box(parent,'#f0e4c8',0,4,-4,4,4,7);this.box(parent,'#77a9bf',0,4.2,.1,3.5,1.2,.1);for(let i=0;i<5;i++)this.box(parent,['#866d8e','#c29e65','#6a98a3'][i%3],i%2?1.8:-1.8,3,-6+i*3,3,2,2.5);}else{this.box(parent,'#8d7665',0,7,0,.18,12,.18);const geo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([.3,12,0,.3,2.2,0,4.8,2.2,0],3));geo.computeVertexNormals();const sail=new T.Mesh(geo,this.mat('#efe4c8'));(sail.material as T.MeshStandardMaterial).side=T.DoubleSide;parent.add(sail);}}
 colossus(root:T.Group){this.ellipsoid(root,'#526f68',0,16,0,8,13,6);this.ellipsoid(root,'#607e72',0,30,2,5,6,5);this.box(root,'#6d8979',0,28.5,7,6,3,6);for(const side of [-1,1]){const leg=new T.Group();leg.name='monsterLeg';leg.userData.side=side;leg.position.set(side*4,8,0);this.box(leg,'#45635d',0,-3,0,4.5,11,5);this.box(leg,'#45635d',0,-8,3,5,2,8);root.add(leg);this.box(root,'#5d796d',side*8,18,3,3,9,3);this.ellipsoid(root,'#f0d288',side*2,31.5,6.2,.65,.6,.3);}for(let i=0;i<7;i++){const spike=new T.Mesh(new T.ConeGeometry(2.2,6,3),this.mat('#91a58e'));spike.position.set(0,9+i*3,-5);spike.rotation.x=-.8;root.add(spike);}const tail=this.ellipsoid(root,'#4d6d63',0,7,-14,4,3,14);tail.rotation.x=-.2;}
 seaCreature(root:T.Group,whale:boolean){const size=whale?4:1;this.ellipsoid(root,whale?'#526e83':'#77a7b7',0,0,0,1.1*size,.8*size,3.4*size);const fin=new T.Mesh(new T.ConeGeometry(.8*size,1.8*size,3),this.mat('#567e94'));fin.position.set(0,.9*size,-.5*size);root.add(fin);for(const side of [-1,1]){const tail=this.ellipsoid(root,'#5c8195',side*.9*size,0,-3*size,1.4*size,.18*size,.75*size);tail.rotation.y=-side*.3;}}
 update(now:number,reduced=false,state?:State){const time=reduced?0:now,e=ARENAS[this.arena].extent*ARENAS[this.arena].scale,farmTime=state?.config.arena==='quarry'?state.tick/60:time,cows=this.arena==='quarry'?quarryCows(farmTime):[],chickens=this.arena==='quarry'?quarryChickens(farmTime,state?.config.arena==='quarry'?state.karts:[]):[];
  for(const [actorIndex,actor] of this.actors.entries()){const allowed=!reduced||actorIndex<2||actor.kind==='harborColossus'||actor.kind==='towerGhost'||actor.kind==='farmCow'||actor.kind==='farmChicken';actor.root.visible=allowed;const a=actor.seed+time*actor.speed,root=actor.root;root.position.set(Math.sin(a)*actor.radius,actor.y+Math.sin(time*.8+actor.seed)*.3,Math.cos(a)*actor.radius);root.rotation.y=a+(actor.speed>=0?Math.PI/2:-Math.PI/2);
   if(actor.kind==='farmChicken'){const t=farmTime,c=chickens[root.userData.chickenId];root.position.set(c.x,c.y,c.z);root.rotation.y=c.angle;root.children.filter(o=>o.name==='chickenWing').forEach(w=>w.rotation.z=c.running?Math.sin(t*24)*.7*w.userData.side:0);}
   if(actor.kind==='farmCow'){const cow=cows[root.userData.cowId],info=ARENAS.quarry;root.position.set(cow.x*info.scale,0,cow.z*info.scale);root.rotation.y=cow.angle;root.children.filter(c=>c.name==='cowLeg').forEach(leg=>leg.rotation.x=Math.sin((state?.config.arena==='quarry'?state.tick/60:time)*2.5+leg.userData.phase)*.2);}
   if(actor.kind==='towerGhost'){const orbit=time*.24+actor.seed,radius=5+Math.sin(actor.seed)*.6;root.position.copy(root.userData.anchor);root.position.x+=Math.cos(orbit)*radius;root.position.z+=Math.sin(orbit)*radius;root.position.y+=Math.sin(time*1.1+actor.seed)*1.2;root.rotation.y=-orbit;root.rotation.z=reduced?0:Math.sin(orbit)*.12;}
   if(actor.kind==='harborColossus'){root.position.y=actor.y+Math.sin(time*1.3)*.45;root.children.filter(child=>child.name==='monsterLeg').forEach(leg=>leg.rotation.x=Math.sin(time*1.3+leg.userData.side*Math.PI/2)*.22);root.rotation.z=Math.sin(time*1.3)*.025;}
   if(actor.kind==='skyBeast')root.children.filter(child=>child.name==='wing').forEach(wing=>wing.rotation.z=Math.sin(time*1.6+actor.seed)*.32*wing.userData.side);
   if(actor.kind==='tumbleweed'){root.rotation.x=time*1.3+actor.seed;root.rotation.z=time*.8;root.position.y=actor.y+Math.abs(Math.sin(time*2+actor.seed))*.45;}
   if(actor.kind==='dolphin'||actor.kind==='whale'){const period=actor.kind==='whale'?30:14,duration=actor.kind==='whale'?7:3,phase=(time+actor.seed*3)%period;root.visible=allowed&&(reduced||phase<duration);const jump=Math.sin(Math.min(1,phase/duration)*Math.PI);root.position.y=actor.y+jump*(actor.kind==='whale'?7:5);root.rotation.x=Math.cos(phase/duration*Math.PI)*.6;}
   root.traverse(child=>{if(child.name==='propeller')child.rotation.z=time*8;});
  }
  this.dust.forEach((devil,index)=>{devil.visible=!reduced;const p=devil.geometry.getAttribute('position') as T.BufferAttribute;for(let i=0;i<p.count;i++){const t=(i/p.count+time*.04)%1,angle=i*.71+time*2;const radius=1+t*5;p.setXYZ(i,Math.sin(angle)*radius,t*24,Math.cos(angle)*radius);}p.needsUpdate=true;devil.rotation.y=time*.1;});
  if(this.birds){this.birds.count=reduced?16:40;for(let i=0;i<40;i++){const a=time*.018+i%2*2.1,r=e+45;this.dummy.position.set(Math.sin(a)*r+Math.sin(i*2.4)*16,23+i%7+Math.sin(time*2+i)*.35,Math.cos(a)*r+Math.cos(i*2.4)*16);this.dummy.rotation.set(Math.sin(time*4+i)*.18,a+Math.PI/2,0);this.dummy.scale.setScalar(.8+i%3*.15);this.dummy.updateMatrix();this.birds.setMatrixAt(i,this.dummy.matrix);}this.birds.instanceMatrix.needsUpdate=true;}
  if(this.fans&&this.fanArms){this.fans.count=this.fanHeads!.count=reduced?16:32;this.fanArms.count=reduced?32:64;for(let i=0;i<32;i++){const side=i%2?1:-1,z=-e*.78+Math.floor(i/2)/15*e*1.56,y=3.5+(reduced?0:Math.max(0,Math.sin(time*2+i))*.2);this.dummy.position.set(side*(e+8),y,z);this.dummy.rotation.set(0,side>0?-Math.PI/2:Math.PI/2,0);this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();this.fans.setMatrixAt(i,this.dummy.matrix);this.dummy.position.y=y+1.3;this.dummy.updateMatrix();this.fanHeads!.setMatrixAt(i,this.dummy.matrix);for(let arm=0;arm<2;arm++){this.dummy.position.set(side*(e+8)-side*.55,y+.7+(i%3===0?.6:0),z+(arm?-1:1)*(.2+Math.abs(Math.sin(time*3+i))*.45));this.dummy.rotation.z=(arm?-1:1)*(.65+Math.sin(time*3+i)*.5);this.dummy.updateMatrix();this.fanArms.setMatrixAt(i*2+arm,this.dummy.matrix);}}this.fans.instanceMatrix.needsUpdate=this.fanArms.instanceMatrix.needsUpdate=this.fanHeads!.instanceMatrix.needsUpdate=true;}
  if(state)this.updateBoards(state);
 }
 updateBoards(state:State){if(!this.boardCanvas||!this.boardTexture)return;const signature=String(state.config.soccer)+'|'+state.karts.map(k=>k.team+':'+k.balloons).join(',')+'|'+(state.ball?.goals.join(':')??'');if(signature===this.boardSignature)return;this.boardSignature=signature;const ctx=this.boardCanvas.getContext('2d')!;ctx.fillStyle='#101e32';ctx.fillRect(0,0,1024,512);ctx.fillStyle='#fff1bb';ctx.textAlign='center';ctx.font='bold 55px sans-serif';ctx.fillText(state.config.soccer?'TEAM BALLOON BATTLE':'SURVIVORS '+state.karts.filter(k=>k.balloons>0).length+' / '+state.karts.length,512,73);ctx.font='bold 27px sans-serif';ctx.fillStyle='#95c7dc';ctx.fillText('BLUE '+(state.ball?.goals[0]??0)+'  :  '+(state.ball?.goals[1]??0)+' ORANGE',512,120);state.karts.forEach((k,i)=>{const x=24+i%4*250,y=153+Math.floor(i/4)*159;ctx.fillStyle=k.balloons?'#263c51':'#302d3b';ctx.fillRect(x,y,232,140);ctx.fillStyle=state.config.soccer?teamColor(k):k.balloons?COLORS[k.driver]:'#9b8993';ctx.font='bold 26px sans-serif';ctx.fillText((k.id+1)+'. '+k.name,x+116,y+49);ctx.font='bold 29px sans-serif';ctx.fillText(state.config.soccer?(k.balloons?soccerTeam(k).toUpperCase():'ELIMINATED'):k.balloons?'●'.repeat(k.balloons):'ELIMINATED',x+116,y+102);});this.boardTexture.needsUpdate=true;}
 dispose(){const geometries=new Set<T.BufferGeometry>();this.traverse(object=>{if(object instanceof T.Mesh||object instanceof T.Points)geometries.add(object.geometry);});geometries.forEach(geometry=>geometry.dispose());this.owned.forEach(material=>material.dispose());this.boardTexture?.dispose();this.removeFromParent();}
}





