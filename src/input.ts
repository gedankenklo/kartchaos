import {clamp,idle,type Input} from './sim';
export const defaults=[['KeyW','KeyS','KeyA','KeyD','ShiftLeft','Space','KeyE'],['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftRight','Numpad0','Enter'],['KeyI','KeyK','KeyJ','KeyL','KeyO','KeyU','KeyP'],['KeyT','KeyG','KeyF','KeyH','KeyY','KeyV','KeyB']];
export class Controls {
 introHeld=new Map<number,boolean>();
 readIntro(player:number,input:Input,enter=true){const enterTap=player===0&&enter&&this.taps.delete('Enter');const held=input.hop||input.fire||(player===0&&enter&&this.keys.has('Enter'));const previous=this.introHeld.get(player)??false;this.introHeld.set(player,held);return !!enterTap||held&&!previous;}
 spectatorHeld=new Map<number,number>();
 padLocks=new Set<number>();
 heldMenuButtons=new Map<number,Set<number>>();
 keys=new Set<string>(); taps=new Set<string>(); bindings:string[][]; pads:number[]=[-1,-1,-1,-1]; active=false;
 constructor(){try{this.bindings=JSON.parse(localStorage.getItem('kc-bindings')??'null')??defaults.map(a=>[...a]);}catch{this.bindings=defaults.map(a=>[...a]);}
  addEventListener('keydown',e=>{if((e.target as HTMLElement)?.matches('input,select,textarea'))return;if(this.active&&this.bindings.some(b=>b.includes(e.code)))e.preventDefault();if(this.active&&!e.repeat&&this.bindings.some(b=>b[5]===e.code||b[6]===e.code||e.code==='Enter'))this.taps.add(e.code);this.keys.add(e.code);});addEventListener('keyup',e=>this.keys.delete(e.code));addEventListener('blur',()=>{this.keys.clear();this.taps.clear();});
 }
 gamepad(player:number){
  const pads=Array.from(navigator.getGamepads?.()??[]),assigned=this.pads[player];
  if(assigned===-2)return undefined;
  if(assigned>=0)return pads[assigned]??undefined;
  const reserved=new Set(this.pads.filter(index=>index>=0));
  const automatic=pads.filter((pad):pad is Gamepad=>!!pad&&pad.connected!==false&&!reserved.has(pad.index));
  const slot=this.pads.slice(0,player).filter(index=>index===-1).length;
  return automatic[slot];
 }
 assignPad(player:number,index:number){if(index>=0)for(let i=0;i<this.pads.length;i++)if(i!==player&&this.pads[i]===index)this.pads[i]=-1;this.pads[player]=index;this.blockPads();}
 read(player:number):Input {
  const b=this.bindings[player]??defaults[0],key=(i:number)=>this.keys.has(b[i]);
  const fireTap=this.taps.delete(b[6]),hopTap=this.taps.delete(b[5]);
  const input={gas:Number(key(0))-Number(key(1)),steer:Number(key(2))-Number(key(3)),drift:key(4),hop:key(5)||hopTap,fire:key(6)||fireTap};
  // Three.js forward is +Z; a positive angle steers left from a chase camera.
  const pad=this.gamepad(player);
    const blocked=pad?this.heldMenuButtons.get(pad.index):undefined;
  if(pad&&blocked){for(const index of blocked)if(!pad.buttons[index]?.pressed&&(pad.buttons[index]?.value??0)<.55)blocked.delete(index);if(!blocked.size){this.heldMenuButtons.delete(pad.index);this.padLocks.delete(pad.index);}}
  const pressed=(index:number)=>!!pad?.buttons[index]?.pressed&&!blocked?.has(index);
  if(pad){const axis=pad.axes[0]??0,stick=Math.abs(axis)>.12?Math.sign(-axis)*Math.pow((Math.abs(axis)-.12)/.88,1.25):0;input.steer=stick||input.steer;input.gas=Math.max(input.gas,pad.buttons[7]?.value??0)-(pad.buttons[6]?.value??0);if(pressed(0))input.hop=true;if(pressed(1)||pressed(5))input.fire=true;if(pressed(4)||pressed(2))input.drift=true;}
  return this.active?input:idle();
 }
 blockPads(){this.introHeld.clear();this.keys.clear();this.taps.clear();this.padLocks.clear();this.heldMenuButtons.clear();for(const pad of Array.from(navigator.getGamepads?.()??[]))if(pad){const held=new Set([0,1,2,4,5,9].filter(i=>pad.buttons[i]?.pressed||(pad.buttons[i]?.value??0)>.55));if(held.size){this.padLocks.add(pad.index);this.heldMenuButtons.set(pad.index,held);}}}
 readSpectator(player:number,enabled:boolean){const b=this.bindings[player]??defaults[0],pad=this.gamepad(player),locked=pad&&this.padLocks.has(pad.index);const previous=this.keys.has(b[2])||!locked&&(pad?.buttons[4]?.pressed||pad?.buttons[14]?.pressed),next=this.keys.has(b[3])||!locked&&(pad?.buttons[5]?.pressed||pad?.buttons[15]?.pressed),held=(previous?1:0)|(next?2:0),old=this.spectatorHeld.get(player)??held;this.spectatorHeld.set(player,held);return enabled&&held!==3?((held&2)&&!(old&2)?1:(held&1)&&!(old&1)?-1:0):0;}
 save(){localStorage.setItem('kc-bindings',JSON.stringify(this.bindings));}
}

