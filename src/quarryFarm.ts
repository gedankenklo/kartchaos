// Local map units; shared deterministic paths keep server collision and visuals together.
export const FARM_POSTS=[...[-1,1].flatMap(x=>[-1,1].flatMap(z=>[
 {x:x*46,z:z*46,r:.7,height:5.4,bottom:0},
 {x:x*28,z:z*28,r:.6,height:11.4,bottom:6}]))];
export const COW_COUNT=6;
export function quarryCows(seconds:number){return Array.from({length:COW_COUNT},(_,id)=>{
 const outer=id>=4,cx=outer?(id===4?-64:64):(id%2?-10:10),cz=outer?(id===4?-42:42):(id<2?-10:10),radius=outer?5:3,angle=seconds*(outer?.065:.09)+id*1.7;
 return {id,x:cx+Math.sin(angle)*radius,z:cz+Math.cos(angle)*radius,angle:Math.PI/2+angle,r:1.65,height:2.5,bottom:0};
});}

export const FARM_TREES=Array.from({length:18},(_,i)=>{const a=i*2.399,r=92+i%4*3;return {x:Math.sin(a)*r,z:Math.cos(a)*r,r:.65,height:5,bottom:0};});
export const FARM_HAY=[-1,1].flatMap(x=>[-1,1].flatMap(z=>[{x:x*64,z:z*20,r:2.9,height:2.2,bottom:0},{x:x*20,z:z*64,r:2.9,height:2.2,bottom:0}]));
type ChickenDriver={x:number;z:number;y:number;vx:number;vz:number;balloons:number};
// Harmless scenery: avoid both the current kart and its near-future travel line.
export function quarryChickens(seconds:number,karts:ChickenDriver[]=[]){return Array.from({length:8},(_,id)=>{
 const outer=id>=6,angle=seconds*.5+id*2.4;let x=(outer?(id%2?126:-126):(id%3-1)*11)+Math.sin(angle)*2,z=(outer?(id%2?-122:122):(id<3?-12:12))+Math.cos(angle)*2,running=false;
 const homeX=x,homeZ=z;
 const nearby=karts.filter(k=>k.balloons>0&&Math.abs(k.y)<2);
 for(let pass=0;pass<4;pass++)for(const k of nearby)for(const ahead of [.28,0]){const px=k.x+k.vx*ahead,pz=k.z+k.vz*ahead,dx=x-px,dz=z-pz,d=Math.hypot(dx,dz),safe=ahead?10:6;if(d<safe){const a=d>.01?Math.atan2(dx,dz):id*2.4;x=px+Math.sin(a)*safe;z=pz+Math.cos(a)*safe;running=true;}}
 return {id,x,z,angle:running?Math.atan2(x-homeX,z-homeZ):angle,y:running?Math.abs(Math.sin(seconds*18+id))*.45:0,running};
});}
