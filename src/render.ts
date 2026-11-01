import {extraFloor,globeMesh,ExtraArenaScenery} from './extraArenaVisuals';
import {globePosition,globeQuaternion,globeFrame,advanceGlobe,globeHeight} from './globe';
import {FlagScene} from './flagScene';
import {HeldItemDisplay} from './heldItems';
import {NEON_RIM_SHAPE} from './neonRim';
import {createTeamMarker} from './teamMarker';
import {NewArenaSet,createNewArenaFloor} from './newArenaVisuals';
import {isNewArena} from './newArenaRules';
import {fortressTreePosition} from './sceneryLayout';
import {lightingFor,lightSettings,type Lighting} from './lighting';
import {placeNeonRimMarker} from './neonScenery';
import {createDangerWall} from './dangerWall';
import {teamColor,soccerTeam} from './football';
import {eventShake} from './celebrations';
import {ArenaLife} from './arenaLife';
import {ArenaAtmosphere} from './visualPolish';
import {ChaosDirector} from './broadcast';
import {previewDepthRange} from './previewCamera';
import {createStadiumFloor,createBoardwalkMaterial} from './floorPaint';
import {ArenaDetails,createFootballVisual} from './arenaDetails';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {animateItemVisual,createItemVisual} from './itemsVisual';
import {exposedLedges,type Deck} from './ledges';
import {applyToon,toonMaterial,itemBoxMaterial} from './toon';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {BattleEffects,boxGrowScale,eliminationPose,ELIMINATION_TIME} from './effects';
import {surfaceMaterial,type Surface} from './surfaces';
import {Landscape} from './landscape';
import * as T from 'three';
import {COLORS, ground, ceiling, layoutObstacles, ARENA_SCALE, ARENA_HEIGHT, arenaExtent, dangerRadius, angleDiff, watchedKart, cycleSpectator, clamp, type State, type Arena} from './sim';
import {FORT,FORT_RAMPS,FORT_BRIDGES,SKY_TILES,neonHeight,type Ramp} from './terrain';
import {createKart,animateKart} from './characters';
import {ARENAS,isExpansion,EXPANSIONS,LAVA_PITS,lavaAt} from './arenas';
const mat=(color:string,extra={})=>new T.MeshStandardMaterial({color,roughness:.85,flatShading:true,...extra});
const materials=new Map<string,T.MeshStandardMaterial>();
function material(c:string){if(!materials.has(c))materials.set(c,mat(c));return materials.get(c)!;}
export class World {
 extraScenery?:ExtraArenaScenery;
 flagScene?:FlagScene;
 newSet?:NewArenaSet;
 lighting:Lighting='day';
 impactShakes=new Map<number,{until:number;duration:number;strength:number}>();spectatorTargets=new Map<number,number>();
 eliminations=new Map<number,{age:number;x:number;y:number;z:number;angle:number}>();
 previewBounds=new T.Box3();details?:ArenaDetails;ballModel?:T.Group;
 life?:ArenaLife;atmosphere?:ArenaAtmosphere;flair:'full'|'reduced'='full';fill!:T.DirectionalLight;
 artTrial=true;sun!:T.DirectionalLight;hemi!:T.HemisphereLight;
 battleEffects=new BattleEffects();
 landscape?:Landscape;
 skidMarks:{mesh:T.Mesh;life:number}[]=[];
 cameraRay=new T.Raycaster();cameraTerrain=new T.Group();
 director=new ChaosDirector();broadcastMode:'camera'|'map'='camera';broadcastCamera=new T.PerspectiveCamera(55,1,.5,2400);
 renderer:T.WebGLRenderer; scene=new T.Scene(); arenaGroup=new T.Group(); kartGroup=new T.Group(); fx=new T.Group(); cameras:T.PerspectiveCamera[]=[]; demoCamera=new T.PerspectiveCamera(37,1,.1,350); map:Arena='fortress'; models=new Map<number,T.Group>(); boxes:T.Group[]=[]; shots=new Map<number,T.Group>(); particles:{mesh:T.Mesh;life:number;v:T.Vector3}[]=[]; lastEvent=0; distance=10; reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 constructor(canvas:HTMLCanvasElement){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.setClearColor('#f5f1e8');
  const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(this.renderer);this.scene.environment=pmrem.fromScene(room,.04).texture;this.scene.environmentIntensity=.65;room.dispose();pmrem.dispose();
  this.scene.background=new T.Color('#f5f1e8');this.scene.fog=new T.Fog('#f5f1e8',500,950);
  try{if(localStorage.getItem('kc-art-version')!=='2'){localStorage.setItem('kc-art-version','2');localStorage.setItem('kc-art-trial','true');}this.artTrial=localStorage.getItem('kc-art-trial')!=='false';}catch{}
  this.fill=new T.DirectionalLight('#b8d9ec',.45);this.fill.position.set(80,45,-65);this.scene.add(this.fill);this.hemi=new T.HemisphereLight('#fff8e4','#8383a0',2.4);this.scene.add(this.hemi);const sun=new T.DirectionalLight('#fff0d1',3);sun.position.set(-70,130,75);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-120;sun.shadow.camera.right=120;sun.shadow.camera.top=120;sun.shadow.camera.bottom=-120;sun.shadow.normalBias=.15;sun.shadow.bias=-.0002;this.sun=sun;this.scene.add(sun);
  this.battleEffects.reduced=this.reduced;this.scene.add(this.arenaGroup,this.kartGroup,this.fx,this.battleEffects);this.build('fortress');
 }
 textured(color:string,kind:Surface,extra:T.MeshStandardMaterialParameters={}){const key=kind+color+JSON.stringify(extra);let m=materials.get(key);if(!m){m=surfaceMaterial(color,kind,extra);materials.set(key,m);}return m;}
 mesh(geo:T.BufferGeometry,color:string,parent:T.Object3D,x=0,y=0,z=0):T.Mesh{const m=new T.Mesh(geo,material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 cube(parent:T.Object3D,c:string,x:number,y:number,z:number,w:number,h:number,d:number){return this.mesh(new T.BoxGeometry(w,h,d),c,parent,x,y,z);}
 cylinder(parent:T.Object3D,c:string,x:number,y:number,z:number,r:number,h:number,n=10){return this.mesh(new T.CylinderGeometry(r,r,h,n),c,parent,x,y,z);}
 road(parent:T.Object3D,color:string,x:number,y:number,z:number,width:number,depth:number){const m=this.mesh(new T.PlaneGeometry(width,depth),color,parent,x,y,z);m.rotation.x=-Math.PI/2;m.castShadow=false;m.material=this.textured(color,this.map==='quarry'||this.map==='beach'?'sand':this.map==='depot'?'metal':this.map==='yard'?'stone':this.map==='sky'?'stone':'grass');return m;}
 ramp(parent:T.Object3D,r:Ramp,color:string){
  const point=(along:number,cross:number,y:number)=>r.axis==='x'?[along,y,cross]:[cross,y,along];
  const a=point(r.from,r.cross-r.width/2,r.bottom),b=point(r.to,r.cross-r.width/2,r.top),c=point(r.to,r.cross+r.width/2,r.top),d=point(r.from,r.cross+r.width/2,r.bottom);
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));geometry.computeVertexNormals();const m=this.mesh(geometry,color,parent);m.material=this.textured(color,this.map==='depot'?'wood':'stone',{side:T.DoubleSide});m.castShadow=false;
  // Solid side walls follow the same incline as the simulation.
  const side=new T.BufferGeometry();const b0=[b[0],r.bottom,b[2]],c0=[c[0],r.bottom,c[2]];side.setAttribute('position',new T.Float32BufferAttribute([...a,...b0,...b,...d,...c,...c0],3));side.computeVertexNormals();const sm=this.mesh(side,'#b7a28c',parent);sm.material=this.textured('#b7a28c','stone',{side:T.DoubleSide});
 }
 build(arena:Arena){
  this.newSet?.dispose();this.newSet=isNewArena(arena)?new NewArenaSet(arena):undefined;if(this.newSet){this.newSet.scale.set(ARENA_SCALE[arena],ARENA_HEIGHT[arena],ARENA_SCALE[arena]);this.scene.add(this.newSet);}
  this.life?.dispose();this.life=new ArenaLife(arena);this.scene.add(this.life);
  this.atmosphere?.dispose();this.atmosphere=new ArenaAtmosphere(arena);this.scene.add(this.atmosphere);
  this.landscape?.dispose();this.landscape=new Landscape(arena,this.artTrial,this.lighting);this.scene.add(this.landscape);
  this.extraScenery?.dispose();this.extraScenery=undefined;if(['starfall','glacier','crypt','starcore'].includes(arena)){this.extraScenery=new ExtraArenaScenery(arena);this.scene.add(this.extraScenery);}
  this.details=undefined;this.battleEffects.clearBursts();this.map=arena;this.disposeGroup(this.arenaGroup);this.boxes=[];
  const g=new T.Group();g.scale.set(ARENA_SCALE[arena],ARENA_HEIGHT[arena],ARENA_SCALE[arena]);this.arenaGroup.add(g);this.cameraTerrain=g;
  if(arena==='starcore'){g.add(globeMesh());}
  else if(arena==='fortress'){
   this.cube(g,'#b3b892',0,-2.2,0,FORT.extent*2+2,4,FORT.extent*2+2);
   for(let x=-FORT.extent+4;x<FORT.extent;x+=8)for(let z=-FORT.extent+4;z<FORT.extent;z+=8)this.road(g,(x+z)%16===0?'#c4ce98':'#b6c38a',x,0,z,8,8);
   const blockColors=['#df9d89','#9e91c0','#89b3ba','#d4bd7f'];let index=0;
   for(const sx of [-1,1])for(const sz of [-1,1]){
    const color=blockColors[index++],x=sx*FORT.center,z=sz*FORT.center;
    this.cube(g,color,x,FORT.lower/2,z,FORT.half*2,FORT.lower,FORT.half*2).material=this.textured(color,'stone');
    const upper=this.cube(g,color,sx*FORT.upperCenter,(FORT.upper+FORT.lower)/2,sz*FORT.upperCenter,FORT.upperHalf*2,FORT.upper-FORT.lower,FORT.upperHalf*2);upper.receiveShadow=true;upper.material=this.textured(color,'stone');
    // Thin, raised stripes mark deck edges without coplanar roof overlays.
    for(const side of [-1,1]){this.cube(g,'#f1dfbb',x,FORT.lower-.6,z+side*(FORT.half+.012),FORT.half*2,.35,.025);this.cube(g,'#f1dfbb',x+side*(FORT.half+.012),FORT.lower-.6,z,.025,.35,FORT.half*2);}
    this.cylinder(g,'#796868',sx*(FORT.upperCenter+1),FORT.upper+2,sz*(FORT.upperCenter+1),.09,4,8);
    const flag=this.cube(g,color,sx*(FORT.upperCenter+1)+1,FORT.upper+3.3,sz*(FORT.upperCenter+1),2,1.3,.08);flag.rotation.z=-.08;
   }
   for(const ramp of FORT_RAMPS)this.ramp(g,ramp,'#e6cfaa');
   for(const b of FORT_BRIDGES){this.cube(g,'#debf98',b.x,b.y-b.thickness/2,b.z,b.width,b.thickness,b.depth).material=this.textured('#debf98','wood');}
   for(const s of [-1,1]){this.cube(g,'#d8b58f',s*(FORT.extent-.5),1,0,1.5,2,FORT.extent*2);this.cube(g,'#d8b58f',0,1,s*(FORT.extent-.5),FORT.extent*2,2,1.5);}
   this.cylinder(g,'#e9d5aa',0,.07,0,5.5,.12,32);this.cylinder(g,'#9073b9',0,.16,0,3.8,.1,6);this.cylinder(g,'#e9d5aa',0,.23,0,2.8,.1,6);
  } else if(arena==='sky'){
   for(const tile of SKY_TILES){const body=this.cube(g,'#b1a3d3',tile.x,-1.1,tile.z,tile.width,2,tile.depth);body.castShadow=false;this.road(g,tile.color,tile.x,0,tile.z,tile.width,tile.depth);}
   for(const [x,z]of [[0,25],[0,-25],[25,0],[-25,0]])this.cylinder(g,'#9982bd',x,-4,z,5,3,5);
   for(let i=0;i<20;i++){const a=i*2.4,r=48+i%3*12;const cloud=new T.Group();g.add(cloud);for(let j=0;j<3;j++)this.mesh(new T.IcosahedronGeometry(4+j,1),'#fffaff',cloud,Math.sin(a)*r+j*4,-8-i%5,Math.cos(a)*r);}
  } else if(isExpansion(arena)){
   const layout=EXPANSIONS[arena],e=ARENAS[arena].extent,cell=e/5;
   if(arena==='starfall'||arena==='glacier'||arena==='crypt'){g.add(extraFloor(arena,e));}
   else if(arena==='castle'){const xs=[-e,e,...LAVA_PITS.flatMap(p=>[p.x-p.width/2,p.x+p.width/2])].sort((a,b)=>a-b),zs=[-e,e,...LAVA_PITS.flatMap(p=>[p.z-p.depth/2,p.z+p.depth/2])].sort((a,b)=>a-b);for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){const w=xs[i+1]-xs[i],d=zs[j+1]-zs[j],x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2;if(w>0&&d>0&&!lavaAt(x,z)){this.cube(g,layout.wall,x,-1.2,z,w,2,d).castShadow=false;this.road(g,layout.floor,x,0,z,w,d);}}}
   else if(arena==='depot'){for(const sign of [-1,1]){this.cube(g,layout.wall,sign*(e+7)/2,-1.2,0,e-7,2,e*2).castShadow=false;this.road(g,layout.floor,sign*(e+7)/2,0,0,e-7,e*2);}const water=this.road(g,'#589ea8',0,-3,0,14,e*2);water.material=new T.MeshStandardMaterial({color:'#589ea8',roughness:.24,metalness:.25});}
   else{if(arena!=='ruins'){const foundation=this.cube(g,layout.wall,0,-2.2,0,e*2+2,4,e*2+2);foundation.castShadow=false;}if(isNewArena(arena))g.add(createNewArenaFloor(arena));else if(arena==='stadium')g.add(createStadiumFloor(this.artTrial));else for(let ix=0;ix<10;ix++)for(let iz=0;iz<10;iz++)this.road(g,(ix+iz)%2?layout.floor:layout.alternate,-e+(ix+.5)*cell,0,-e+(iz+.5)*cell,cell,cell);}
   for(const b of layout.blocks){const blockMesh=this.cube(g,b.color,b.x,b.height/2,b.z,b.width,b.height,b.depth);blockMesh.material=this.textured(b.color,arena==='yard'||arena==='harbour'?'wood':arena==='depot'||arena==='foundry'?'metal':'stone');if(arena==='beach'&&b.driveable&&!this.artTrial){const base=blockMesh.material as T.Material,top=createBoardwalkMaterial(false);blockMesh.material=[base,base,top,base,base,base];blockMesh.userData.ownedMaterials=[top];}
    for(const side of [-1,1]){
     this.cube(g,arena==='yard'?'#e5d5ad':'#e9d4ae',b.x,b.height*.7,b.z+side*(b.depth/2+.025),b.width,.25,.04);
     if(arena==='quarry')this.cube(g,'#9e725f',b.x,b.height*.35,b.z+side*(b.depth/2+.025),b.width,.28,.04);
     if(arena==='yard')for(const offset of [-.3,.3])this.cube(g,'#6d777a',b.x+offset*b.width,b.height/2,b.z+side*(b.depth/2+.05),.18,b.height,.08);
    }
   }
   for(const ramp of layout.ramps)this.ramp(g,ramp,arena==='castle'?'#8b8193':arena==='depot'?'#e7c6a0':'#e8c79c');
   if(arena!=='starfall')for(const sign of [-1,1]){this.cube(g,layout.wall,sign*(e-.5),arena==='beach'?.1:.85,0,1.5,arena==='beach'?.2:1.7,e*2);this.cube(g,layout.wall,0,arena==='beach'?.1:.85,sign*(e-.5),e*2,arena==='beach'?.2:1.7,1.5);}

  } else {
   const foundation=this.cylinder(g,'#594870',0,-1.1,0,37,1.8,96);foundation.castShadow=false;
   // A single radial surface: no stacked disks, intersecting cones or duplicate caps.
   const geometry=new T.BufferGeometry(),vertices:number[]=[],colors:number[]=[];
   const radii=[0,9,17,29,37],bandColors=['#c9e0d1','#b8d6cd','#aaa3b4','#9076b4'];
   for(let band=0;band<4;band++)for(let i=0;i<96;i++){
    const a=i*Math.PI/48,b=(i+1)*Math.PI/48,r0=radii[band],r1=radii[band+1];
    const point=(r:number,t:number)=>[Math.sin(t)*r,neonHeight(r),Math.cos(t)*r];
    const v=band===0?[...point(0,0),...point(r1,a),...point(r1,b)]:[...point(r0,a),...point(r1,a),...point(r1,b),...point(r0,a),...point(r1,b),...point(r0,b)];
    vertices.push(...v);const color=new T.Color(bandColors[band]);for(let n=0;n<v.length/3;n++)colors.push(color.r,color.g,color.b);
   }
   geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();const surface=this.mesh(geometry,'#ffffff',g);surface.material=this.textured('#ffffff','metal',{vertexColors:true});surface.castShadow=false;
   for(let i=0;i<NEON_RIM_SHAPE.count;i++)placeNeonRimMarker(this.cube(g,i%2?'#ed9269':'#bba3e1',0,0,0,NEON_RIM_SHAPE.width,NEON_RIM_SHAPE.height,NEON_RIM_SHAPE.depth),i);
  }
  for(const o of arena==='castle'||arena==='beach'?[]:layoutObstacles(arena)){this.cylinder(g,arena==='neon'?'#e5ac84':'#927da8',o.x,.8,o.z,o.r,1.6,8);this.cylinder(g,'#e4cfb1',o.x,1.7,o.z,o.r+.15,.3,8);}
  // Decorative landscape below the island.
  for(let i=0;i<18;i++){const a=i*2.399,r=(isExpansion(arena)?ARENAS[arena].extent+10:47)+i%4*3;const {x,z}=arena==='fortress'?fortressTreePosition(i):{x:Math.sin(a)*r,z:Math.cos(a)*r};if(arena==='yard'){this.cube(g,'#9a8875',x,.5,z,1,4,1);this.cube(g,'#e8be6f',x,2.8,z,1.2,.6,1.2);}else if(arena==='depot'){this.cylinder(g,'#879b9d',x,-.5,z,.7,2,8);}else if(arena==='quarry'){this.cylinder(g,'#8fa17e',x,.5,z,.5,4,7);this.cube(g,'#8fa17e',x+.8,.5,z,1.5,.65,.65);this.cylinder(g,'#8fa17e',x+1.3,1.3,z,.32,1.8,7);}else if(!['starfall','glacier','crypt','starcore'].includes(arena)&&!isNewArena(arena)&&arena!=='neon'&&arena!=='sky'&&arena!=='castle'&&arena!=='beach'&&arena!=='stadium'){this.cylinder(g,'#a39079',x,0,z,.35,3,6);this.mesh(new T.ConeGeometry(2.6,6,6),i%2?'#91a97c':'#718e72',g,x,4,z);}}
  if(arena==='castle'||arena==='beach'||arena==='stadium'||arena==='depot'){this.details=new ArenaDetails(arena);g.add(this.details);}
  if(this.artTrial){if(arena==='fortress')this.styleFortress(g);else this.styleArena(g,arena);applyToon(this.landscape!);}
  if(!this.artTrial){
   if(isExpansion(arena))this.markLedges(g,EXPANSIONS[arena].blocks.filter(b=>b.driveable).map(b=>({...b,y:b.height})),EXPANSIONS[arena].ramps);
   else if(arena==='sky')this.markLedges(g,SKY_TILES.map(tile=>({...tile,y:0})));
   else if(arena==='fortress'){const decks:Deck[]=[];for(const sx of [-1,1])for(const sz of [-1,1]){decks.push({x:sx*FORT.center,z:sz*FORT.center,width:FORT.half*2,depth:FORT.half*2,y:FORT.lower});decks.push({x:sx*FORT.upperCenter,z:sz*FORT.upperCenter,width:FORT.upperHalf*2,depth:FORT.upperHalf*2,y:FORT.upper});}this.markLedges(g,[...decks,...FORT_BRIDGES],FORT_RAMPS);}
   else if(arena==='neon'){const edge=this.mesh(new T.TorusGeometry(36.8,.07,5,96),'#e8d8ac',g,0,neonHeight(36.8)+.08,0);edge.rotation.x=-Math.PI/2;edge.castShadow=false;}
  }
  const shadowExtent=Math.max(90,arenaExtent(arena)+16);Object.assign(this.sun.shadow.camera,{left:-shadowExtent,right:shadowExtent,top:shadowExtent,bottom:-shadowExtent});this.sun.shadow.camera.updateProjectionMatrix();
  g.updateMatrixWorld(true);this.previewBounds.setFromObject(this.arenaGroup).expandByScalar(8);if(this.newSet){this.newSet.updateMatrixWorld(true);this.newSet.traverse(o=>{if(o instanceof T.Mesh&&!(o instanceof T.InstancedMesh)&&o.name!=='harbourAurora'){o.geometry.computeBoundingBox();if(o.geometry.boundingBox)this.previewBounds.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));}});}
 }
 deckMaterials(color:string,topLight=.2){const c=new T.Color(color),top=c.clone().lerp(new T.Color('#fff1cf'),topLight),side=c.clone().multiplyScalar(.88),bottom=c.clone().multiplyScalar(.65);return [toonMaterial(side),toonMaterial(side),toonMaterial(top),toonMaterial(bottom),toonMaterial(c),toonMaterial(c)];}
 markLedges(g:T.Group,decks:Deck[],ramps:Ramp[]=[]){
  const ink=new T.MeshBasicMaterial({color:'#405269'}),paint=new T.MeshBasicMaterial({color:'#f6e4b9',polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,depthWrite:false});ink.userData.sharedEdge=true;paint.userData.sharedEdge=true;
  const lips:T.Mesh[]=[],lines:T.Mesh[]=[];
  // These are low painted caps, not collision rails. All traversable joins stay open.
  for(const e of exposedLedges(decks,ramps)){const mid=(e.from+e.to)/2,length=e.to-e.from;
   const lip=this.cube(g,'#f6e4b9',e.axis==='x'?mid:e.cross+e.inward*.21,e.y+.035,e.axis==='z'?mid:e.cross+e.inward*.21,e.axis==='x'?length:.34,.06,e.axis==='z'?length:.34);
   const line=this.cube(g,'#405269',e.axis==='x'?mid:e.cross+e.inward*.02,e.y-.12,e.axis==='z'?mid:e.cross+e.inward*.02,e.axis==='x'?length:.055,.17,e.axis==='z'?length:.055);
   lip.material=paint;line.material=ink;lips.push(lip);lines.push(line);lip.castShadow=line.castShadow=false;lip.receiveShadow=line.receiveShadow=false;
  }
  for(const [parts,material] of [[lips,paint],[lines,ink]] as [T.Mesh[],T.Material][]){if(!parts.length)continue;const geometries=parts.map(p=>{p.updateMatrix();return p.geometry.clone().applyMatrix4(p.matrix);}),geometry=mergeGeometries(geometries)!;geometries.forEach(g=>g.dispose());for(const part of parts){part.removeFromParent();part.geometry.dispose();}const merged=new T.Mesh(geometry,material);merged.renderOrder=material===paint?2:0;g.add(merged);}
  // Material ownership is on the group, avoiding repeated disposal for every segment.
  g.userData.edgeMaterials=[ink,paint];
 }
 styleArena(g:T.Group,arena:Arena){
  const ramps=isExpansion(arena)?EXPANSIONS[arena].ramps:[];
  if(isExpansion(arena)){
   if(arena!=='stadium'&&arena!=='depot'&&arena!=='starfall'&&arena!=='glacier'&&arena!=='crypt'&&!isNewArena(arena)){
   for(const o of [...g.children])if(o instanceof T.Mesh&&o.geometry.type==='PlaneGeometry'&&o.position.y===0){g.remove(o);o.geometry.dispose();}
   const e=ARENAS[arena].extent,base=arena==='yard'?'#d4c4a4':arena==='castle'?'#535163':arena==='beach'?'#d9c099':'#d6b687',v:number[]=[],colors:number[]=[];
   for(let x=-e;x<e;x+=2)for(let z=-e;z<e;z+=2){if(arena==='castle'&&lavaAt(x+1,z+1))continue;const color=new T.Color(base);if(Math.abs(x+1)<5||Math.abs(z+1)<5)color.lerp(new T.Color('#f1e3bb'),.18);else if(Math.floor((x+e)/12)%2)color.multiplyScalar(.97);v.push(x,.02,z,x+2,.02,z+2,x+2,.02,z,x,.02,z,x,.02,z+2,x+2,.02,z+2);for(let n=0;n<6;n++)colors.push(color.r,color.g,color.b);}
   const geo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3)).setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const m=toonMaterial('#ffffff',new T.Color(0),0,T.FrontSide,true),floor=new T.Mesh(geo,m);floor.receiveShadow=true;g.add(floor);
   }
   for(const b of EXPANSIONS[arena].blocks){const mesh=g.children.find(o=>o instanceof T.Mesh&&o.position.x===b.x&&o.position.z===b.z&&Math.abs(o.position.y-b.height/2)<.01) as T.Mesh|undefined;if(mesh){mesh.geometry.dispose();mesh.geometry=new RoundedBoxGeometry(b.width,b.height,b.depth,2,.2);mesh.material=this.deckMaterials(b.color,.24);if(arena==='beach'&&b.driveable){const top=createBoardwalkMaterial(true);mesh.material[2]=top;mesh.userData.ownedMaterials=[top];}}}
   this.markLedges(g,EXPANSIONS[arena].blocks.filter(b=>b.driveable).map(b=>({...b,y:b.height})),ramps);
  }else if(arena==='sky'){
   const palette=['#c9dbe1','#93acbd','#93acbd','#93acbd','#93acbd','#c8bedf','#b7ccbe','#d8c3ad','#aebed6'];
   let index=0;for(const o of g.children)if(o instanceof T.Mesh&&o.geometry.type==='PlaneGeometry'&&o.position.y===0)o.material=toonMaterial(palette[index++%palette.length]);
   this.markLedges(g,SKY_TILES.map(t=>({...t,y:0})));
  }else if(arena==='neon'){
   for(const r of [9,17,29,36.8])for(let lane=0;lane<2;lane++){
    const verts:number[]=[],inner=r-.16+lane*.14,outer=inner+.14;for(let i=0;i<96;i++){const a=i*Math.PI/48,b=(i+1)*Math.PI/48,point=(rad:number,t:number)=>[Math.sin(t)*rad,neonHeight(rad)+.045,Math.cos(t)*rad];verts.push(...point(inner,a),...point(outer,a),...point(outer,b),...point(inner,a),...point(outer,b),...point(inner,b));}
    const geo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(verts,3));const mat=new T.MeshBasicMaterial({color:lane?'#f3dfbc':'#554f75',side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),ring=new T.Mesh(geo,mat);ring.userData.disposeMaterial=true;g.add(ring);
   }
  }
  if(ramps.length)this.markRampMouths(g,ramps);
  applyToon(g);
 }
 markRampMouths(g:T.Group,ramps:Ramp[]){const mouthPaint=new T.MeshBasicMaterial({color:'#4f7379',polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,depthWrite:false}),edgePaint=new T.MeshBasicMaterial({color:'#f4e4bd',polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,depthWrite:false});g.userData.ownedMaterials=[...(g.userData.ownedMaterials??[]),mouthPaint,edgePaint];for(const r of ramps){
  for(const [along,y] of [[r.from,r.bottom],[r.to,r.top]]){const stripe=this.cube(g,'#4f7379',r.axis==='x'?along:r.cross,y+.025,r.axis==='z'?along:r.cross,r.axis==='x'?.16:r.width-.4,.035,r.axis==='z'?.16:r.width-.4);stripe.material=mouthPaint;stripe.renderOrder=3;stripe.castShadow=false;stripe.receiveShadow=false;}
  for(const side of [-1,1]){const cross=r.cross+side*(r.width/2-.2),along=(r.from+r.to)/2,length=Math.hypot(r.to-r.from,r.top-r.bottom),strip=this.cube(g,'#f4e4bd',r.axis==='x'?along:cross,(r.top+r.bottom)/2+.04,r.axis==='z'?along:cross,r.axis==='x'?length:.23,.065,r.axis==='z'?length:.23);if(r.axis==='x')strip.rotation.z=Math.atan2(r.top-r.bottom,r.to-r.from);else strip.rotation.x=-Math.atan2(r.top-r.bottom,r.to-r.from);strip.material=edgePaint;strip.renderOrder=3;strip.castShadow=false;}
 }}
 setArtTrial(enabled:boolean){if(this.artTrial===enabled)return;this.artTrial=enabled;for(const model of this.models.values())this.disposeGroup(model);this.models.clear();this.kartGroup.clear();this.build(this.map);}
 styleFortress(g:T.Group){
  // Remove the repetitive floor tiles; their replacement stays below physics height tolerance.
  for(const o of [...g.children])if(o instanceof T.Mesh&&o.geometry.type==='PlaneGeometry'&&o.position.y===0){g.remove(o);o.geometry.dispose();}
  for(const o of [...g.children])if(o instanceof T.Mesh&&o.geometry.type==='CylinderGeometry'&&o.position.x===0&&o.position.z===0&&o.position.y<.3){g.remove(o);o.geometry.dispose();}
  const positions:number[]=[],colorsFloor:number[]=[];
  for(let x=-FORT.extent+1;x<FORT.extent;x+=2)for(let z=-FORT.extent+1;z<FORT.extent;z+=2){const path=Math.abs(x)<=5||Math.abs(z)<=5||(Math.abs(x)>=FORT.center+FORT.half+5&&Math.abs(x)<=FORT.extent-3)||(Math.abs(z)>=FORT.center+FORT.half+5&&Math.abs(z)<=FORT.extent-3),color=new T.Color(path?'#ddd1ae':Math.floor((x+48)/8)%2?'#9cbd85':'#95b77f');positions.push(x-1,.02,z-1,x+1,.02,z+1,x+1,.02,z-1,x-1,.02,z-1,x-1,.02,z+1,x+1,.02,z+1);for(let i=0;i<6;i++)colorsFloor.push(color.r,color.g,color.b);}
  const floorGeo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(positions,3)).setAttribute('color',new T.Float32BufferAttribute(colorsFloor,3));floorGeo.computeVertexNormals();const floorMat=toonMaterial('#ffffff').clone();floorMat.vertexColors=true;const floor=new T.Mesh(floorGeo,floorMat);floor.receiveShadow=true;floor.userData.disposeMaterial=true;g.add(floor);
  const colors=['#de906a','#718fb5','#72aaa1','#d6b15e'];
  for(const o of [...g.children])if(o instanceof T.Mesh&&o.geometry.type==='BoxGeometry'){
   const geo=o.geometry as T.BoxGeometry,p=geo.parameters;
   if(p.width>=10&&p.depth>=10&&o.position.y>2){const sx=o.position.x<0?0:2,sz=o.position.z<0?0:1,color=colors[sx+sz];o.material=this.deckMaterials(color,o.position.y>FORT.lower?.34:.15);o.geometry=new RoundedBoxGeometry(p.width,p.height,p.depth,2,.28);geo.dispose();}
  }
  // Edge caps and broad ramp borders read clearly from a moving chase camera.
  for(const sign of [-1,1])for(const half of [-1,1]){
   const a=this.cube(g,'#efe0ba',sign*6,.075,half*21,.16,.11,30),b=this.cube(g,'#efe0ba',half*21,.075,sign*6,30,.11,.16);a.receiveShadow=b.receiveShadow=false;
  }
  const badge=document.createElement('canvas');badge.width=badge.height=512;const ctx=badge.getContext('2d')!;ctx.translate(256,256);ctx.fillStyle='#dc986f';ctx.beginPath();ctx.arc(0,0,247,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0dfb7';ctx.beginPath();ctx.arc(0,0,229,0,Math.PI*2);ctx.fill();ctx.fillStyle='#496e80';ctx.beginPath();ctx.arc(0,0,205,0,Math.PI*2);ctx.fill();ctx.rotate(-.1);ctx.fillStyle='#f8ebc9';ctx.font='900 280px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('K',0,12);const badgeMap=new T.CanvasTexture(badge);badgeMap.colorSpace=T.SRGBColorSpace;badgeMap.anisotropy=4;const badgeMat=new T.MeshBasicMaterial({map:badgeMap,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});const crest=new T.Mesh(new T.PlaneGeometry(11,11),badgeMat);crest.rotation.x=-Math.PI/2;crest.position.y=.04;crest.userData.disposeMaterial=true;crest.userData.disposeTexture=true;g.add(crest);
  const decks:Deck[]=[];for(const sx of [-1,1])for(const sz of [-1,1])decks.push({x:sx*FORT.center,z:sz*FORT.center,width:FORT.half*2,depth:FORT.half*2,y:FORT.lower},{x:sx*FORT.upperCenter,z:sz*FORT.upperCenter,width:FORT.upperHalf*2,depth:FORT.upperHalf*2,y:FORT.upper});
  decks.push(...FORT_BRIDGES.map(b=>({x:b.x,z:b.z,width:b.width,depth:b.depth,y:b.y})));this.markLedges(g,decks,FORT_RAMPS);this.markRampMouths(g,FORT_RAMPS);
  applyToon(g);
 }
 disposeGroup(group:T.Group){group.traverse(o=>{if(o instanceof T.Sprite)o.material.dispose();if(o.userData.ownedMaterials){for(const material of o.userData.ownedMaterials){material.map?.dispose();material.dispose();}delete o.userData.ownedMaterials;}if(o.userData.edgeMaterials){for(const m of o.userData.edgeMaterials)m.dispose();o.userData.edgeMaterials=undefined;}if(o instanceof T.Mesh||o instanceof T.Line){if(!o.userData.sharedGeometry)o.geometry.dispose();if(o.userData.disposeMaterial)for(const m of Array.isArray(o.material)?o.material:[o.material]){if(o.userData.disposeTexture)(m as T.MeshBasicMaterial).map?.dispose();m.dispose();}}});group.clear();}
 kart(id:number,driver=id){const g=createKart(driver,this.artTrial);this.kartGroup.add(g);this.models.set(id,g);return g;}
 globeObjects(){return [...this.models.values(),...this.boxes,...this.fx.children,...this.battleEffects.children];}
 restoreGlobe(){for(const o of this.globeObjects()){const pose=o.userData.flatGlobePose as {position:T.Vector3;quaternion:T.Quaternion}|undefined;if(pose){o.position.copy(pose.position);o.quaternion.copy(pose.quaternion);delete o.userData.flatGlobePose;}}}
 projectGlobe(){for(const o of this.globeObjects()){o.userData.flatGlobePose={position:o.position.clone(),quaternion:o.quaternion.clone()};const point={x:o.position.x,z:o.position.z};o.position.copy(globePosition(point,o.position.y));o.quaternion.premultiply(globeQuaternion(point));}}
 sync(s:State,dt:number,now:number,localIds?:number[]){this.restoreGlobe();if(s.ctf){if(!this.flagScene){this.flagScene=new FlagScene();this.fx.add(this.flagScene);}this.flagScene.visible=true;this.flagScene.update(s,now,this.reduced);}else if(this.flagScene)this.flagScene.visible=false;this.battleEffects.reduced=this.reduced||this.flair==='reduced';
  const lighting=lightingFor(s.config.arena,s.lighting);if(s.config.arena!==this.map||lighting!==this.lighting){this.lighting=lighting;this.build(s.config.arena);this.boxes=[];}
  for(const [id,m] of this.models)if(!s.karts.some(k=>k.id===id&&(k.driver??k.id)===m.userData.driverId)){this.disposeGroup(m);this.kartGroup.remove(m);this.models.delete(id);}
  for(const e of s.events)if(e.id>this.lastEvent){if(e.type==='shockwave'||e.type==='hit'&&e.cause==='mine')for(const kart of s.karts){const shake=eventShake(e,kart);if(shake)this.impactShakes.set(kart.id,{...shake,until:now+shake.duration});}if(e.type==='eliminated')this.eliminations.set(e.player,{age:0,x:e.x,y:e.y,z:e.z,angle:s.karts[e.player]?.angle??0});const model=this.models.get(e.player);if(model&&(e.type==='hit'||e.type==='pickup'||e.type==='itemready')){model.userData.emoteUntil=now+.55;model.userData.emoteKind=e.type==='hit'?'hit':'pickup';}if(e.type==='hit'&&!e.blocked&&e.source!==e.player){const source=this.models.get(e.source!);if(source){source.userData.emoteUntil=now+.5;source.userData.emoteKind='confirmed';}}}
  for(const k of s.karts){const m=this.models.get(k.id)??this.kart(k.id,k.driver??k.id);m.userData.celebrating=s.phase==='finished'&&(s.winningTeam?soccerTeam(k)===s.winningTeam:s.winner===k.id);m.userData.reduced=this.reduced;let held=m.getObjectByName('heldItemDisplay') as HeldItemDisplay|undefined;if(!held){held=new HeldItemDisplay(this.artTrial);m.add(held);}held.update(k,now,this.reduced||this.flair==='reduced',s.phase!=='finished',dt);if(k.balloons>0)this.eliminations.delete(k.id);let teamMarker=m.getObjectByName('soccerTeamMarker') as T.Mesh|undefined;if((s.ball&&s.config.soccer||s.ctf)&&!teamMarker){teamMarker=createTeamMarker(teamColor(k));m.add(teamMarker);}if(teamMarker)(teamMarker.material as T.MeshBasicMaterial).color.set(teamColor(k));if(teamMarker)teamMarker.visible=!!((s.ball&&s.config.soccer||s.ctf));const elimination=this.eliminations.get(k.id);if(elimination&&k.balloons===0){elimination.age+=dt;const pose=eliminationPose(elimination.age,this.reduced);m.visible=pose.visible;m.position.set(elimination.x,elimination.y+pose.rise,elimination.z);m.rotation.set(pose.tilt,elimination.angle+pose.spin,pose.tilt);m.scale.setScalar(pose.scale);animateKart(m,{...k,speed:0,steering:0,drift:0},dt,now);m.getObjectByName('shield')!.visible=false;continue;}m.scale.setScalar(1);m.visible=k.balloons>0&&(k.inv<=0||Math.floor(now*14)%2===0);if(s.config.arena!=='starcore'&&localIds&&!localIds.includes(k.id)&&m.position.distanceTo(new T.Vector3(k.x,k.y,k.z))<12){m.position.lerp(new T.Vector3(k.x,k.y,k.z),1-Math.exp(-dt*14));m.rotation.y+=angleDiff(k.angle,m.rotation.y)*(1-Math.exp(-dt*14));}else{m.position.set(k.x,k.y,k.z);m.rotation.y=k.angle;}
   const forward=Math.sin(k.angle),along=Math.cos(k.angle),slope=ground(s.config.arena,k.x+forward,k.z+along,k.y)-ground(s.config.arena,k.x-forward,k.z-along,k.y);
   const grounded=k.y<ground(s.config.arena,k.x,k.z,k.y)+.2,pitch=grounded&&Math.abs(slope)<2?-Math.atan2(slope,2):0;m.rotation.x+=(pitch-m.rotation.x)*(1-Math.exp(-dt*12));m.rotation.z=0;m.userData.driftSide=k.driftSide;m.userData.grounded=grounded;
   const nearby=s.karts.filter(other=>other.id!==k.id&&other.balloons>0&&Math.abs(other.y-k.y)<3&&Math.hypot(other.x-k.x,other.z-k.z)<14).sort((a,b)=>Math.hypot(a.x-k.x,a.z-k.z)-Math.hypot(b.x-k.x,b.z-k.z))[0];m.userData.lookYaw=nearby?clamp(angleDiff(Math.atan2(nearby.x-k.x,nearby.z-k.z),k.angle),-.4,.4):0;animateKart(m,k,dt,now);
   const floor=ground(s.config.arena,k.x,k.z,k.y),gap=Math.max(0,k.y-floor),contact=m.getObjectByName('contactShadow') as T.Mesh;contact.visible=floor> -10&&gap<8&&Math.abs(slope)<.5;if(teamMarker){teamMarker.position.y=floor-k.y+.085;teamMarker.rotation.x=-Math.PI/2-m.rotation.x;teamMarker.visible=!!((s.ball&&s.config.soccer||s.ctf)&&floor> -10&&gap<8);}contact.position.y=floor-k.y+.055;contact.rotation.x=-Math.PI/2-m.rotation.x;contact.scale.setScalar(Math.max(.5,1-gap*.06));(contact.material as T.MeshBasicMaterial).opacity=.68/(1+gap*.22);
   for(const name of ['driftGlowLeft','driftGlowRight']){const glow=m.getObjectByName(name) as T.Sprite|undefined;if(glow){glow.visible=this.flair==='full'&&!this.reduced&&k.drift>1&&grounded;glow.material.opacity=.24+Math.sin(now*9)*.04;}}
   m.getObjectByName('shield')!.visible=k.shield>0;
   if((k.boost>0||k.drift>.1)&&Math.random()<.55&&!this.reduced)this.particle(k.x-forward*1.1,k.y+.2,k.z-along*1.1,k.boost>0?'#f5ae47':k.drift>1?'#5ecce4':'#d8c8a6',.22);
   if(k.driftSide&&grounded&&Math.abs(slope)<.2){const last=m.userData.skid as {x:number;z:number;t:number}|undefined;if(last&&now-last.t>.11){const dx=k.x-last.x,dz=k.z-last.z,len=Math.hypot(dx,dz);if(len>.15&&len<5){for(const side of [-1,1]){const ox=Math.cos(k.angle)*side*.82-forward*.9,oz=-Math.sin(k.angle)*side*.82-along*.9,px=-dz/len*.065,pz=dx/len*.065,y=k.y+.045;const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([last.x+ox+px,y,last.z+oz+pz,k.x+ox+px,y,k.z+oz+pz,k.x+ox-px,y,k.z+oz-pz,last.x+ox+px,y,last.z+oz+pz,k.x+ox-px,y,k.z+oz-pz,last.x+ox-px,y,last.z+oz-pz],3));const mesh=new T.Mesh(geometry,new T.MeshBasicMaterial({color:'#655d59',transparent:true,opacity:.25,depthWrite:false,side:T.DoubleSide}));this.fx.add(mesh);this.skidMarks.push({mesh,life:4});}}m.userData.skid={x:k.x,z:k.z,t:now};}else if(!last)m.userData.skid={x:k.x,z:k.z,t:now};}else delete m.userData.skid;
  }
  if(this.boxes.length!==s.boxes.length){for(const b of this.boxes){this.arenaGroup.remove(b);this.disposeGroup(b);}this.boxes=s.boxes.map(b=>{const g=createItemVisual();g.position.set(b.x,b.y+1.4,b.z);this.arenaGroup.add(g);return g;});}
  s.boxes.forEach((b,i)=>{const scale=boxGrowScale(b.respawn),model=this.boxes[i];model.visible=scale>0;animateItemVisual(model,this.reduced?0:now,i);const glow=model.getObjectByName('itemGlow');if(glow)glow.visible=this.flair==='full';model.scale.setScalar(scale);const halo=model.getObjectByName('growHalo') as T.Mesh;halo.visible=b.respawn>0&&scale>0;(halo.material as T.MeshBasicMaterial).opacity=clamp(b.respawn/.65,0,1)*.9;this.boxes[i].rotation.y=now*.8;this.boxes[i].position.y=b.y+1.6+Math.sin(now*2+i)*.25;});
  for(const [id,m]of this.shots)if(!s.shots.some(p=>p.id===id)){this.fx.remove(m);this.disposeGroup(m);this.shots.delete(id);}
  for(const p of s.shots){let m=this.shots.get(p.id);if(!m){m=new T.Group();if(p.kind==='bolt'){
    const pod=new T.Group();pod.name='podSpin';m.add(pod);const body=this.mesh(new T.SphereGeometry(.66,12,8),'#62b883',pod);body.scale.y=.62;body.material=mat('#62b883',{roughness:.28,metalness:.12});const rim=this.mesh(new T.TorusGeometry(.6,.12,6,20),'#f4dda4',pod);rim.rotation.x=Math.PI/2;this.cylinder(pod,'#345b58',0,-.2,0,.44,.2,10);
    for(let i=0;i<6;i++){const a=i*Math.PI/3,plate=this.mesh(new T.BoxGeometry(.065,.07,.65),'#315f53',pod,Math.sin(a)*.29,.33,Math.cos(a)*.29);plate.rotation.y=a;plate.rotation.x=.28;}
   }else this.mesh(p.kind==='mine'?new T.ConeGeometry(.9,.5,8):new T.IcosahedronGeometry(.45,0),p.kind==='seeker'?'#a173d5':'#ed8e46',m);this.fx.add(m);this.shots.set(p.id,m);}m.position.set(p.x,p.y,p.z);m.rotation.y=p.angle;if(p.kind==='mine'){const arming=(p.age??0)<.65;m.scale.setScalar(arming?.7+Math.sin(now*24)*.1:1+Math.sin(now*4)*.045);m.rotation.y=now*.5;}const pod=m.getObjectByName('podSpin');if(pod)pod.rotation.y=now*15;if(p.kind!=='mine'&&!this.reduced&&Math.random()<.35)this.particle(p.x,p.y,p.z,p.kind==='bolt'?'#b6e6a5':'#ffcb67',.14);}
  for(const e of s.events)if(e.id>this.lastEvent){this.battleEffects.spawn(e);if(e.type==='shockwave'&&!this.reduced)for(let i=0;i<28;i++)this.particle(e.x,e.y+1,e.z,i%2?'#b785ec':'#a5eeff',.18+Math.random()*.18);if(e.type==='hit'||e.type==='fire'||e.type==='bump'||e.type==='crash'||e.type==='ricochet'){for(let i=0;i<(e.type==='hit'?18:8);i++)this.particle(e.x,e.y+1,e.z,e.type==='hit'?COLORS[s.karts[e.player]?.driver??e.player]:e.type==='ricochet'?'#a7edc3':'#f8dd78',.15+Math.random()*.2);}this.lastEvent=Math.max(this.lastEvent,e.id);}
  this.extraScenery?.update(now,this.reduced||this.flair==='reduced');this.newSet?.update(now,this.reduced||this.flair==='reduced',this.lighting);this.life?.update(now,this.reduced||this.flair==='reduced',s);this.atmosphere?.update(now,this.reduced||this.flair==='reduced');this.battleEffects.update(dt);this.landscape?.update(dt,now,this.reduced);this.details?.update(now,this.reduced);if(s.ball){if(!this.ballModel){this.ballModel=createFootballVisual();this.fx.add(this.ballModel);}const b=s.ball,m=this.ballModel;const target=new T.Vector3(b.x,b.y,b.z);if(m.visible&&b.respawn<=0&&m.position.distanceTo(target)<15)m.position.lerp(target,1-Math.exp(-dt*18));else m.position.copy(target);m.visible=b.respawn<=0;m.getObjectByName('ballSpin')!.rotation.set(b.spin*.8,0,b.spin*.3);m.getObjectByName('ballShadow')!.position.y=.035-b.y;}else if(this.ballModel){this.disposeGroup(this.ballModel);this.ballModel.removeFromParent();this.ballModel=undefined;}
  for(const p of this.particles){p.life-=dt;p.mesh.position.addScaledVector(p.v,dt);p.v.y-=8*dt;p.mesh.scale.setScalar(Math.max(.01,p.life));}this.particles=this.particles.filter(p=>{if(p.life<=0){this.fx.remove(p.mesh);p.mesh.geometry.dispose();return false;}return true;});
  for(const mark of this.skidMarks){mark.life-=dt;(mark.mesh.material as T.MeshBasicMaterial).opacity=Math.max(0,mark.life/4*.25);}while(this.skidMarks.length&&(this.skidMarks[0].life<=0||this.skidMarks.length>160)){const mark=this.skidMarks.shift()!;this.fx.remove(mark.mesh);mark.mesh.geometry.dispose();(mark.mesh.material as T.Material).dispose();}
  let danger=this.arenaGroup.getObjectByName('danger') as T.Group|undefined;
  if(!danger){danger=new T.Group();danger.name='danger';const ring=new T.Mesh(new T.TorusGeometry(1,.002,5,96),new T.MeshBasicMaterial({color:'#ff8d54'}));ring.userData.disposeMaterial=true;ring.rotation.x=Math.PI/2;ring.position.y=.4;const wall=createDangerWall();danger.add(ring,wall);this.arenaGroup.add(danger);}
  danger.visible=s.config.arena!=='starcore'&&s.time<=45&&s.phase==='playing';const radius=dangerRadius(s);danger.children[0].scale.setScalar(radius);danger.children[1].scale.set(radius,1,radius);if(s.config.arena==='starcore'){let fence=this.arenaGroup.getObjectByName('globeDanger') as T.Mesh|undefined;if(!fence){fence=new T.Mesh(new T.BufferGeometry(),new T.MeshBasicMaterial({color:'#ff9c6a',transparent:true,opacity:.24,side:T.DoubleSide,depthWrite:false}));fence.name='globeDanger';fence.userData.disposeMaterial=true;this.arenaGroup.add(fence);}fence.visible=s.time<=45&&s.phase==='playing';if(fence.visible){const vertices:number[]=[];for(let i=0;i<96;i++){const point=(j:number,top:boolean)=>{const a=j/96*Math.PI*2,p=advanceGlobe({x:0,z:0},Math.sin(a)*radius,Math.cos(a)*radius);return globePosition(p,globeHeight(p.x,p.z)+(top?10:.3)).toArray();};vertices.push(...point(i,false),...point(i,true),...point(i+1,true),...point(i,false),...point(i+1,true),...point(i+1,false));}fence.geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));fence.geometry.computeBoundingSphere();}this.projectGlobe();}
 }
 particle(x:number,y:number,z:number,c:string,size:number){if(this.particles.length>250)return;const mesh=this.mesh(new T.BoxGeometry(size,size,size),c,this.fx,x,y,z);this.particles.push({mesh,life:.5+Math.random()*.5,v:new T.Vector3((Math.random()-.5)*8,Math.random()*7,(Math.random()-.5)*8)});}
 resize(){const w=innerWidth,h=innerHeight;if(this.renderer.domElement.width!==Math.floor(w*this.renderer.getPixelRatio())||this.renderer.domElement.height!==Math.floor(h*this.renderer.getPixelRatio()))this.renderer.setSize(w,h,false);}
 watched(s:State,id:number){return watchedKart(s,id,this.spectatorTargets.get(id));}
 cycleSpectator(s:State,id:number,direction:number){if(s.karts[id]?.balloons>0)return;const next=cycleSpectator(s,id,this.spectatorTargets.get(id),direction);if(next!==undefined)this.spectatorTargets.set(id,next);this.eliminations.delete(id);}
 viewKart(s:State,id:number){const out=this.eliminations.get(id),own=s.karts[id];return out&&out.age<ELIMINATION_TIME&&own?.balloons===0?{...own,x:out.x,y:out.y,z:out.z,angle:out.angle,speed:0,boost:0,driftSlip:0}:this.watched(s,id);}
 render(s:State,localIds:number[],playing:boolean,rect:DOMRect|undefined,now:number,dt:number,vertical:boolean){
  this.renderer.shadowMap.needsUpdate=true;
  const trial=this.artTrial,mode=lightingFor(s.config.arena,s.lighting),lights=lightSettings(mode,trial);if(mode==='night'&&s.config.arena==='castle')Object.assign(lights,{sun:1.25,hemi:.62,fill:.22,environment:.4,sunColor:'#c9d6f2'});this.sun.intensity=lights.sun;this.hemi.intensity=lights.hemi;this.fill.intensity=lights.fill;this.scene.environmentIntensity=lights.environment;this.hemi.color.set(lights.skyColor);this.hemi.groundColor.set(lights.groundColor);this.sun.color.set(lights.sunColor);this.sun.position.set(mode==='sunset'?-120:-70,mode==='sunset'?70:130,75);this.sun.shadow.normalBias=trial?.28:.18;this.sun.shadow.bias=trial?-.0008:-.0002;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=lights.exposure;
  if(this.extraScenery){this.extraScenery.visible=true;for(const child of this.extraScenery.children)child.visible=playing||!!child.userData.terrain;}if(this.newSet){this.newSet.visible=true;const aurora=this.newSet.getObjectByName('harbourAurora');if(aurora)aurora.visible=playing;if(this.newSet.snow)this.newSet.snow.visible=playing;if(this.newSet.flies)this.newSet.flies.visible=playing&&this.lighting==='night';}if(this.life)this.life.visible=playing;if(this.atmosphere)this.atmosphere.visible=playing;this.landscape!.visible=playing;this.scene.background=new T.Color(playing?this.landscape!.horizon:'#f5f1e8');this.scene.fog=new T.Fog(playing?this.landscape!.horizon:'#f5f1e8',playing?270:s.config.arena==='starfall'||s.config.arena==='starcore'?2000:s.config.arena==='stadium'?900:500,playing?1450:s.config.arena==='starfall'||s.config.arena==='starcore'?4000:s.config.arena==='stadium'?1600:950);this.renderer.setClearColor('#f5f1e8');
  this.resize();const r=this.renderer,w=innerWidth,h=innerHeight;r.setScissorTest(false);r.setViewport(0,0,w,h);r.clear();
  if(!playing){if(!rect)return;r.setViewport(rect.x,h-rect.bottom,rect.width,rect.height);r.setScissor(rect.x,h-rect.bottom,rect.width,rect.height);r.setScissorTest(true);this.demoCamera.aspect=rect.width/rect.height;const a=.64+(this.reduced?0:Math.sin(now*.07)*.15),scale=arenaExtent(s.config.arena)/37*(s.config.arena==='stadium'?1.2:1);this.demoCamera.position.set(Math.sin(a)*104*scale,79*scale,Math.cos(a)*104*scale);this.demoCamera.lookAt(0,0,0);if(s.config.arena==='starcore'){this.demoCamera.position.set(330,110,330);this.demoCamera.lookAt(0,-120,0);}const depth=previewDepthRange(this.demoCamera,this.previewBounds);this.demoCamera.near=depth.near;this.demoCamera.far=depth.far;this.demoCamera.updateProjectionMatrix();r.render(this.scene,this.demoCamera);return;}
  const count=localIds.length;
  localIds.forEach((id,i)=>{
   const cols=count>2?2:count===2&&vertical?2:1,rows=Math.ceil(count/cols),vw=w/cols,vh=h/rows,x=(i%cols)*vw,y=h-(Math.floor(i/cols)+1)*vh;
   let cam=this.cameras[i];if(!cam){cam=new T.PerspectiveCamera(62,vw/vh,.1,2400);this.cameras[i]=cam;cam.position.set(0,15,20);}
   if(s.config.arena==='starcore'){const k=this.viewKart(s,id);if(!k)return;const up=globeFrame(k).up,pose=globePosition(k,k.y),frame=globeFrame(k),forward=frame.east.multiplyScalar(Math.sin(k.angle)).addScaledVector(frame.north,Math.cos(k.angle)),target=pose.clone().addScaledVector(up,5+this.distance*.12).addScaledVector(forward,-this.distance),look=pose.clone().addScaledVector(up,1.5).addScaledVector(forward,3);if(cam.userData.targetId!==k.id){cam.position.copy(target);cam.up.copy(up);cam.userData.targetId=k.id;}else{cam.position.lerp(target,1-Math.exp(-dt*12));cam.up.lerp(up,1-Math.exp(-dt*12)).normalize();}cam.lookAt(look);cam.fov=62;cam.aspect=vw/vh;cam.updateProjectionMatrix();r.setViewport(x,y,vw,vh);r.setScissor(x,y,vw,vh);r.setScissorTest(true);this.landscape!.follow(cam);r.render(this.scene,cam);return;}
   cam.up.set(0,1,0);
   const watched=this.viewKart(s,id);if(!watched)return;const visual=this.models.get(watched.id);const chosen=visual&&visual.visible?{...watched,x:visual.position.x,y:visual.position.y,z:visual.position.z,angle:visual.rotation.y}:watched;
   const fresh=cam.userData.targetId!==chosen.id;
   const facing=chosen.angle-(chosen.driftSlip??0)*.75;let yaw=fresh?facing:cam.userData.followAngle as number;yaw+=angleDiff(facing,yaw)*(1-Math.exp(-dt*6.5));cam.userData.followAngle=yaw;
   const d=this.distance,tx=chosen.x-Math.sin(yaw)*d,tz=chosen.z-Math.cos(yaw)*d;
   let ty=chosen.y+3.8+d*.1;const floor=ground(s.config.arena,tx,tz,chosen.y);if(floor>chosen.y&&floor-chosen.y<4)ty=Math.max(ty,floor+2.2);
   ty=Math.min(ty,ceiling(s.config.arena,tx,tz,chosen.y)-.45);
   const origin=new T.Vector3(chosen.x,chosen.y+1.65,chosen.z),target=new T.Vector3(tx,ty,tz),arm=target.clone().sub(origin),length=arm.length();
   this.cameraRay.set(origin,arm.normalize());this.cameraRay.far=length;let hit=this.cameraRay.intersectObject(this.cameraTerrain,true)[0];if(hit&&hit.distance<4.5){const raised=target.clone();raised.y=Math.min(chosen.y+10.8,ceiling(s.config.arena,tx,tz,chosen.y)-.45);const lifted=raised.clone().sub(origin),liftLength=lifted.length();this.cameraRay.set(origin,lifted.normalize());this.cameraRay.far=liftLength;const higherHit=this.cameraRay.intersectObject(this.cameraTerrain,true)[0];if(!higherHit||higherHit.distance>hit.distance+1){target.copy(raised);arm.copy(lifted);hit=higherHit;}}if(hit)target.copy(origin).addScaledVector(arm,Math.max(1.3,hit.distance-.55));
   const lookTarget=new T.Vector3(chosen.x+Math.sin(yaw)*3.5,chosen.y+1.45,chosen.z+Math.cos(yaw)*3.5);
   if(fresh){cam.position.copy(target);cam.userData.targetId=chosen.id;cam.userData.look=lookTarget.clone();}else cam.position.lerp(target,1-Math.exp(-dt*(hit?22:10)));
   (cam.userData.look as T.Vector3).lerp(lookTarget,1-Math.exp(-dt*14));cam.lookAt(cam.userData.look as T.Vector3);const shakeState=this.impactShakes.get(chosen.id),shake=shakeState?Math.max(0,(shakeState.until-now)/shakeState.duration)*shakeState.strength:0;if(shake>0&&!this.reduced&&this.flair==='full'){cam.position.x+=Math.sin(now*59)*shake;cam.position.y+=Math.cos(now*47)*shake*.65;cam.lookAt(cam.userData.look as T.Vector3);}cam.fov+=(62+Math.max(0,Math.abs(chosen.speed)-14)*.22+(chosen.boost>0?2:0)-cam.fov)*(1-Math.exp(-dt*5));cam.aspect=vw/vh;cam.updateProjectionMatrix();r.setViewport(x,y,vw,vh);r.setScissor(x,y,vw,vh);r.setScissorTest(true);this.landscape!.follow(cam);r.render(this.scene,cam);
  });
  if(count===3&&s.config.arena==='starcore'){const cam=this.broadcastCamera;cam.up.set(0,1,0);cam.position.set(235,55,235);cam.lookAt(0,-120,0);cam.aspect=w/h;cam.updateProjectionMatrix();r.setViewport(w/2,0,w/2,h/2);r.setScissor(w/2,0,w/2,h/2);r.setScissorTest(true);this.landscape!.follow(cam);r.render(this.scene,cam);return;}
  if(count===3){this.director.update(s);if(this.broadcastMode==='camera'){
   const focus=this.director.focus(s),cam=this.broadcastCamera,angle=this.director.shotAngle+.7,target=new T.Vector3(focus.x-Math.sin(angle)*27,focus.y+25,focus.z-Math.cos(angle)*27);
   target.y=Math.max(target.y,ground(s.config.arena,target.x,target.z)+9);
   const origin=new T.Vector3(focus.x,focus.y+1.6,focus.z),arm=target.clone().sub(origin),length=arm.length();this.cameraRay.set(origin,arm.normalize());this.cameraRay.far=length;const obstruction=this.cameraRay.intersectObject(this.cameraTerrain,true)[0];if(obstruction)target.copy(origin).addScaledVector(arm,Math.max(1.3,obstruction.distance-.6));
   const fresh=cam.userData.shot!==this.director.switched;if(fresh){cam.position.copy(target);cam.userData.shot=this.director.switched;cam.userData.look=new T.Vector3(focus.x,focus.y+1,focus.z);}else cam.position.lerp(target,1-Math.exp(-dt*2.5));
   (cam.userData.look as T.Vector3).lerp(new T.Vector3(focus.x,focus.y+1,focus.z),1-Math.exp(-dt*3));cam.lookAt(cam.userData.look);cam.aspect=w/h;cam.updateProjectionMatrix();r.setViewport(w/2,0,w/2,h/2);r.setScissor(w/2,0,w/2,h/2);r.setScissorTest(true);this.landscape!.follow(cam);r.render(this.scene,cam);
  }}
 }
 reset(){this.impactShakes.clear();this.director.reset();delete this.broadcastCamera.userData.shot;this.spectatorTargets.clear();this.eliminations.clear();for(const model of this.models.values()){model.scale.setScalar(1);model.rotation.set(0,0,0);}this.battleEffects.clearBursts();this.lastEvent=0;for(const c of this.cameras)delete c.userData.targetId;for(const model of this.models.values()){delete model.userData.skid;delete model.userData.balloonMotion;delete model.userData.previousSpeed;}for(const mark of this.skidMarks){this.fx.remove(mark.mesh);mark.mesh.geometry.dispose();(mark.mesh.material as T.Material).dispose();}this.skidMarks=[];for(const p of this.particles){this.fx.remove(p.mesh);p.mesh.geometry.dispose();}this.particles=[];}
}










