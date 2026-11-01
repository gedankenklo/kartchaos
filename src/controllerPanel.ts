import type {Controls} from './input';
export const GAME_VERSION='1.31.0';
export const DEVELOPER='Benjamin Luikenga';
export function controllerPanel(count:number){return `<section class="controller-panel" aria-label="Local controller setup"><h3>READY TO DRIVE?</h3><p>Connect a controller and press a button. Check your inputs here.</p>${Array.from({length:count},(_,slot)=>`<div class="controller-row" data-controller-slot="${slot}"><label>P${slot+1} input<select data-pad="${slot}" aria-label="Player ${slot+1} input device"></select></label><span class="controller-status" role="status"></span><div class="controller-test"><label>Steer <meter data-meter="steer" min="-1" max="1" value="0"></meter></label><label>Gas <meter data-meter="gas" min="0" max="1" value="0"></meter></label><label>Brake <meter data-meter="brake" min="0" max="1" value="0"></meter></label><output class="controller-actions">—</output></div></div>`).join('')}</section>`;}
export function updateControllerPanels(controls:Controls){
 const pads=Array.from(navigator.getGamepads?.()??[]).filter((pad):pad is Gamepad=>!!pad&&pad.connected!==false);
 for(const row of Array.from(document.querySelectorAll<HTMLElement>('[data-controller-slot]'))){
  const slot=Number(row.dataset.controllerSlot),select=row.querySelector<HTMLSelectElement>('select')!,assignment=controls.pads[slot],pad=controls.gamepad(slot);
  const options:[number,string][]=[[-1,'Auto'],[-2,'Keyboard only'],...pads.map(p=>[p.index,`${p.index+1} · ${p.id.slice(0,56)}`] as [number,string])];
  if(assignment>=0&&!pads.some(p=>p.index===assignment))options.push([assignment,`Controller ${assignment+1} · disconnected`]);
  const signature=JSON.stringify(options);
  if(select.dataset.options!==signature){select.replaceChildren(...options.map(([value,label])=>new Option(label,String(value))));select.dataset.options=signature;}
  select.value=String(assignment);
  const status=row.querySelector<HTMLElement>('.controller-status')!,message=pad?`${pad.id} · connected`:assignment>=0?'Controller disconnected · keyboard available':assignment===-2?'Keyboard only':'Keyboard · no controller assigned';
  if(status.textContent!==message)status.textContent=message;row.classList.toggle('is-connected',!!pad);
  for(const [kind,value] of [['steer',pad?.axes[0]??0],['gas',pad?.buttons[7]?.value??0],['brake',pad?.buttons[6]?.value??0]] as const)row.querySelector<HTMLMeterElement>(`[data-meter="${kind}"]`)!.value=value;
  const actions=pad?[[0,'Hop'],[1,'Item'],[2,'Drift'],[4,'Drift'],[5,'Item']].filter(([i])=>pad.buttons[Number(i)]?.pressed).map(([,name])=>name).filter((name,i,all)=>all.indexOf(name)===i).join(' · '):'';
  row.querySelector('output')!.textContent=actions||'—';
 }
}










