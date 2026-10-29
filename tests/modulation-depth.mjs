import {PlaybackBoundary} from "../src/playback-boundary.js";
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/timbre-worklet.js',import.meta.url),'utf8').replace(/^import .*$/gm,'');
let count=0;
for(const rate of [44100,48000,96000]){
 let Processor;vm.runInNewContext(source,{PlaybackBoundary,sampleRate:rate,Float32Array,Math,AudioWorkletProcessor:class{constructor(){this.port={postMessage(){}}}},registerProcessor:(n,p)=>Processor=p});
 for(const [effect,floor,maxDepth,delays] of [['Flanger',.25,10,[.5,3,10]],['Chorus',5,20,[10,22,35]]])for(const delay of delays)for(const depth of [0,effect==='Flanger'?2.5:4,maxDepth]){
  const p=new Processor();let read=0;p.readDelayBuffer=(state,d)=>{read=d;return .03;};
  const state={buffer:new Float32Array(Math.ceil(rate*.08)),index:0,phase:0,damp:0,delayMs:delay};let floorSamples=0;
  for(let i=0;i<128;i++){
   state.phase=i/128;
   if(effect==='Flanger')p.processFlanger(.1,state,delay,depth,.25,.6,.5);else p.processChorus(.1,state,delay,depth,.8,.5);
   const applied=Math.min(depth,delay-floor),expected=delay+Math.sin(i/128*2*Math.PI)*applied;
   assert(Math.abs(read-expected)<1e-12);assert(read>=floor-1e-12);
   if(Math.abs(read-floor)<1e-10)floorSamples++;
  }
  assert(floorSamples<=1,'no clipped LFO plateau');count++;
 }
 // Parameter motion across the limiting boundary remains bounded and finite.
 for(const effect of ['Flanger','Chorus']){
  const p=new Processor(),floor=effect==='Flanger'?.25:5;
  p.readDelayBuffer=(s,d)=>{assert(d>=floor-1e-12&&Number.isFinite(d));return .01;};
  const state={buffer:new Float32Array(Math.ceil(rate*.08)),index:0,phase:0,damp:0,delayMs:effect==='Flanger'?3:18};
  for(let i=0;i<4096;i++){if(effect==='Flanger')p.processFlanger(.1,state,i<2048?10:.5,10,5,.85,.5);else p.processChorus(.1,state,i<2048?35:10,20,3,.5);}
 }
}
console.log(`PASS ${count} rate/delay/depth trajectories: sinusoidal range, no floor plateau, zero depth, default depth, extreme depth and moving delay bounds`);
