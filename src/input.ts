import {clamp,idle,type Input} from './sim';
export const defaults=[['KeyW','KeyS','KeyA','KeyD','ShiftLeft','Space','KeyE'],['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftRight','Numpad0','Enter'],['KeyI','KeyK','KeyJ','KeyL','KeyO','KeyU','KeyP'],['KeyT','KeyG','KeyF','KeyH','KeyY','KeyV','KeyB']];
export class Controls {
 spectatorHeld=new Map<number,number>();
 padLocks=new Set<number>();
 keys=new Set<string>(); taps=new Set<string>(); bindings:string[][]; pads:number[]=[-1,-1,-1,-1]; active=false;
 constructor(){try{this.bindings=JSON.parse(localStorage.getItem('kc-bindings')??'null')??defaults.map(a=>[...a]);}catch{this.bindings=defaults.map(a=>[...a]);}
  addEventListener('keydown',e=>{if((e.target as HTMLElement)?.matches('input,select,textarea'))return;if(this.active&&this.bindings.some(b=>b.includes(e.code)))e.preventDefault();if(this.active&&!e.repeat&&this.bindings.some(b=>b[5]===e.code||b[6]===e.code))this.taps.add(e.code);this.keys.add(e.code);});addEventListener('keyup',e=>this.keys.delete(e.code));addEventListener('blur',()=>{this.keys.clear();this.taps.clear();});
 }
 read(player:number):Input {
  const b=this.bindings[player]??defaults[0],key=(i:number)=>this.keys.has(b[i]);
  const fireTap=this.taps.delete(b[6]),hopTap=this.taps.delete(b[5]);
  const input={gas:Number(key(0))-Number(key(1)),steer:Number(key(2))-Number(key(3)),drift:key(4),hop:key(5)||hopTap,fire:key(6)||fireTap};
  // Three.js forward is +Z; a positive angle steers left from a chase camera.
  const assigned=this.pads[player],pad=navigator.getGamepads?.()[assigned>=0?assigned:player];
  if(pad&&this.padLocks.has(pad.index)&&!pad.buttons.some(b=>b.pressed||b.value>.15)&&Math.abs(pad.axes[0]??0)<.25&&Math.abs(pad.axes[1]??0)<.25)this.padLocks.delete(pad.index);
  if(pad&&!this.padLocks.has(pad.index)){const axis=pad.axes[0]??0,stick=Math.abs(axis)>.12?Math.sign(-axis)*Math.pow((Math.abs(axis)-.12)/.88,1.25):0;input.steer=stick||input.steer;input.gas=Math.max(input.gas,pad.buttons[7]?.value??0)-(pad.buttons[6]?.value??0);if(pad.buttons[0]?.pressed)input.hop=true;if(pad.buttons[1]?.pressed||pad.buttons[5]?.pressed)input.fire=true;if(pad.buttons[4]?.pressed||pad.buttons[2]?.pressed)input.drift=true;}
  return this.active?input:idle();
 }
 blockPads(){this.keys.clear();this.taps.clear();for(const pad of Array.from(navigator.getGamepads?.()??[]))if(pad)this.padLocks.add(pad.index);}
 readSpectator(player:number,enabled:boolean){const b=this.bindings[player]??defaults[0],assigned=this.pads[player],pad=navigator.getGamepads?.()[assigned>=0?assigned:player],locked=pad&&this.padLocks.has(pad.index);const previous=this.keys.has(b[2])||!locked&&(pad?.buttons[4]?.pressed||pad?.buttons[14]?.pressed),next=this.keys.has(b[3])||!locked&&(pad?.buttons[5]?.pressed||pad?.buttons[15]?.pressed),held=(previous?1:0)|(next?2:0),old=this.spectatorHeld.get(player)??held;this.spectatorHeld.set(player,held);return enabled&&held!==3?((held&2)&&!(old&2)?1:(held&1)&&!(old&1)?-1:0):0;}
 save(){localStorage.setItem('kc-bindings',JSON.stringify(this.bindings));}
}
