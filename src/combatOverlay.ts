import type {Event,State} from './sim';
import {combatMessage,viewportStyle} from './combatFeedback';
export function feedbackFor(event:Event,localId:number,watchedId:number|undefined,karts:State['karts']){
 const own=combatMessage(event,localId,karts);if(own)return {message:own,viewer:localId,spectating:false};
 if(karts[localId]?.balloons===0&&watchedId!==undefined){const message=combatMessage(event,watchedId,karts);if(message)return {message,viewer:watchedId,spectating:true};}return null;
}
export function combatBadge(event:Event,positive:boolean){const eliminated=!event.blocked&&event.remaining===0,own=event.player===event.source;
 return {title:event.blocked?'SHIELD BLOCKED':eliminated?(positive?'RIVAL ELIMINATED':'KNOCKED OUT'):own&&(event.cause==='mine'||event.cause==='bolt')?'OWN WEAPON!':positive?'HIT CONFIRMED':'BALLOON LOST',icon:event.blocked?'◇':eliminated?'✸':event.cause==='seeker'?'◎':event.cause==='mine'?'✹':event.cause==='bolt'?'↯':event.cause==='ram'?'»':event.cause==='pulse'?'◉':'!',eliminated};
}
export interface OverlayMessage {key:string;text:string;positive:boolean;blocked:boolean;title:string;icon:string;eliminated:boolean;}
export interface OverlayView {messages:OverlayMessage[];angle:number|null;blocked:boolean;}
// Update bearings in place, keeping message nodes alive so entrance animations
// do not restart every frame as a kart turns its camera.
export function renderCombatOverlay(host:HTMLElement,views:OverlayView[],vertical:boolean){
 for(const child of Array.from(host.children))if(Number((child as HTMLElement).dataset.view)>=views.length)child.remove();
 views.forEach((view,index)=>{let panel=host.querySelector<HTMLElement>(`[data-view="${index}"]`);if(!view.messages.length){panel?.remove();return;}
  if(!panel){panel=document.createElement('div');panel.className='combat-view';panel.dataset.view=String(index);panel.innerHTML='<div class="combat-messages"></div><div class="hit-bearing"><span>▲</span></div>';host.appendChild(panel);}panel.style.cssText=viewportStyle(index,views.length,vertical);
  const stack=panel.querySelector<HTMLElement>('.combat-messages')!,keys=new Set(view.messages.map(m=>m.key));for(const card of Array.from(stack.children))if(!keys.has((card as HTMLElement).dataset.key!))card.remove();
  for(const message of view.messages){let card=Array.from(stack.children).find(c=>(c as HTMLElement).dataset.key===message.key) as HTMLElement|undefined;
   if(!card){card=document.createElement('div');card.dataset.key=message.key;card.innerHTML='<span class="combat-icon" aria-hidden="true"></span><div><strong class="combat-title"></strong><span class="combat-copy"></span></div>';stack.appendChild(card);}
   card.className='combat-message '+(message.eliminated?'elimination ': '')+(message.positive?'positive':message.blocked?'blocked':'hurt');for(const [selector,text] of [['.combat-icon',message.icon],['.combat-title',message.title],['.combat-copy',message.text]]){const node=card.querySelector(selector)!;if(node.textContent!==text)node.textContent=text;}
  }
  const bearing=panel.querySelector<HTMLElement>('.hit-bearing')!;bearing.hidden=view.angle===null;bearing.classList.toggle('blocked',view.blocked);bearing.style.transform=`translate(-50%,-50%) rotate(${view.angle??0}deg)`;bearing.setAttribute('aria-label',view.blocked?'Incoming blocked hit direction':'Incoming hit direction');
 });
}
