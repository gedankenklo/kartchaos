export const extraArenaIds=['starfall','glacier','crypt','starcore'] as const;
export const isSpaceArena=(arena:string)=>arena==='starfall'||arena==='starcore';
export function starfallWalkable(x:number,z:number){return Math.abs(x)>=52&&Math.abs(x)<=90&&Math.abs(z)<=36||Math.abs(x)<=65&&(Math.abs(z)<10||Math.abs(Math.abs(z)-(60-Math.abs(x))*.48)<8);}
export const CRYPT_PITS=[{x:-30,z:-8,width:28,depth:20},{x:-16,z:18,width:16,depth:48},{x:34,z:30,width:40,depth:20}];
export const cryptLavaAt=(x:number,z:number)=>CRYPT_PITS.some(p=>Math.abs(x-p.x)<p.width/2&&Math.abs(z-p.z)<p.depth/2);
export function stationHeight(x:number,z:number){const r=Math.hypot(x,z);if(r>78+1e-4)return -40;if(r>75)return 9;if(r<26)return -4.5*Math.pow(1-(r/26)**2,2);if(r<48)return 0;if(r<62)return (r-48)/14*6;return 6;}
