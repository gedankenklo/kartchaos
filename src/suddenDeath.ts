export const SUDDEN_DEATH_BEAT=1.15;
export function suddenDeathPulse(remaining:number){if(remaining>45||remaining<=0)return 0;return Math.pow((Math.cos((45-remaining)*Math.PI*2/SUDDEN_DEATH_BEAT)+1)/2,4);}
// Drive cues from match time, so pause and network snapshots cannot accumulate timers.
export class SuddenDeathCues {
 entered=false;beat=-1;
 update(remaining:number,active:boolean):'start'|'pulse'|null{if(remaining>45){this.entered=false;this.beat=-1;return null;}if(!active||remaining<=0)return null;const beat=Math.floor((45-remaining)/SUDDEN_DEATH_BEAT);if(!this.entered){this.entered=true;this.beat=beat;return 'start';}if(beat>this.beat){this.beat=beat;return 'pulse';}return null;}
}
