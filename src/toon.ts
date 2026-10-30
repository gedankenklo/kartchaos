import * as T from 'three';
const bands=new T.DataTexture(new Uint8Array([85,158,220,255]),4,1,T.RedFormat);bands.minFilter=bands.magFilter=T.NearestFilter;bands.generateMipmaps=false;bands.needsUpdate=true;
const cache=new Map<string,T.MeshToonMaterial>();
export function toonMaterial(color:T.Color|string,emissive=new T.Color(0),emissiveIntensity=0,side:T.Side=T.FrontSide,vertexColors=false){
 const c=new T.Color(color),key=c.getHexString()+emissive.getHexString()+emissiveIntensity+side+vertexColors;let m=cache.get(key);
 if(!m){m=new T.MeshToonMaterial({color:c,gradientMap:bands,emissive,emissiveIntensity,side,vertexColors});cache.set(key,m);}return m;
}
const ink=new T.MeshBasicMaterial({color:'#403e50',side:T.BackSide,depthWrite:false});
ink.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed+=normal*0.019;');};ink.customProgramCacheKey=()=> 'soft-toon-ink';
export function applyToon(root:T.Object3D,outlines=false){
 const meshes:T.Mesh[]=[];root.traverse(o=>{if(o instanceof T.Mesh&&!Array.isArray(o.material)&&!o.userData.toonOutline)meshes.push(o);});
 for(const m of meshes){const source=m.material as T.MeshStandardMaterial;if(source instanceof T.MeshToonMaterial||source instanceof T.MeshBasicMaterial||source.transparent||!source.color)continue;
  m.material=toonMaterial(source.color,source.emissive,source.emissiveIntensity,source.side,source.vertexColors);
  if(outlines){m.geometry.computeBoundingBox();const size=m.geometry.boundingBox!.getSize(new T.Vector3()).multiply(m.scale);if(Math.max(size.x,size.y,size.z)<.65)continue;const outline=new T.Mesh(m.geometry,ink);outline.userData.toonOutline=true;outline.userData.sharedGeometry=true;outline.castShadow=false;outline.receiveShadow=false;m.add(outline);}
 }
 root.userData.toon=true;
}

let shadowMap:T.DataTexture|undefined;
export function contactShadow(){
 if(!shadowMap){const n=64,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const d=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5),i=(y*n+x)*4;data[i]=48;data[i+1]=43;data[i+2]=65;data[i+3]=Math.round(Math.pow(Math.max(0,1-d),1.6)*155);}shadowMap=new T.DataTexture(data,n,n);shadowMap.magFilter=T.LinearFilter;shadowMap.needsUpdate=true;}
 const m=new T.Mesh(new T.PlaneGeometry(3.3,3.8),new T.MeshBasicMaterial({map:shadowMap,transparent:true,opacity:.5,depthWrite:false}));m.name='contactShadow';m.rotation.x=-Math.PI/2;m.position.y=.05;m.userData.disposeMaterial=true;return m;
}

const itemLatex=new T.MeshPhysicalMaterial({color:'#b9a2eb',roughness:.045,metalness:.08,iridescence:.9,iridescenceIOR:1.3,iridescenceThicknessRange:[180,450],emissive:'#56328f',emissiveIntensity:.16,clearcoat:1,clearcoatRoughness:.07,transparent:true,opacity:.78,depthWrite:false,ior:1.4,specularIntensity:1.2});
export function itemBoxMaterial(){return itemLatex;}
