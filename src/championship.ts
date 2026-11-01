import {soccerTeam} from './football';
import {ARENA_IDS,type Arena} from './arenas';
import type {State,Kart,Config} from './sim';
export const ROUND_POINTS=[10,7,5,4,3,2,1,0];
export interface Standing {id:number;driver:number;name:string;points:number;wins:number;hits:number;}
export interface Championship {round:number;schedule:Arena[];standings:Standing[];scored:boolean;completed:boolean;}
export function createChampionship(config:Config,karts:Kart[],rng= Math.random):Championship {const pool=ARENA_IDS.filter(a=>a!==config.arena);for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999,rng()))*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return {round:1,schedule:[config.arena,...pool.slice(0,3)],standings:karts.map(k=>({id:k.id,driver:k.driver,name:k.name,points:0,wins:0,hits:0})),scored:false,completed:false};}
export function roundOrder(s:State){return [...s.karts].sort((a,b)=>(s.winningTeam?Number(soccerTeam(b)===s.winningTeam)-Number(soccerTeam(a)===s.winningTeam):Number(b.id===s.winner)-Number(a.id===s.winner))||b.balloons-a.balloons||(b.eliminatedAt??0)-(a.eliminatedAt??0)||b.kills-a.kills||a.damage-b.damage||a.id-b.id);}
export function scoreChampionship(s:State){const cup=s.championship;if(!cup||cup.scored||s.phase!=='finished')return;roundOrder(s).forEach((k,i)=>{const row=cup.standings.find(r=>r.id===k.id);if(row){row.points+=s.winningTeam?(soccerTeam(k)===s.winningTeam?10:5):ROUND_POINTS[i]??0;row.wins+=Number(s.winningTeam?soccerTeam(k)===s.winningTeam:k.id===s.winner);row.hits+=k.hits??0;}});cup.scored=true;cup.completed=cup.round===4;}
export function championshipOrder(cup:Championship){return [...cup.standings].sort((a,b)=>b.points-a.points||b.wins-a.wins||b.hits-a.hits||a.id-b.id);}
