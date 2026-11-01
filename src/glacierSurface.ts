import {ARENAS,EXPANSIONS} from './arenas';
import {rampHeight} from './terrain';
// Underpasses remain ice; only the actual ramp surface has ordinary traction.
export function glacierIceAt(x:number,z:number,y:number){if(Math.abs(y)>.15)return false;const scale=ARENAS.glacier.scale,ys=ARENAS.glacier.height;return !EXPANSIONS.glacier.ramps.some(r=>{const h=rampHeight(r,x/scale,z/scale);return h!==undefined&&Math.abs(h*ys-y)<.25;});}
