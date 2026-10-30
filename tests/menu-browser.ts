import {GamepadMenu} from '../src/menuPad';
const results:string[]=[];let paused=0,back=0,blocked=0,clicks=0;
document.body.innerHTML='<div id="app"><button id="launch" class="battle-button">Battle</button><label>Speed<select id="speed"><option value="50">50cc</option><option value="100">100cc</option><option value="150">150cc</option></select></label><input id="roomCode" maxlength="6"><button id="art">Art</button></div><pre id="report"></pre>';
const menu=new GamepadMenu({beforeAction:()=>blocked++,pause:()=>paused++,back:()=>back++});
const pad={index:0,connected:true,axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};let now=0;
const update=(enabled=true,playing=false)=>menu.update(enabled,playing,now+=.1,[pad as unknown as Gamepad]);
const press=(n:number,enabled=true,playing=false)=>{pad.buttons[n].pressed=true;pad.buttons[n].value=1;update(enabled,playing);pad.buttons[n].pressed=false;pad.buttons[n].value=0;update(enabled,playing);};
const check=(name:string,ok:boolean)=>{results.push((ok?'PASS ':'FAIL ')+name);if(!ok)throw Error(name);};
try{
 update();document.querySelector('#launch')!.addEventListener('click',()=>clicks++);press(0);check('A activates focused battle button',clicks===1);
 menu.focus(document.querySelector<HTMLElement>('#speed')!);press(0);check('A opens controller select panel',!!menu.layer);menu.focus(Array.from(document.querySelectorAll<HTMLButtonElement>('.pad-option')).find(e=>e.textContent==='150cc'));press(0);check('A commits engine-class choice',document.querySelector<HTMLSelectElement>('#speed')!.value==='150'&&!menu.layer);
 menu.focus(document.querySelector<HTMLElement>('#speed')!);press(14);check('D-pad left changes select',document.querySelector<HTMLSelectElement>('#speed')!.value==='100');
 menu.focus(document.querySelector<HTMLElement>('#roomCode')!);press(0);check('A opens room-code keyboard',!!document.querySelector('.pad-keyboard'));menu.focus(document.querySelector<HTMLElement>('[data-pad-key="Q"]')!);press(0);menu.focus(document.querySelector<HTMLElement>('[data-pad-key="Done"]')!);press(0);check('Controller keyboard commits text',document.querySelector<HTMLInputElement>('#roomCode')!.value==='Q');
 menu.focus(document.querySelector<HTMLElement>('#roomCode')!);press(0);press(1);check('B dismisses keyboard',!menu.layer);press(1);check('B invokes menu back',back===1);press(9,false,true);check('Start pauses battle',paused===1);press(9,true,true);check('Start resumes paused battle',back===2);
 document.querySelector('#app')!.insertAdjacentHTML('beforeend','<div id="overlay"><section class="modal"><button id="modalButton">Close dialog</button></section></div>');menu.ensure();check('Focus remains in active modal',menu.focused?.id==='modalButton');check('Menu actions lock held driving inputs',blocked>=10);
}catch(error){results.push(String(error));}
document.querySelector('#report')!.textContent=results.join('\n');
