export const extraArenaIds=['starfall','glacier','crypt','starcore'] as const;
export const isSpaceArena=(arena:string)=>arena==='starfall'||arena==='starcore';
export function starfallWalkable(x:number,z:number){return Math.abs(x)>=52&&Math.abs(x)<=90&&Math.abs(z)<=36||Math.abs(x)<=65&&(Math.abs(z)<10||Math.abs(Math.abs(z)-(60-Math.abs(x))*.48)<8);}
export const CRYPT_PITS=[{x:-28,z:0,width:12,depth:68},{x:28,z:0,width:12,depth:68},{x:0,z:-28,width:44,depth:12},{x:0,z:28,width:44,depth:12}];
export const cryptLavaAt=(x:number,z:number)=>CRYPT_PITS.some(p=>Math.abs(x-p.x)<p.width/2&&Math.abs(z-p.z)<p.depth/2);
export function stationHeight(x:number,z:number){const r=Math.hypot(x,z);if(r>78+1e-4)return -40;if(r>75)return 9;if(r<18-1e-4)return -40;if(r<48)return 0;if(r<62)return (r-48)/14*6;return 6;}
