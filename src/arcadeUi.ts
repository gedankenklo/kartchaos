import {ARENAS,ARENA_IDS,type Arena} from './arenas';
export function arenaPage(arena:Arena){const start=Math.floor(ARENA_IDS.indexOf(arena)/4)*4;return ARENA_IDS.slice(start,start+4);}
export function adjacentArena(arena:Arena,direction:number){return ARENA_IDS[(ARENA_IDS.indexOf(arena)+direction+ARENA_IDS.length)%ARENA_IDS.length];}
export function arenaCard(arena:Arena,selected:Arena){const info=ARENAS[arena];return `<button class="arena-card ${arena===selected?'selected':''}" data-arena="${arena}" aria-label="Select ${info.name}" aria-pressed="${arena===selected}"><div class="arena-art ${arena}"><span class="terrain"></span><i></i><i></i><i></i><i></i><b>${info.icon}</b></div><span>${info.name}<small>${info.size}</small></span><em aria-hidden="true">${arena===selected?'✓':'↗'}</em></button>`;}
export function hudBalloons(count:number){return Array.from({length:3},(_,i)=>`<span class="hud-balloon ${i<count?'':'lost'}" aria-hidden="true"></span>`).join('');}
