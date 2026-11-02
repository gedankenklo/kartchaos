import {SnapshotDecoder} from './networkSnapshots';
import {NetworkMotion} from './networkMotion';
import type {InputFrame} from './networkInputs';
import {drive,type Config,type Input,type State} from './sim';
// Prediction may move a local kart, but only authority may publish event IDs.
// Otherwise a predicted crash/fall can advance the UI past a later real hit.
export function predictDrive(state:State,id:number,input:Input,dt:number){const k=state.karts[id];if(!k)return;const events=state.events,serial=state.serial,ctf=state.ctf,stats=k.stats,protectedState={balloons:k.balloons,damage:k.damage,hits:k.hits,kills:k.kills,eliminatedAt:k.eliminatedAt};if(ctf)state.ctf=structuredClone(ctf);k.stats=stats?{...stats}:undefined;state.events=[];try{drive(state,k,{...input,fire:false},dt);}finally{state.events=events;state.serial=serial;state.ctf=ctf;Object.assign(k,protectedState);k.stats=stats;}}
export interface RoomInfo {code:string; host:boolean; peers:{name:string;count:number;drivers?:number[];ready:boolean;connected:boolean}[]; config:Config;}
export class Network {
 decoder=new SnapshotDecoder();motion=new NetworkMotion();compact=false;outgoing:InputFrame[]=[];lastSent=0;lastPing=0;receivedAt=0;byteStart=0;byteCount=0;ping=0;jitter=0;interval=50;download=0;serverStep=0;serverDelay=0;
 sample(now:number,alpha:number){return this.state?this.motion.sample(this.state,this.ids,now,alpha):null;}
 receive(next:State,ack:number,now=performance.now()){
  const old=this.state;if(next.phase==='countdown'&&old?.phase==='finished'){this.pending=[];this.outgoing=[];this.seq=0;this.lastSent=0;this.motion.reset();}
  this.pending=this.pending.filter(p=>p.seq>ack);const predicted={...next,karts:next.karts.map(k=>({...k}))};
  if(next.phase==='playing')for(const p of this.pending)for(const id of this.ids)predictDrive(predicted,id,p.inputs[id],1/60);
  this.motion.receive(next,predicted,old,this.ids,now);this.motion.delay=Math.max(80,Math.min(160,80+this.jitter*2));this.state=predicted;this.onState();
 }

 socket:WebSocket|null=null;state:State|null=null;room:RoomInfo|null=null;ids:number[]=[];seq=0;pending:{seq:number;inputs:Record<number,Input>}[]=[]; token='';code='';url='';status='';retries=0;closed=true;onChange:()=>void=()=>{};onState:()=>void=()=>{};timer:ReturnType<typeof setTimeout>|null=null;
 connect(url:string,action:'create'|'join',count:number,config:Config,code=''){
  this.disconnect();this.closed=false;this.url=url;this.code=code;this.token='';this.status='Connecting…';this.open(action,count,config);this.onChange();
 }
 open(action:'create'|'join'|'resume',count:number,config:Config){
  try{this.socket=new WebSocket(this.url);}catch{this.status='Enter a valid ws:// or wss:// server address.';this.onChange();return;}
  const ws=this.socket;const timeout=setTimeout(()=>{if(ws.readyState!==WebSocket.OPEN)ws.close();},8000);
  ws.onopen=()=>{clearTimeout(timeout);this.retries=0;ws.send(JSON.stringify({type:action,code:this.code,token:this.token,count,config,protocol:2}));};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch{return;}
   if(m.type==='error'){this.status=m.message;this.onChange();return;}
   if(m.type==='pong'){const rtt=performance.now()-m.at;if(rtt>=0&&rtt<10000){this.jitter=this.jitter*.8+Math.abs(rtt-this.ping)*.2;this.ping=this.ping?this.ping*.7+rtt*.3:rtt;}return;}
   if(m.type==='joined'){this.pending=[];this.outgoing=[];this.seq=0;this.lastSent=0;this.decoder.reset();this.token=m.token;this.code=m.code;this.ids=m.ids;this.status='Connected';this.onChange();}
   if(m.type==='room'){this.room=m.room;this.onChange();}
   if(m.type==='state'||m.type==='snapshot'){
    const now=performance.now();if(this.receivedAt){const elapsed=now-this.receivedAt;this.interval=this.interval*.8+elapsed*.2;this.jitter=this.jitter*.9+Math.abs(elapsed-50)*.1;}this.receivedAt=now;this.byteCount+=typeof e.data==='string'?e.data.length:0;
    if(!this.byteStart)this.byteStart=now;if(now-this.byteStart>=1000){this.download=this.byteCount/(now-this.byteStart);this.byteCount=0;this.byteStart=now;}
    this.compact=m.type==='snapshot';this.serverStep=m.stepMs??0;this.serverDelay=m.delayMs??0;
    const next=this.compact?this.decoder.decode(m.payload):m.state as State;if(!next){this.send({type:'resync'});return;}this.receive(next,m.ack,now);
   }
  };
  ws.onclose=()=>{clearTimeout(timeout);if(this.closed)return;this.status='Connection lost. Reconnecting…';this.onChange();if(this.token&&this.retries++<6)this.timer=setTimeout(()=>this.open('resume',count,config),Math.min(4000,600*this.retries));else {this.status='The game server is unavailable. It may be waking up; please try again in a moment.';this.onChange();}};
  ws.onerror=()=>{};
 }
 send(m:unknown){if(this.socket?.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify(m));}
 input(inputs:Record<number,Input>){if(!this.state||this.socket?.readyState!==WebSocket.OPEN)return;const now=performance.now(),p={seq:++this.seq,inputs:Object.fromEntries(Object.entries(inputs).map(([id,input])=>[id,{...input}]))};this.pending.push(p);if(this.pending.length>120)this.pending.shift();this.motion.capture(this.state,this.ids);
  if(this.compact){this.outgoing.push(p);if(this.outgoing.length>6)this.outgoing.shift();const previous=this.pending.at(-2),edge=Object.entries(inputs).some(([id,value])=>{const old=previous?.inputs[Number(id)];return value.fire&&!old?.fire||value.hop&&!old?.hop||value.confirm&&!old?.confirm;});if((this.seq-this.lastSent>=2||edge)&&this.socket.bufferedAmount<16384){this.send({type:'input',frames:this.outgoing});this.outgoing=[];this.lastSent=this.seq;}}
  else this.send({type:'input',...p});
  if(now-this.lastPing>2000){this.lastPing=now;this.send({type:'ping',at:now});}
  if(this.state.phase==='playing')for(const id of this.ids)predictDrive(this.state,id,inputs[id],1/60);
 }
 disconnect(){this.decoder.reset();this.motion.reset();this.outgoing=[];this.compact=false;this.lastSent=0;this.lastPing=0;this.receivedAt=0;this.byteStart=0;this.byteCount=0;this.ping=0;this.jitter=0;this.interval=50;this.download=0;this.serverStep=0;this.serverDelay=0;this.closed=true;if(this.timer)clearTimeout(this.timer);this.socket?.close();this.socket=null;this.room=null;this.state=null;this.pending=[];this.seq=0;}
}
