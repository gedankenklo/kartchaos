import {defaultLighting,type Lighting} from './lighting';
import {createNeonCityGround} from './neonScenery';
import * as T from 'three';
import {ARENAS,type Arena} from './arenas';

export const backdropFloorHeight=(arena:Arena)=>arena==='beach'?-.35:arena==='castle'?-60:arena==='sky'||arena==='neon'?-210:-1.5*ARENAS[arena].height;

// Distant scenery is separate from driving surfaces and camera collision geometry.
export class Landscape extends T.Group {
 sky:T.Mesh;horizon:string;clouds?:T.InstancedMesh;water?:T.ShaderMaterial;dust?:T.Points;flags:T.Group[]=[];signs:T.Mesh[]=[];

 constructor(arena:Arena,trial=false,lighting:Lighting=defaultLighting(arena)){
  super();
  const desert=arena==='quarry',coast=arena==='depot'||arena==='beach',night=lighting==='night',sunset=lighting==='sunset',floating=arena==='sky';
  const deepNight=night;
  const top=sunset?'#795b83':deepNight?'#080e20':trial&&arena==='fortress'?'#8fbfcf':night?'#443667':desert?'#76bce0':'#74b7dd';
  this.horizon=sunset?'#e9ac83':night?(arena==='castle'?'#302032':'#182b48'):arena==='beach'?'#eddbc5':deepNight?(arena==='castle'?'#302032':'#182b48'):trial&&arena==='fortress'?'#eee4c5':night?'#e7a4aa':desert?'#f6d8ac':'#e1eee2';
  const skyMaterial=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color(top)},horizon:{value:new T.Color(this.horizon)},sun:{value:new T.Vector3(-.5,sunset?.18:.32,.65).normalize()},sunColor:{value:new T.Color(night?'#dceaff':'#ffe3a0')}},vertexShader:'varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 direction;uniform vec3 top;uniform vec3 horizon;uniform vec3 sun;uniform vec3 sunColor;void main(){vec3 d=normalize(direction);vec3 c=mix(horizon,top,smoothstep(0.,.8,max(d.y,0.)));float glow=pow(max(dot(d,sun),0.),32.);float disc=smoothstep(.9987,.9993,dot(d,sun));c=mix(c,sunColor,glow*.28+disc*.72);gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
  // Shader chunks must begin on their own preprocessor line.
  skyMaterial.fragmentShader=skyMaterial.fragmentShader.replace(';#include',';\n#include');
  this.sky=new T.Mesh(new T.SphereGeometry(1700,32,16),skyMaterial);this.sky.renderOrder=-1000;this.sky.frustumCulled=false;this.add(this.sky);
  const groundColor=night?'#26394e':sunset?'#966e78':coast?'#73b8c6':desert?'#d2a77e':'#9bbd8d';
  const floor:T.Mesh<T.CircleGeometry,T.Material>=new T.Mesh(new T.CircleGeometry(1450,96),new T.MeshBasicMaterial({color:groundColor}));floor.rotation.x=-Math.PI/2;floor.position.y=backdropFloorHeight(arena);this.add(floor);
  const colors=sunset?['#8e6a78','#785b72','#5e4e69']:deepNight?(arena==='castle'?['#39304b','#2c2b45','#25263b']:['#324056','#29374b','#233246']):trial&&arena==='fortress'?['#81a48a','#9bb6a0','#bbcbb7']:night?['#b294b6','#8c80a7','#73769c']:desert?['#c99577','#c3a08b','#b7a6a0']:coast?['#8bad9d','#9ebbb0','#afc7bf']:['#87a889','#9bb49c','#acc5b7'];
  for(let ring=2;ring>=0;ring--){
   const radius=330+ring*210,vertices:number[]=[];
   for(let i=0;i<96;i++){
    const point=(j:number,base:boolean)=>{const a=j/96*Math.PI*2,h=base?-220:coast&&Math.cos(a)<-.25?-3:35+ring*28+Math.sin(j*.76+ring)*24+Math.sin(j*1.9)*13;return [Math.sin(a)*radius,h,Math.cos(a)*radius];};
    vertices.push(...point(i,true),...point(i,false),...point(i+1,false),...point(i,true),...point(i+1,false),...point(i+1,true));
   }
   const geo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));const ridge=new T.Mesh(geo,new T.MeshBasicMaterial({color:colors[ring],side:T.DoubleSide}));this.add(ridge);
  }
  const cloud=new T.InstancedMesh(new T.SphereGeometry(1,9,6),new T.MeshBasicMaterial({color:deepNight?'#5a607d':night?'#d6b6ce':'#fff6e7',transparent:true,opacity:deepNight?.55:.82,depthWrite:false}),48);
  const dummy=new T.Object3D();for(let i=0;i<48;i++){const cluster=Math.floor(i/4),a=cluster*2.399,r=250+cluster%3*95;dummy.position.set(Math.sin(a)*r+(i%4-1.5)*14,95+cluster%4*23+(i%3)*4,Math.cos(a)*r);dummy.scale.set(19,7+(i%3)*2,11);dummy.updateMatrix();cloud.setMatrixAt(i,dummy.matrix);}this.add(cloud);this.clouds=cloud;
  if(arena==='neon'||arena==='stadium'){
   if(arena==='neon')this.add(createNeonCityGround());const buildings=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color:night?'#313c58':'#6a748b'}),48);
   const windows=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color:'#f5c9a1'}),48);
   for(let i=0;i<48;i++){const a=i/48*Math.PI*2,r=245+(i%3)*17,h=15+(i*17%45);dummy.position.set(Math.sin(a)*r,h/2-2,Math.cos(a)*r);dummy.rotation.y=a;dummy.scale.set(10,h,12);dummy.updateMatrix();buildings.setMatrixAt(i,dummy.matrix);dummy.position.y=h*.7;dummy.scale.set(10.2,1.4,12.2);dummy.updateMatrix();windows.setMatrixAt(i,dummy.matrix);}buildings.name='cityBuildings';this.add(buildings,windows);if(arena==='neon'){for(const radius of [180,340]){const skirt=new T.Mesh(new T.CylinderGeometry(radius,radius,208,96,1,true),new T.MeshBasicMaterial({color:'#29344a',side:T.DoubleSide}));skirt.position.y=-106;this.add(skirt);}}
  }
  if(floating){for(let i=0;i<12;i++){const a=i*2.399,r=140+i%3*40;const island=new T.Mesh(new T.ConeGeometry(14+i%3*5,35,5),new T.MeshStandardMaterial({color:i%2?'#b8aece':'#a8bdab',flatShading:true}));island.rotation.z=Math.PI;island.position.set(Math.sin(a)*r,-45-i%4*12,Math.cos(a)*r);this.add(island);const grass=new T.Mesh(new T.CylinderGeometry(14+i%3*5,14+i%3*5,1,5),new T.MeshStandardMaterial({color:'#b4cd95',flatShading:true}));grass.position.copy(island.position);grass.position.y+=17.5;this.add(grass);}}

  const extent=ARENAS[arena].extent*ARENAS[arena].scale;
  if(deepNight){const stars:number[]=[];for(let i=0;i<180;i++){const a=i*2.399,y=160+(i*53%800),r=Math.sqrt(1400*1400-y*y);stars.push(Math.sin(a)*r,y,Math.cos(a)*r);}this.add(new T.Points(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(stars,3)),new T.PointsMaterial({color:'#d5e8ff',size:2.4,sizeAttenuation:true})));}
  if(coast){this.water=new T.ShaderMaterial({uniforms:{time:{value:0},tint:{value:new T.Color(night?'#607dab':sunset?'#e7ae83':'#ffffff')}},vertexShader:'varying vec3 world;void main(){world=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}',fragmentShader:'varying vec3 world;uniform float time;uniform vec3 tint;void main(){float ripple=sin(world.x*.14+time*.8)*sin(world.z*.19-time*.6);float foam=smoothstep(.7,.98,ripple);vec3 c=mix(vec3(.20,.46,.53),vec3(.53,.77,.77),foam*.5+.15);gl_FragColor=vec4(c*tint,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});(floor.material as T.Material).dispose();floor.material=this.water;}
  if(desert||arena==='yard'){const positions=new Float32Array(64*3);for(let i=0;i<64;i++){positions[i*3]=Math.sin(i*2.399)*extent*.95;positions[i*3+1]=1+i%8;positions[i*3+2]=Math.cos(i*2.399)*extent*.95;}this.dust=new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(positions,3)),new T.PointsMaterial({color:desert?'#eac99c':'#b9ba7a',size:desert?.16:.23,transparent:true,opacity:desert?.3:.55,depthWrite:false}));this.add(this.dust);}
  if(arena==='fortress'||arena==='yard'){for(let i=0;i<8;i++){const a=i*Math.PI/4,flag=new T.Group();flag.position.set(Math.sin(a)*(extent+8),0,Math.cos(a)*(extent+8));const pole=new T.Mesh(new T.CylinderGeometry(.12,.12,8,6),new T.MeshStandardMaterial({color:'#665b58'}));pole.position.y=4;flag.add(pole);const geo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([0,0,0,3,-.5,0,0,-1.4,0],3));const cloth=new T.Mesh(geo,new T.MeshBasicMaterial({color:['#ed7857','#e5c56d','#7dbbc1','#b39bcc'][i%4],side:T.DoubleSide}));cloth.position.y=7.5;flag.add(cloth);this.flags.push(flag);this.add(flag);}}
  if(arena==='neon'||arena==='stadium'){for(let i=0;i<4;i++){const a=i*Math.PI/2,board=new T.Group();board.position.set(Math.sin(a)*(arena==='neon'?205:extent+10),arena==='neon'?12:8,Math.cos(a)*(arena==='neon'?205:extent+10));board.rotation.y=a+Math.PI;if(arena==='neon')for(const x of [-4,4]){const pole=new T.Mesh(new T.BoxGeometry(.35,11,.35),new T.MeshBasicMaterial({color:'#58667c'}));pole.position.set(x,-8.5,0);board.add(pole);}const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#292239';ctx.fillRect(0,0,256,128);ctx.strokeStyle=i%2?'#a5f0e0':'#f7a7dc';ctx.lineWidth=7;ctx.strokeRect(7,7,242,114);ctx.fillStyle=ctx.strokeStyle;ctx.font='bold 52px sans-serif';ctx.textAlign='center';ctx.fillText(i%2?'POP!':'CHAOS',128,82);const sign=new T.Mesh(new T.PlaneGeometry(13,6.5),new T.MeshBasicMaterial({map:new T.CanvasTexture(canvas),side:T.DoubleSide,transparent:true}));board.add(sign);this.signs.push(sign);this.add(board);}}
 }
 update(dt:number,now:number,reduced=false){const time=reduced?0:now;if(this.clouds)this.clouds.rotation.y=time*.003;if(this.water)this.water.uniforms.time.value=time;if(this.dust){this.dust.rotation.y=time*.008;this.dust.position.x=Math.sin(time*.2)*2;this.dust.position.y=Math.sin(time*.6)*.4;}this.flags.forEach((f,i)=>{f.children[1].rotation.y=Math.sin(time*2+i)*.3;f.children[1].rotation.z=Math.sin(time*3+i)*.07;});this.signs.forEach((sign,i)=>{(sign.material as T.MeshBasicMaterial).opacity=reduced?1:.85+Math.sin(time*1.4+i)*.15;});}
 follow(camera:T.Camera){this.sky.position.copy(camera.position);}
 dispose(){this.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Points){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){const texture=(m as T.MeshBasicMaterial).map;texture?.dispose();m.dispose();}}});this.removeFromParent();}
}
