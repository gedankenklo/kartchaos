import {FORT} from './terrain';
// Place the entire pine canopy beyond the square wall, including at diagonal angles.
export function fortressTreePosition(index:number){const angle=index*2.399,sin=Math.sin(angle),cos=Math.cos(angle),outside=FORT.extent+6+index%4*3,radius=outside/Math.max(Math.abs(sin),Math.abs(cos));return {x:sin*radius,z:cos*radius};}
