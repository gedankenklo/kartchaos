import type {Event,State} from './sim';
const weapons={bolt:'Ricochet Pod',seeker:'Seeker',mine:'Mine',ram:'Turbo ram',pulse:'Shockwave'};
export function hitDirection(event:Event,cameraHeading:number):number|null {
 if(event.fromX===undefined||event.fromZ===undefined)return null;
 const dx=event.fromX-event.x,dz=event.fromZ-event.z;if(Math.hypot(dx,dz)<.05)return null;
 const relative=Math.atan2(dx,dz)-cameraHeading;
 return Math.atan2(-Math.sin(relative),Math.cos(relative))*180/Math.PI||0;
}
export function combatMessage(event:Event,viewer:number,karts:State['karts']):{text:string;positive:boolean}|null {
 if(event.type!=='hit')return null;const victim=karts[event.player],attacker=event.source===undefined?undefined:karts[event.source];if(!victim)return null;
 const cause=event.cause,weapon=cause&&cause in weapons?weapons[cause as keyof typeof weapons]:null,own=event.source===event.player;
 if(viewer===event.player){
  if(event.blocked)return {text:own&&cause==='mine'?'Shield blocked your own mine!':own&&cause==='bolt'?'Shield blocked your ricochet!':weapon?'Shield blocked '+weapon.toLowerCase()+'!':'Shield blocked!',positive:false};
  let text=own&&cause==='mine'?'Your own mine!':own&&cause==='bolt'?'Your own ricochet!':cause==='ram'?'Turbo ram from '+(attacker?.name??'a rival')+'!':cause==='fall'?'Fell off the arena!':cause==='lava'?'Lava!':cause==='ring'?'Outside the danger ring!':cause==='timeout'?'Round over!':weapon?weapon+' hit'+(attacker&&!own?' · '+attacker.name:'')+'!':'Balloon popped!';
  if((event.remaining??victim.balloons)===0)text+=' Eliminated.';return {text,positive:false};
 }
 if(event.source===viewer&&!own)return {text:event.blocked?victim.name+' blocked your '+(weapon?.toLowerCase()??'hit')+'!':(cause==='ram'?'Turbo ram! ':cause==='bolt'?'Ricochet hit! ':'Hit! ')+victim.name+((event.remaining??victim.balloons)===0?' eliminated!':' lost a balloon!'),positive:!event.blocked};
 return null;
}
export function viewportStyle(index:number,count:number,vertical:boolean){const cols=count>2?2:count===2&&vertical?2:1,rows=Math.ceil(count/cols);return `left:${index%cols*100/cols}%;top:${Math.floor(index/cols)*100/rows}%;width:${100/cols}%;height:${100/rows}%`;}


