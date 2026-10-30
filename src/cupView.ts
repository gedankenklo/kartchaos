import {championshipOrder} from './championship';
import type {State} from './sim';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function cupPresentation(state:State,ids:number[]){const cup=state.championship,standings=cup?championshipOrder(cup):[],final=!!cup?.completed;
 const cupTable=cup?`<section class="cup-standings"><h3>${final?'FINAL STANDINGS':'CUP STANDINGS · ROUND '+cup.round+'/4'}</h3>${standings.map((row,i)=>`<div><b>${i+1}. ${esc(row.name)}${ids.includes(row.id)?' · YOU':''}</b><span>${row.points} pts · ${row.wins} ${row.wins===1?'win':'wins'}</span></div>`).join('')}<p>Round points: 10 / 7 / 5 / 4 / 3 / 2 / 1 / 0 by survival order. Cup ties: round wins, then hits.</p></section>`:'';
 const podium=final?`<div class="cup-podium">${[1,0,2].filter(i=>standings[i]).map(i=>`<article class="podium-place place-${i+1}"><div id="podium${i}" class="podium-portrait" aria-label="${esc(standings[i].name)} celebrates ${i+1}${i===0?'st':i===1?'nd':'rd'} place"></div><strong>${i===0?'★ ':''}${esc(standings[i].name)}</strong><b>${i+1}</b><span>${standings[i].points} POINTS</span></article>`).join('')}</div>`:'';
 return {cupTable,podium};
}
