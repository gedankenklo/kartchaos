// Local map units; shared deterministic paths keep server collision and visuals together.
export const FARM_POSTS=[...[-1,1].flatMap(x=>[-1,1].flatMap(z=>[
 {x:x*46,z:z*46,r:.7,height:5.4,bottom:0},
 {x:x*28,z:z*28,r:.6,height:11.4,bottom:6}]))];
export const COW_COUNT=6;
export function quarryCows(seconds:number){return Array.from({length:COW_COUNT},(_,id)=>{
 const outer=id>=4,cx=outer?(id===4?-64:64):(id%2?-10:10),cz=outer?(id===4?-42:42):(id<2?-10:10),radius=outer?5:3,angle=seconds*(outer?.065:.09)+id*1.7;
 return {id,x:cx+Math.sin(angle)*radius,z:cz+Math.cos(angle)*radius,angle:Math.PI/2+angle,r:1.65,height:2.5,bottom:0};
});}
