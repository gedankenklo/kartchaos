import {drive,type Config,type Input,type State} from './sim';
// Prediction may move a local kart, but only authority may publish event IDs.
// Otherwise a predicted crash/fall can advance the UI past a later real hit.
export function predictDrive(state:State,id:number,input:Input,dt:number){const events=state.events,serial=state.serial;state.events=[];try{drive(state,state.karts[id],input,dt);}finally{state.events=events;state.serial=serial;}}
export interface RoomInfo {code:string; host:boolean; peers:{name:string;count:number;drivers?:number[];ready:boolean;connected:boolean}[]; config:Config;}
export class Network {
 socket:WebSocket|null=null;state:State|null=null;room:RoomInfo|null=null;ids:number[]=[];seq=0;pending:{seq:number;inputs:Record<number,Input>}[]=[]; token='';code='';url='';status='';retries=0;closed=true;onChange:()=>void=()=>{};onState:()=>void=()=>{};timer:ReturnType<typeof setTimeout>|null=null;
 connect(url:string,action:'create'|'join',count:number,config:Config,code=''){
  this.disconnect();this.closed=false;this.url=url;this.code=code;this.token='';this.status='Connecting…';this.open(action,count,config);this.onChange();
 }
 open(action:'create'|'join'|'resume',count:number,config:Config){
  try{this.socket=new WebSocket(this.url);}catch{this.status='Enter a valid ws:// or wss:// server address.';this.onChange();return;}
  const ws=this.socket;const timeout=setTimeout(()=>{if(ws.readyState!==WebSocket.OPEN)ws.close();},8000);
  ws.onopen=()=>{clearTimeout(timeout);this.retries=0;ws.send(JSON.stringify({type:action,code:this.code,token:this.token,count,config}));};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch{return;}
   if(m.type==='error'){this.status=m.message;this.onChange();return;}
   if(m.type==='joined'){this.token=m.token;this.code=m.code;this.ids=m.ids;this.status='Connected';this.onChange();}
   if(m.type==='room'){this.room=m.room;this.onChange();}
   if(m.type==='state'){
    const next=m.state as State;if(next.phase==='countdown'&&this.state?.phase==='finished'){this.pending=[];this.seq=0;}this.pending=this.pending.filter(p=>p.seq>m.ack);this.state=next;
    // Reconcile to the authoritative snapshot, then replay unacknowledged local inputs.
    if(next.phase==='playing')for(const p of this.pending)for(const id of this.ids)if(next.karts[id])predictDrive(next,id,p.inputs[id],1/60);
    this.onState();
   }
  };
  ws.onclose=()=>{clearTimeout(timeout);if(this.closed)return;this.status='Connection lost. Reconnecting…';this.onChange();if(this.token&&this.retries++<6)this.timer=setTimeout(()=>this.open('resume',count,config),Math.min(4000,600*this.retries));else {this.status='The game server is unavailable. It may be waking up; please try again in a moment.';this.onChange();}};
  ws.onerror=()=>{};
 }
 send(m:unknown){if(this.socket?.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify(m));}
 input(inputs:Record<number,Input>){if(!this.state||this.socket?.readyState!==WebSocket.OPEN)return;const p={seq:++this.seq,inputs};this.pending.push(p);if(this.pending.length>120)this.pending.shift();this.send({type:'input',...p});if(this.state.phase==='playing')for(const id of this.ids)if(this.state.karts[id])predictDrive(this.state,id,inputs[id],1/60);}
 disconnect(){this.closed=true;if(this.timer)clearTimeout(this.timer);this.socket?.close();this.socket=null;this.room=null;this.state=null;this.pending=[];this.seq=0;}
}
