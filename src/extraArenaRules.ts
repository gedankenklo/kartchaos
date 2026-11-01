export const extraArenaIds=['starfall','glacier','crypt','starcore'] as const;
export const isSpaceArena=(arena:string)=>arena==='starfall'||arena==='starcore';
export function starfallWalkable(x:number,z:number){return Math.abs(x)>=52&&Math.abs(x)<=90&&Math.abs(z)<=36||Math.abs(x)<=65&&(Math.abs(z)<10||Math.abs(Math.abs(z)-(60-Math.abs(x))*.48)<8);}
export const CRYPT_PITS=[{x:0,z:0,width:28,depth:28},{x:-38,z:28,width:18,depth:20},{x:38,z:-28,width:18,depth:20}];
export const cryptLavaAt=(x:number,z:number)=>CRYPT_PITS.some(p=>Math.abs(x-p.x)<p.width/2&&Math.abs(z-p.z)<p.depth/2);
