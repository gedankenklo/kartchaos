import {broadcastStandings,drawTacticalMap,type ChaosDirector} from './broadcast';
import {COLORS,type State} from './sim';
const escape=(text:string)=>text.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
export function updateBroadcast(host:HTMLElement|null,s:State,ids:number[],director:ChaosDirector,mode:'camera'|'map'){
 if(!host)return;host.hidden=ids.length!==3;if(host.hidden)return;
 if(host.dataset.mode!==mode){host.dataset.mode=mode;host.innerHTML=`<header><strong><i></i> ${mode==='map'?'TACTICAL MAP':'CHAOS CAM'} <small>LIVE</small></strong><button data-action="broadcast" aria-label="Switch fourth tile to ${mode==='map'?'Chaos Cam':'tactical map'}">${mode==='map'?'Chaos Cam ↗':'Map ↗'}</button></header><canvas class="broadcast-map" width="640" height="520" aria-label="Live tactical arena map" ${mode==='map'?'':'hidden'}></canvas><aside class="broadcast-standings" aria-label="Live battle standings"></aside><div class="broadcast-focus"></div><div class="broadcast-caption" role="status"></div>`;}
 const rows=broadcastStandings(s),board=host.querySelector('.broadcast-standings')!,markup=`<div class="broadcast-columns"><b>DRIVER</b><b>●</b><b>KO</b>${s.championship?'<b>PTS</b>':''}</div>`+rows.map(row=>`<div class="broadcast-entry ${row.balloons?'':'out'}"><span><i style="background:${COLORS[row.driver]}"></i>${escape(row.name)}${ids.includes(row.id)?' <small>P'+(ids.indexOf(row.id)+1)+'</small>':''}</span><b>${row.balloons}</b><b>${row.kills}</b>${s.championship?`<b>${row.points??0}</b>`:''}</div>`).join('');if(board.innerHTML!==markup)board.innerHTML=markup;board.classList.toggle('has-cup',!!s.championship);
 host.querySelector('.broadcast-focus')!.textContent=mode==='map'?'WHITE RINGS = LOCAL DRIVERS · VIOLET = ITEMS':director.focus(s).name;
 const caption=host.querySelector('.broadcast-caption')!,captionText=s.tick<director.captionUntil?director.caption:s.phase==='countdown'?'GET READY FOR SOME CHAOS.':s.phase==='finished'?'THAT’S A WRAP.':'THREE DRIVERS. ONE LIVE BROADCAST.';if(caption.textContent!==captionText)caption.textContent=captionText;
 if(mode==='map')drawTacticalMap(host.querySelector('canvas')!,s,ids);
}

