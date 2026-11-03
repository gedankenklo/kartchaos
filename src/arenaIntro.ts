import {ARENAS,type Arena} from './arenas';
export const INTRO_SECONDS=4,ROUND_COUNTDOWN=INTRO_SECONDS+3;
export function introActive(s:{phase:string;countdown:number}){return s.phase==='countdown'&&s.countdown>3;}
const tips:Record<Arena,[string,string]>={
 fortress:['OWN THE HIGH GROUND','Use ramps and bridges to flank rivals. Lower lanes pass beneath the bridges.'],
 sky:['WATCH YOUR STEP','The edges are open. A well-timed bump can send a rival overboard.'],
 neon:['BANK, BOUNCE, BATTLE','Ricochets rebound from the rim blocks. Watch the open outer edge.'],
 yard:['KEEP MOVING','Use the containers for cover, then circle around for a clear shot.'],
 depot:['STEAL THEIR FLAG. BRING IT HOME.','Your flag must be home to capture. Every rival loses one balloon.'],
 quarry:['FARMYARD FLOORS','Four broad ramps lead to the middle deck. Climb again at either end for the roof. Watch for strolling cows below!'],
 castle:['MIND THE LAVA','Cross the causeways carefully. Falling into lava costs a balloon.'],
 beach:['SAND, SURF, CROSSFIRE','Take the ramp entrances onto the boardwalks. Palms provide solid cover.'],
 stadium:['SCORE A GOAL. POP RIVAL BALLOONS.','Teams are assigned randomly. Own goals cost your team a balloon each.'],
 foundry:['RIDE THE CONVEYORS','Belts push your kart. Use their direction for speed or a surprise attack.'],
 harbour:['HOLD YOUR LINE','The ice basin is slippery. Climb onto the docks for firmer grip.'],
 ruins:['USE THE HIGH ROUTES','Climb the temple terraces. Cross the ravines carefully.'],
 starfall:['STEAL THEIR FLAG. BRING IT HOME.','Your flag must be home to capture. Every rival loses one balloon.'],
 glacier:['SLIDE LOW. GRIP HIGH.','Only the base ice is slippery. Ramps and upper decks have normal grip.'],
 crypt:['LOOK OUT BELOW','Growing shadows warn of volcanic rocks. Leave the marked area before impact.'],
 starcore:['CLEAR THE CORE','The reactor warns before firing. Leave the amber danger zone and avoid the central shaft.']};
export function arenaBriefing(arena:Arena){return {name:ARENAS[arena].name,mode:arena==='depot'||arena==='starfall'?'CAPTURE THE FLAG':arena==='stadium'?'SOCCER BATTLE':'BALLOON BATTLE',headline:tips[arena][0],tip:tips[arena][1]};}
export function introPose(arena:Arena,countdown:number,reduced=false,aspect=1.6){const progress=Math.max(0,Math.min(1,(ROUND_COUNTDOWN-countdown)/INTRO_SECONDS)),angle=.58+(reduced?0:progress*.36),e=ARENAS[arena].extent*ARENAS[arena].scale,fit=Math.max(1,.95/aspect);return {x:Math.sin(angle)*e*2.7*fit,y:e*1.9*fit,z:Math.cos(angle)*e*2.7*fit,progress};}
export function arenaIntroMarkup(arena:Arena,teams:{player:number;team:'blue'|'orange'}[]=[]){const b=arenaBriefing(arena);return `<section id="arenaIntro" class="arena-intro" aria-label="Arena introduction" hidden><span class="intro-mode">${b.mode}</span><h2>${b.name}</h2><strong>${b.headline}</strong><p>${b.tip}</p>${teams.length?`<div class="intro-teams">${teams.map(t=>`<span class="intro-team ${t.team}">P${t.player} · ${t.team.toUpperCase()} TEAM</span>`).join('')}</div>`:''}<div id="introReady" class="intro-ready" aria-live="polite"></div><div class="intro-footer"><span>READ THE BRIEFING · CONFIRM WHEN YOU ARE READY.</span><div class="intro-progress"><i id="introProgress"></i></div></div></section>`;}
