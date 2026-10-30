import * as T from 'three';
export type Surface='grass'|'sand'|'stone'|'metal'|'wood'|'rubber'|'paint';
const textures=new Map<Surface,T.DataTexture>();
// Small repeatable material swatches, projected in world space so ramps and
// merged meshes retain the same texel size without coplanar surface overlays.
function texture(kind:Surface){
 let cached=textures.get(kind);if(cached)return cached;
 const size=256,data=new Uint8Array(size*size*4);let seed=92831;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const grain=rand(),coarse=Math.sin(x*.11+Math.sin(y*.07)*2)*Math.cos(y*.14),u=x/size,v=y/size;let value=.68+(grain-.5)*.22+coarse*.035;
  if(kind==='grass'){value=.66+(grain-.5)*.36;const blade=(x+Math.floor(y/9)*17)%19;if(blade<2&&y%13<9)value-=.19;if(blade===3&&y%13<6)value+=.14;}
  if(kind==='sand'){value=.72+(grain-.5)*.25+Math.sin(y*.2+Math.sin(x*.04)*2)*.035;if(grain>.987)value-=.3;}
  if(kind==='stone'){const row=Math.floor(y/64),bx=(x+(row%2)*64)%128,by=y%64;value=.72+(grain-.5)*.21+coarse*.045;if(bx<3||by<3)value=.30+grain*.08;else if(bx<5||by<5)value=.88;}
  if(kind==='metal'){value=.70+(grain-.5)*.12+Math.sin(x*1.7)*.035;if(x<3||y<3)value=.32;if(x===4||y===4)value=.88;const dx=Math.min(Math.abs(x-13),Math.abs(x-243)),dy=Math.min(Math.abs(y-13),Math.abs(y-243));if(dx*dx+dy*dy<10)value=.35;if(dx*dx+dy*dy<3)value=.9;}
  if(kind==='wood'){const plank=Math.floor(x/64);value=.71+Math.sin(x*.72+Math.sin(y*.023+plank)*3)*.07+Math.sin(x*.2+y*.012)*.06+(grain-.5)*.13;if(x%64<2)value=.3;}
  if(kind==='rubber'){value=.62+(grain-.5)*.17;if((x+Math.abs(y-128)*.7)%44<10)value=.22;}
  if(kind==='paint')value=.74+(grain-.5)*.10;
  const c=Math.round(T.MathUtils.clamp(value,0,1)*255),i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=c;data[i+3]=255;
 }
 cached=new T.DataTexture(data,size,size);cached.wrapS=cached.wrapT=T.RepeatWrapping;cached.magFilter=T.LinearFilter;cached.minFilter=T.LinearMipmapLinearFilter;cached.generateMipmaps=true;cached.anisotropy=4;cached.needsUpdate=true;textures.set(kind,cached);return cached;
}
export function surfaceMaterial(color:string,kind:Surface,extra:T.MeshStandardMaterialParameters={}){
 const material=new T.MeshStandardMaterial({color,roughness:kind==='metal'?.62:.88,metalness:kind==='metal'?.12:0,flatShading:true,...extra});
 const scale={grass:4,sand:6,stone:7,metal:5,wood:4,rubber:.55,paint:.9}[kind];
 material.onBeforeCompile=shader=>{
  shader.uniforms.surfaceMap={value:texture(kind)};shader.uniforms.surfaceScale={value:scale};
  shader.vertexShader='varying vec3 vSurfacePoint;varying vec3 vSurfaceNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSurfacePoint=(modelMatrix*vec4(transformed,1.)).xyz;vSurfaceNormal=normalize(mat3(modelMatrix)*normal);');
  shader.fragmentShader='uniform sampler2D surfaceMap;uniform float surfaceScale;varying vec3 vSurfacePoint;varying vec3 vSurfaceNormal;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec3 blend=pow(abs(normalize(vSurfaceNormal)),vec3(6.));blend/=max(dot(blend,vec3(1.)),.0001);
   vec3 p=vSurfacePoint/surfaceScale;
   float texel=texture2D(surfaceMap,p.zy).r*blend.x+texture2D(surfaceMap,p.xz).r*blend.y+texture2D(surfaceMap,p.xy).r*blend.z;
   diffuseColor.rgb*=mix(.56,1.17,texel);
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(texel-.65)*.22,.2,1.);');
 };
 material.customProgramCacheKey=()=>`surface-${kind}`;return material;
}
