import type {Arena} from './arenas';
export const NEW_ARENAS=['foundry','harbour','ruins'] as const;
export type NewArena=typeof NEW_ARENAS[number];
export const isNewArena=(arena:Arena):arena is NewArena=>NEW_ARENAS.includes(arena as NewArena);
export const CONVEYOR_SPEED=10;
export const CONVEYORS=[{x:0,z:-24,width:28,depth:12,vx:CONVEYOR_SPEED,vz:0},{x:0,z:24,width:28,depth:12,vx:-CONVEYOR_SPEED,vz:0}];
export const onIce=(x:number,z:number)=>Math.abs(x)<(z<-12?29:z<16?41:24)&&z>-39&&z<37;
export const ruinsRavineAt=(x:number,z:number)=>x>-40&&x<40&&z>18&&z<30&&!(x>=-32&&x<=-20)&&!(x>=1&&x<=15);
export function arenaSurface(arena:Arena,x:number,z:number,y:number){if(y>.1)return {grip:1,vx:0,vz:0};if(arena==='harbour'&&onIce(x/2,z/2))return {grip:.28,vx:0,vz:0};const belt=arena==='foundry'?CONVEYORS.find(b=>Math.abs(x/2-b.x)<b.width/2&&Math.abs(z/2-b.z)<b.depth/2):undefined;return {grip:1,vx:belt?.vx??0,vz:belt?.vz??0};}
