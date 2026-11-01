import {createGlow} from './visualPolish';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {itemBoxMaterial,toonMaterial} from './toon';
let glyph:T.BufferGeometry|undefined,frame:T.EdgesGeometry|undefined;
const frameMaterial=new T.LineBasicMaterial({color:'#e1d6ff',transparent:true,opacity:.8,depthWrite:false});
export function createItemVisual(){
 if(!glyph){const path=new T.CurvePath<T.Vector3>();path.add(new T.QuadraticBezierCurve3(new T.Vector3(-.22,.2,0),new T.Vector3(-.19,.46,0),new T.Vector3(.11,.44,0)));path.add(new T.QuadraticBezierCurve3(new T.Vector3(.11,.44,0),new T.Vector3(.38,.4,0),new T.Vector3(.22,.16,0)));path.add(new T.QuadraticBezierCurve3(new T.Vector3(.22,.16,0),new T.Vector3(.02,.07,0),new T.Vector3(.02,-.1,0)));const hook=new T.TubeGeometry(path,22,.069,6,false),dot=new T.SphereGeometry(.086,8,6);dot.translate(.02,-.33,0);const pieces:T.BufferGeometry[]=[];for(let i=0;i<4;i++){const a=i*Math.PI/2,m=new T.Matrix4().makeRotationY(a);m.setPosition(Math.sin(a)*.85,0,Math.cos(a)*.85);pieces.push(hook.clone().applyMatrix4(m),dot.clone().applyMatrix4(m));}glyph=mergeGeometries(pieces)!;pieces.forEach(p=>p.dispose());hook.dispose();dot.dispose();const box=new T.BoxGeometry(1.6,1.6,1.6);frame=new T.EdgesGeometry(box);box.dispose();}
 const g=new T.Group();const glow=createGlow('#c2b0ff',5.6,.55);glow.name='itemGlow';g.add(glow);const body=new T.Mesh(new RoundedBoxGeometry(1.65,1.65,1.65,2,.12),itemBoxMaterial());body.name='itemGlass';body.castShadow=true;g.add(body);const mark=new T.Mesh(glyph,toonMaterial('#fff0c5',new T.Color('#fff0c5'),.08));mark.userData.sharedGeometry=true;g.add(mark);const outline=new T.LineSegments(frame!,frameMaterial);outline.userData.sharedGeometry=true;g.add(outline);
 const core=new T.Mesh(new T.OctahedronGeometry(.34),new T.MeshBasicMaterial({color:'#d9ffff',transparent:true,opacity:.6,depthWrite:false,blending:T.AdditiveBlending}));core.name='magicCore';core.userData.disposeMaterial=true;g.add(core);
 const sparkles=new T.Group();sparkles.name='magicSparkles';for(let i=0;i<4;i++){const star=new T.Mesh(new T.OctahedronGeometry(.12),new T.MeshBasicMaterial({color:['#fff0a0','#a2faff','#fffaff','#e6b4ff'][i],transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending}));star.userData.disposeMaterial=true;sparkles.add(star);}g.add(sparkles);
 const halo=new T.Mesh(new T.TorusGeometry(1.15,.065,6,40),new T.MeshBasicMaterial({color:'#c5f6ff',transparent:true,opacity:.8,depthWrite:false,blending:T.AdditiveBlending}));halo.name='growHalo';halo.userData.disposeMaterial=true;halo.rotation.x=Math.PI/2;halo.position.y=-.9;halo.visible=false;g.add(halo);return g;
}

export function animateItemVisual(g:T.Group,now:number,index:number){const t=now+index*1.7,core=g.getObjectByName('magicCore')!;core.rotation.set(t,t*1.3,0);core.scale.setScalar(.9+Math.sin(t*3)*.15);const glow=g.getObjectByName('itemGlow') as T.Sprite;if(glow){glow.material.opacity=.5+Math.sin(t*2.4)*.09;glow.scale.setScalar(5.3+Math.sin(t*1.7)*.35);}g.getObjectByName('magicSparkles')?.children.forEach((star,i)=>{const a=t*1.5+i*Math.PI/2;star.position.set(Math.cos(a)*1.3,Math.sin(a*1.7+i)*.8,Math.sin(a)*1.3);star.rotation.set(a,a*2,0);star.scale.setScalar(.7+.4*Math.sin(t*4+i));});}


