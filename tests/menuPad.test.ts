import test from 'node:test';
import assert from 'node:assert/strict';
import {GamepadSignals,MenuInputGuard} from '../src/menuPad';
const pad=(button=-1,axis=0)=>({index:0,connected:true,buttons:Array.from({length:16},(_,i)=>({pressed:i===button,value:i===button?1:0})),axes:[axis,0]}) as unknown as Gamepad;
test('results discard late item presses and require release before a fresh back press',()=>{
 const guard=new MenuInputGuard(),signals=new GamepadSignals();
 const poll=(enabled:boolean,t:number,p:Gamepad)=>{const actions=signals.poll([p],t);return guard.accept(enabled,t,[p])?actions:[];};
 poll(false,0,pad());
 assert.deepEqual(poll(true,1,pad(1)),[]);
 assert.deepEqual(poll(true,1.8,pad(1)),[]);
 assert.deepEqual(poll(true,1.9,pad()),[]);
 assert.deepEqual(poll(true,2,pad(1)),[{kind:'back'}]);
});
test('neutral transition still ignores a new button press during the grace period',()=>{
 const guard=new MenuInputGuard();
 assert.equal(guard.accept(true,0,[pad()]),false);
 assert.equal(guard.accept(true,.2,[pad(0)]),false);
 assert.equal(guard.accept(true,.7,[pad(0)]),false);
 assert.equal(guard.accept(true,.8,[pad(-1,1)]),false);
 assert.equal(guard.accept(true,.9,[pad()]),false);
 assert.equal(guard.accept(true,1,[pad(0)]),true);
 guard.accept(false,2,[pad()]);
 assert.equal(guard.accept(true,3,[pad(1)]),false);
});

