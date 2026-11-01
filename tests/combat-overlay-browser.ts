import {World} from '../src/render';
import {createState,ground,drive,idle,advanceRicochet,type Event} from '../src/sim';
import {combatMessage} from '../src/combatFeedback';
import {combatBadge,renderCombatOverlay,type OverlayView} from '../src/combatOverlay';
const state=createState({arena:'neon',humans:2,bots:0,duration:180,difficulty:'normal'});state.phase='playing';state.lighting='day';state.boxes=[];state.karts[1].name='Rook';
const world=new World(document.querySelector<HTMLCanvasElement>('#reviewCanvas')!);world.distance=12;
const host=document.querySelector<HTMLElement>('#battleFeedback')!,report=document.querySelector<HTMLElement>('#report')!;let split=false,run=0,last=0,serial=100,event:Event={id:100,type:'hit',x:0,y:0,z:60,player:1,source:0,cause:'seeker',remaining:2};
function reset(){const k=state.karts[0];Object.assign(k,{x:0,z:61,y:ground('neon',0,61),angle:0,speed:0,vx:0,vz:0,vy:0,inv:0,balloons:3});Object.assign(state.karts[1],{x:-22,z:45,y:ground('neon',-22,45),angle:0,inv:0,balloons:3});run=0;state.shots=[];}
function drawFeedback(){const views:OverlayView[]=(split?[0,1]:[0]).map(id=>{const message=combatMessage(event,id,state.karts);return {messages:message?[{key:String(event.id),text:message.text,positive:message.positive,blocked:!!event.blocked,...combatBadge(event,message.positive)}]:[],angle:id===event.player?25:null,blocked:!!event.blocked};});renderCombatOverlay(host,views,true);}
function show(detail:Partial<Event>){event={id:++serial,type:'hit',x:0,y:0,z:60,player:1,source:0,cause:'seeker',remaining:2,...detail};drawFeedback();}
document.querySelector('#seeker')!.addEventListener('click',()=>show({}));document.querySelector('#elimination')!.addEventListener('click',()=>show({remaining:0}));document.querySelector('#mine')!.addEventListener('click',()=>show({player:0,source:0,cause:'mine'}));document.querySelector('#shield')!.addEventListener('click',()=>show({player:0,source:0,cause:'mine',blocked:true}));
document.querySelector('#split')!.addEventListener('click',()=>{split=!split;document.querySelector('#app')!.classList.toggle('split-screen',split);drawFeedback();});document.querySelector('#notices')!.addEventListener('click',()=>{const notices=document.querySelector<HTMLElement>('.match-notices')!;notices.hidden=!notices.hidden;});
document.querySelector('#bounce')!.addEventListener('click',()=>{reset();Object.assign(state.karts[0],{speed:24,vz:24});run=1.3;});document.querySelector('#pod')!.addEventListener('click',()=>{reset();state.shots=[{id:44,owner:0,kind:'bolt',x:0,z:64,y:ground('neon',0,64)+.65,angle:0,life:8,age:0,bounces:0}];});
reset();drawFeedback();const initial=host.querySelector('.combat-message');let checks=0;
function frame(ms:number){const dt=Math.min(.04,(ms-last)/1000||1/60);last=ms;if(run>0){run-=dt;drive(state,state.karts[0],{...idle(),gas:1},1/60);}for(const pod of state.shots){pod.life-=dt;advanceRicochet(state,pod,dt);}state.shots=state.shots.filter(p=>p.life>0);world.sync(state,dt,ms/1000);world.render(state,split?[0,1]:[0],true,undefined,ms/1000,dt,true);
 if(checks<3){drawFeedback();const rect=host.getBoundingClientRect(),card=host.querySelector<HTMLElement>('.combat-message')!,bounds=card.getBoundingClientRect();if(rect.height===innerHeight&&rect.width===innerWidth&&bounds.top>=0&&bounds.bottom<=innerHeight&&card===initial){checks++;report.textContent='PASS full viewport, visible message, stable animation nodes';}else report.textContent='FAIL overlay layout';}
 requestAnimationFrame(frame);
}requestAnimationFrame(frame);
