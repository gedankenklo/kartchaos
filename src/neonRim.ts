import {neonHeight} from './terrain';
export const NEON_RIM_SHAPE={count:16,radius:35.3,width:2.4,height:.65,depth:.8,tilt:Math.atan(.3)} as const;
export const NEON_RIM_MARKERS=Array.from({length:NEON_RIM_SHAPE.count},(_,i)=>{const angle=i*Math.PI*2/NEON_RIM_SHAPE.count,radius=NEON_RIM_SHAPE.radius;return {x:Math.sin(angle)*radius,z:Math.cos(angle)*radius,y:neonHeight(radius)+.35,angle};});
// Circle against each oriented bumper footprint. Heights follow the same tilted
// cuboid as the rendered marker; airborne karts may still clear the blocks.
export function neonRimContact(x:number,z:number,radius:number,y:number,verticalRadius=0){
 const shape=NEON_RIM_SHAPE,scale=2,height=1.25,c=Math.cos(shape.tilt),s=Math.sin(shape.tilt),hx=shape.width*scale/2,hz=(shape.depth*c+shape.height*s)*scale/2,hy=(shape.height*c+shape.depth*s)*height/2;
 for(const marker of NEON_RIM_MARKERS){const centerY=marker.y*height;if(y-verticalRadius>centerY+hy||y+verticalRadius<centerY-hy)continue;
  const sin=Math.sin(marker.angle),cos=Math.cos(marker.angle),dx=x-marker.x*scale,dz=z-marker.z*scale,tx=dx*cos-dz*sin,tz=dx*sin+dz*cos;
  let ax=tx-Math.max(-hx,Math.min(hx,tx)),az=tz-Math.max(-hz,Math.min(hz,tz)),distance=Math.hypot(ax,az),depth=radius-distance;
  if(distance>=radius&&distance>1e-8)continue;
  if(distance<1e-8){if(hx-Math.abs(tx)<hz-Math.abs(tz)){ax=tx<0?-1:1;az=0;depth=radius+hx-Math.abs(tx);}else{ax=0;az=tz<0?-1:1;depth=radius+hz-Math.abs(tz);}}else{ax/=distance;az/=distance;}
  const normalX=ax*cos+az*sin,normalZ=-ax*sin+az*cos;return {normalX,normalZ,x:x+normalX*(depth+.01),z:z+normalZ*(depth+.01)};
 }return null;
}
