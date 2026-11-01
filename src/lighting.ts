import type {Arena} from './arenas';
export type Lighting='day'|'night'|'sunset';
export const defaultLighting=(arena:Arena):Lighting=>arena==='castle'||arena==='stadium'?'night':'day';
export const chooseLighting=(arena:Arena,random=Math.random):Lighting=>random()<.5?(arena==='castle'?'sunset':'day'):'night';
export const lightingFor=(arena:Arena,value:Lighting|undefined):Lighting=>arena==='castle'?(value==='sunset'?'sunset':'night'):value==='night'?'night':'day';
export function lightSettings(mode:Lighting,soft=true){return mode==='night'?{sun:.72,hemi:.66,fill:.38,environment:.42,sunColor:'#b4ccf5',skyColor:'#a4c1e3',groundColor:'#535675',exposure:1.02}:mode==='sunset'?{sun:1.9,hemi:1,fill:.35,environment:.55,sunColor:'#ffc18a',skyColor:'#eac1bb',groundColor:'#79657b',exposure:1}: {sun:soft?2.25:1.9,hemi:soft?1.1:.85,fill:.4,environment:.65,sunColor:soft?'#ffe2b6':'#fff0d1',skyColor:'#dceaf3',groundColor:'#9391ad',exposure:soft?1.03:.95};}
