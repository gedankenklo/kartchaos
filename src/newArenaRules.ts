import type {Arena} from './arenas';
export const NEW_ARENAS=['foundry','harbour','ruins'] as const;
export type NewArena=typeof NEW_ARENAS[number];
export const isNewArena=(arena:Arena):arena is NewArena=>NEW_ARENAS.includes(arena as NewArena);
export const CONVEYORS=[{x:0,z:-24,width:28,depth:12,vx:3.5,vz:0},{x:0,z:24,width:28,depth:12,vx:-3.5,vz:0}];
export const onIce=(x:number,z:number)=>Math.abs(x)<35&&Math.abs(z)<25;
export const ruinsRavineAt=(x:number,z:number)=>Math.abs(x)<14&&Math.abs(z)>17&&Math.abs(z)<31&&Math.abs(Math.abs(z)-24)>4;
export function arenaSurface(arena:Arena,x:number,z:number,y:number){if(y>.1)return {grip:1,vx:0,vz:0};if(arena==='harbour'&&onIce(x/2,z/2))return {grip:.28,vx:0,vz:0};const belt=arena==='foundry'?CONVEYORS.find(b=>Math.abs(x/2-b.x)<b.width/2&&Math.abs(z/2-b.z)<b.depth/2):undefined;return {grip:1,vx:belt?.vx??0,vz:belt?.vz??0};}
