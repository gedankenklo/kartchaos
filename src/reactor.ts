// Match-time driven: authoritative server and all clients share warning/beam timing.
export const REACTOR={holeRadius:36,dangerRadius:64,warmup:5,beam:2,interval:26,firstWarning:12};
export function reactorAt(elapsed:number){const t=elapsed-REACTOR.firstWarning,cycle=Math.floor(Math.max(0,t)/REACTOR.interval),age=t-cycle*REACTOR.interval;return {cycle,age,phase:t<0?'idle':age<REACTOR.warmup?'charging':age<REACTOR.warmup+REACTOR.beam?'firing':'idle',charge:t<0?0:Math.min(1,age/REACTOR.warmup),seconds:Math.max(0,REACTOR.warmup-age)} as const;}
