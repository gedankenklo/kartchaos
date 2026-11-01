// Shared surfaces for the renderer, driving, weapons and bot navigation.
export const FORT={extent:48,center:20,half:12,lower:6,upperCenter:24,upperHalf:5,upper:11,bridgeWidth:6,bridgeThickness:.6} as const;
export interface Ramp {axis:'x'|'z'; from:number; to:number; cross:number; width:number; bottom:number; top:number;}
export interface Bridge {x:number;z:number;width:number;depth:number;y:number;thickness:number;}
export const FORT_RAMPS:Ramp[]=[];
export const FORT_BRIDGES:Bridge[]=[];
for(const sx of [-1,1])for(const sz of [-1,1]){
 FORT_RAMPS.push({axis:'z',from:sz*42,to:sz*32,cross:sx*20,width:5.5,bottom:0,top:6});
 FORT_RAMPS.push({axis:'x',from:sx*12,to:sx*19,cross:sz*24,width:4,bottom:6,top:11});
}
for(const sign of [-1,1]){
 FORT_BRIDGES.push({x:sign*20,z:0,width:6,depth:16,y:6,thickness:.6});
 FORT_BRIDGES.push({x:0,z:sign*20,width:16,depth:6,y:6,thickness:.6});
 FORT_BRIDGES.push({x:sign*27,z:0,width:4,depth:38,y:11,thickness:.6});
 FORT_BRIDGES.push({x:0,z:sign*27,width:38,depth:4,y:11,thickness:.6});
}
export function rampHeight(r:Ramp,x:number,z:number):number|undefined {
 const along=r.axis==='x'?x:z,cross=r.axis==='x'?z:x,t=(along-r.from)/(r.to-r.from);
 if(t< -1e-7||t>1+1e-7||Math.abs(cross-r.cross)>r.width/2)return undefined;
 return r.bottom+(r.top-r.bottom)*Math.max(0,Math.min(1,t));
}
export function fortressSolidHeight(x:number,z:number):number {
 if(Math.abs(x)>FORT.extent||Math.abs(z)>FORT.extent)return -40;
 let h=0;
 if(Math.abs(x)>=8&&Math.abs(x)<=32&&Math.abs(z)>=8&&Math.abs(z)<=32)h=FORT.lower;
 if(Math.abs(x)>=FORT.upperCenter-FORT.upperHalf&&Math.abs(x)<=FORT.upperCenter+FORT.upperHalf&&Math.abs(z)>=FORT.upperCenter-FORT.upperHalf&&Math.abs(z)<=FORT.upperCenter+FORT.upperHalf)h=FORT.upper;
 for(const r of FORT_RAMPS){const rh=rampHeight(r,x,z);if(rh!==undefined)h=Math.max(h,rh);}
 return h;
}
export function bridgeAt(x:number,z:number):Bridge|undefined {return FORT_BRIDGES.find(b=>Math.abs(x-b.x)<=b.width/2+1e-7&&Math.abs(z-b.z)<=b.depth/2+1e-7);}
// Disjoint rectangles cover the sky arena without coplanar slab intersections.
export const SKY_TILES:{x:number;z:number;width:number;depth:number;color:string}[]=[
 {x:0,z:0,width:22,depth:22,color:'#e8dff5'},
 {x:0,z:14.5,width:8,depth:7,color:'#b19bd5'},
 {x:0,z:-14.5,width:8,depth:7,color:'#b19bd5'},
 {x:14.5,z:0,width:7,depth:8,color:'#b19bd5'},
 {x:-14.5,z:0,width:7,depth:8,color:'#b19bd5'},
 {x:0,z:25,width:18,depth:14,color:'#d8c8ef'},
 {x:0,z:-25,width:18,depth:14,color:'#d8c8ef'},
 {x:25,z:0,width:14,depth:18,color:'#d8c8ef'},
 {x:-25,z:0,width:14,depth:18,color:'#d8c8ef'},
];
export function skyHeight(x:number,z:number):number {return SKY_TILES.some(t=>Math.abs(x-t.x)<=t.width/2&&Math.abs(z-t.z)<=t.depth/2)?0:-40;}
export function neonHeight(r:number):number {return r<9?4:r<17?(17-r)/8*4:r>37?-40:r>29?(r-29)*.3:0;}
