import {idle,type Input} from './sim';
export interface InputFrame{seq:number;inputs:Record<number,Input>;}
export function sanitizeInput(raw:any):Input{return {confirm:raw?.confirm===true,gas:Math.max(-1,Math.min(1,Number(raw?.gas)||0)),steer:Math.max(-1,Math.min(1,Number(raw?.steer)||0)),drift:!!raw?.drift,hop:!!raw?.hop,fire:!!raw?.fire};}
// Acknowledge simulation work, not socket arrival. Bound the queue so a stall
// cannot turn into seconds of old steering being played back after recovery.
export class InputQueue{
 received=0;ack=0;frames:InputFrame[]=[];current:Record<number,Input>={};
 enqueue(frames:InputFrame[],ids:number[]){for(const frame of frames.slice(-8)){if(!frame||typeof frame!=='object'||!Number.isSafeInteger(frame.seq)||frame.seq<=this.received)continue;this.received=frame.seq;this.frames.push({seq:frame.seq,inputs:Object.fromEntries(ids.map(id=>[id,sanitizeInput(frame.inputs?.[id])]))});}if(this.frames.length>6)this.frames.splice(0,this.frames.length-6);}
 next(ids:number[],fresh:boolean){if(!fresh){this.frames=[];this.current=Object.fromEntries(ids.map(id=>[id,idle()]));return this.current;}const frame=this.frames.shift();if(frame){this.ack=frame.seq;this.current=frame.inputs;}return this.current;}
}
export class ServerClock{
 accumulator=0;
 advance(elapsedMs:number){this.accumulator+=Math.max(0,Math.min(100,elapsedMs));const steps=Math.min(3,Math.floor((this.accumulator+.00001)/(1000/60)));this.accumulator=Math.max(0,this.accumulator-steps*1000/60);if(this.accumulator>1000/60)this.accumulator=1000/60;return steps;}
}
