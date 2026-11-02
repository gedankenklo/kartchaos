import {glacierIceAt} from './glacierSurface';
import {ARENAS,EXPANSIONS,type Arena} from './arenas';
import {rampHeight} from './terrain';
export const NEW_ARENAS=['foundry','harbour','ruins'] as const;
export type NewArena=typeof NEW_ARENAS[number];
export const isNewArena=(arena:Arena):arena is NewArena=>NEW_ARENAS.includes(arena as NewArena);
export const CONVEYOR_SPEED=10;
export const CONVEYORS=[{x:0,z:-24,width:28,depth:12,vx:CONVEYOR_SPEED,vz:0},{x:0,z:24,width:28,depth:12,vx:-CONVEYOR_SPEED,vz:0}];
export const onIce=(x:number,z:number)=>Math.abs(x)<(z<-12?29:z<16?41:24)&&z>-39&&z<37;
export function harbourIceAt(x:number,z:number,y:number){if(Math.abs(y)>.15)return false;const scale=ARENAS.harbour.scale,lx=x/scale,lz=z/scale;if(!onIce(lx,lz))return false;if(EXPANSIONS.harbour.blocks.some(b=>Math.abs(lx-b.x)<=b.width/2&&Math.abs(lz-b.z)<=b.depth/2))return false;return !EXPANSIONS.harbour.ramps.some(r=>rampHeight(r,lx,lz)!==undefined);}
export const ruinsRavineAt=(x:number,z:number)=>x>-40&&x<40&&z>18&&z<30&&!(x>=-32&&x<=-20)&&!(x>=1&&x<=15);
export function arenaSurface(arena:Arena,x:number,z:number,y:number){if(arena==='glacier')return {grip:glacierIceAt(x,z,y)?.055:1,vx:0,vz:0};if(arena==='harbour')return {grip:harbourIceAt(x,z,y)?.075:1,vx:0,vz:0};if(y>.1)return {grip:1,vx:0,vz:0};const belt=arena==='foundry'?CONVEYORS.find(b=>Math.abs(x/2-b.x)<b.width/2&&Math.abs(z/2-b.z)<b.depth/2):undefined;return {grip:1,vx:belt?.vx??0,vz:belt?.vz??0};}
