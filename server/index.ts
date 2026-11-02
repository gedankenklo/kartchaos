import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {randomBytes} from 'node:crypto';
import {WebSocketServer,WebSocket} from 'ws';
import {createState,nextRoundState,step,idle,nextRoundConfig,normalizeSpeedClass,ARENA_IDS,normalizeDrivers,type Config,type State,type Input} from '../src/sim';
interface Peer {token:string;socket:WebSocket|null;count:number;drivers:number[];ids:number[];ready:boolean;inputs:Record<number,Input>;seq:number;lastInput:number;disconnected:number;alive:boolean;}
interface Room {code:string;config:Config;peers:Peer[];state:State|null;host:string;}
const rooms=new Map<string,Room>(),root=resolve('dist');
const mime:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.json':'application/json'};
const server=createServer(async(req,res)=>{try{if(req.url==='/health'){res.writeHead(200,{'Content-Type':'application/json'});res.end('{"ok":true}');return;}
 const path=resolve(root,'.'+decodeURIComponent((req.url??'/').split('?')[0]));if(path!==root&&!path.startsWith(root+'/')&&!path.startsWith(root+'\\'))throw Error('path');let file=path;if((await stat(file)).isDirectory())file=resolve(file,'index.html');const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}});
const wss=new WebSocketServer({server,maxPayload:8192});
const send=(p:Peer,m:unknown)=>{if(p.socket?.readyState===WebSocket.OPEN&&p.socket.bufferedAmount<500000)p.socket.send(JSON.stringify(m));};
function broadcast(room:Room){room.config.drivers=room.peers.flatMap(p=>p.drivers);for(const p of room.peers)send(p,{type:'room',room:{code:room.code,host:room.host===p.token,config:room.config,peers:room.peers.map((q,i)=>({name:i===0?'Host':'Driver '+(i+1),count:q.count,drivers:q.drivers,ready:q.ready,connected:!!q.socket}))}});}
function ids(room:Room){room.config.drivers=room.peers.flatMap(p=>p.drivers);let id=0;for(const p of room.peers){p.ids=Array.from({length:p.count},()=>id++);send(p,{type:'joined',token:p.token,code:room.code,ids:p.ids});}}
function config(raw:any,count:number):Config{return {arena:ARENA_IDS.includes(raw?.arena)?raw.arena:'fortress',humans:count,bots:Math.max(count===1?1:0,Math.min(8-count,Number.isInteger(raw?.bots)?raw.bots:3)),duration:[120,180,300].includes(raw?.duration)?raw.duration:180,championship:raw?.championship===true,shuffleMaps:raw?.shuffleMaps===true,speedClass:normalizeSpeedClass(raw?.speedClass),difficulty:['easy','normal','hard'].includes(raw?.difficulty)?raw.difficulty:'normal'};}
function input(raw:any):Input{return {confirm:raw?.confirm===true,gas:Math.max(-1,Math.min(1,Number(raw?.gas)||0)),steer:Math.max(-1,Math.min(1,Number(raw?.steer)||0)),drift:!!raw?.drift,hop:!!raw?.hop,fire:!!raw?.fire};}
wss.on('connection',socket=>{
 let peer:Peer|undefined,room:Room|undefined;let messages=0;const rate=setInterval(()=>{messages=0;},1000);
 socket.on('pong',()=>{if(peer)peer.alive=true;});
 socket.on('message',raw=>{if(++messages>150){socket.close(1008,'Rate limit');return;}let m:any;try{m=JSON.parse(raw.toString());}catch{return;}
  const error=(message:string)=>socket.send(JSON.stringify({type:'error',message}));
  if(m.type==='create'||m.type==='join'||m.type==='resume'){
   if(peer)return;
   const count=Math.max(1,Math.min(4,Math.floor(Number(m.count)||1)));
   if(m.type==='create'){const code=randomBytes(3).toString('hex').toUpperCase();room={code,config:config(m.config,count),peers:[],state:null,host:''};rooms.set(code,room);}
   else room=rooms.get(String(m.code).toUpperCase());
   if(!room){error('Room not found. Check the six-character code.');return;}
   if(m.type==='resume'){
    peer=room.peers.find(p=>p.token===m.token);if(!peer){error('Your room session expired. Please join again.');return;}peer.socket?.close();peer.socket=socket;peer.disconnected=0;peer.alive=true;
   }else{
    if(room.state&&(room.state.phase!=='finished'||room.state.championship&&!room.state.championship.completed)){error(room.state.championship?'This cup is underway. Join after the championship.':'This battle is already underway. Join after the round.');return;}
    if(room.peers.reduce((a,p)=>a+p.count,0)+count>8){error('This room is full. Eight drivers maximum.');return;}
    peer={token:randomBytes(18).toString('hex'),socket,count,drivers:normalizeDrivers(m.config?.drivers,count),ids:[],ready:false,inputs:{},seq:0,lastInput:0,disconnected:0,alive:true};room.peers.push(peer);if(!room.host)room.host=peer.token;
    room.state=null;room.config.humans=room.peers.reduce((a,p)=>a+p.count,0);room.config.bots=Math.min(room.config.bots,8-room.config.humans);
   }
   ids(room);broadcast(room);return;
  }
  if(!peer||!room)return;
  if(m.type==='drivers'&&(!room.state||room.state.phase==='finished'&&(!room.state.championship||room.state.championship.completed))){peer.drivers=normalizeDrivers(m.drivers,peer.count);peer.ready=false;broadcast(room);}
  if(m.type==='shuffleMaps'&&room.host===peer.token&&(!room.state||room.state.phase==='finished')){room.config.shuffleMaps=m.enabled===true;room.config.mapQueue=[];broadcast(room);}
  if(m.type==='championship'&&room.host===peer.token&&!room.state){room.config.championship=m.enabled===true;broadcast(room);}
  if(m.type==='speedClass'&&room.host===peer.token&&(!room.state||room.state.phase==='finished')){room.config.speedClass=normalizeSpeedClass(m.value);broadcast(room);}
  if(m.type==='ready'){peer.ready=!peer.ready;broadcast(room);}
  if(m.type==='input'&&Number.isSafeInteger(m.seq)&&m.seq>peer.seq){for(const id of peer.ids)peer.inputs[id]=input(m.inputs?.[id]);peer.seq=m.seq;peer.lastInput=Date.now();}
  if(m.type==='start'&&room.host===peer.token&&room.peers.every(p=>p.ready&&p.socket||room?.state?.championship&&p.disconnected>0&&Date.now()-p.disconnected>15000)&&(!room.state||room.state.phase==='finished')){
   const previous=room.state;ids(room);room.state=previous?.phase==='finished'?nextRoundState(previous,room.config):createState(room.config);room.config=room.state.config;for(const p of room.peers)if(!p.socket)for(const id of p.ids)room.state.karts[id].bot=true;for(const p of room.peers){p.inputs={};p.seq=0;}broadcast(room);
  }
 });
 socket.on('close',()=>{clearInterval(rate);if(peer&&peer.socket===socket){peer.socket=null;peer.disconnected=Date.now();if(room)broadcast(room);}});
});
// Fixed 60 Hz authority; snapshots at 20 Hz. Server owns pickups, projectiles, and damage.
let tick=0;
setInterval(()=>{tick++;for(const [code,room] of rooms){
 if(room.state){const inputs:Record<number,Input>={};for(const p of room.peers)for(const id of p.ids)inputs[id]=Date.now()-p.lastInput<500?p.inputs[id]??idle():idle();step(room.state,inputs);if(tick%3===0)for(const p of room.peers)send(p,{type:'state',state:room.state,ack:p.seq});}
 for(const p of room.peers)if(!p.socket&&p.disconnected&&Date.now()-p.disconnected>15000){if(room.state)for(const id of p.ids)room.state.karts[id].bot=true;if(room.host===p.token){const replacement=room.peers.find(q=>q.socket);if(replacement){room.host=replacement.token;broadcast(room);}}}
 if(room.peers.every(p=>!p.socket&&Date.now()-p.disconnected>60000))rooms.delete(code);
 if((!room.state||room.state.phase==='finished')&&(!room.state?.championship||room.state.championship.completed)){const expired=room.peers.filter(p=>!p.socket&&Date.now()-p.disconnected>15000);if(expired.length){room.peers=room.peers.filter(p=>!expired.includes(p));if(!room.peers.some(p=>p.token===room.host))room.host=room.peers[0]?.token??'';room.config.humans=room.peers.reduce((a,p)=>a+p.count,0);ids(room);broadcast(room);}}
}},1000/60);
setInterval(()=>{for(const room of rooms.values())for(const p of room.peers)if(p.socket){if(!p.alive){p.socket.terminate();continue;}p.alive=false;p.socket.ping();}},10000);
server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log(`KART CHAOS 64 server on http://localhost:${process.env.PORT||3000}`));

