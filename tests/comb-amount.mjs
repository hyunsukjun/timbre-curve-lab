import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const offline=fs.readFileSync(new URL('../src/offline-render.js',import.meta.url),'utf8');const ctx={};vm.runInNewContext(offline.slice(offline.indexOf('function processComb('),offline.indexOf('function readDelayBuffer('))+';this.run=processComb;',ctx);
let Processor;vm.runInNewContext(fs.readFileSync(new URL('../src/timbre-worklet.js',import.meta.url),'utf8'),{sampleRate:48000,Float32Array,Math,AudioWorkletProcessor:class{constructor(){this.port={postMessage(){}}}},registerProcessor:(n,p)=>Processor=p});
const p=new Processor(),make=()=>({buffer:new Float32Array(5760),damp:0,delayMs:4,index:0});
const states=[make(),make(),make(),make(),make()],live=make();let hasTail=false;
for(let i=0;i<12000;i++){
 const input=i<4800?.1*Math.sin(i*.073):0;
 const dry=ctx.run(input,states[0],4,.72,0,48000),full=ctx.run(input,states[1],4,.72,1,48000),half=ctx.run(input,states[2],4,.72,.5,48000);
 assert.equal(dry,input);assert(Math.abs(half-(dry+full)/2)<1e-15);
 assert.equal(full,p.processComb(input,live,4,.72,1));
 assert.equal(ctx.run(input,states[3],4,.72,-1,48000),dry);
 assert.equal(ctx.run(input,states[4],4,.72,2,48000),full);
 if(i>4800 && Math.abs(full)>1e-6)hasTail=true;
}
assert(hasTail);assert.deepEqual(states[0].buffer,states[1].buffer);
console.log('PASS Comb Amount: 0% original, 50% blend, 100% comb result, clamp, feedback independent of Amount, realtime/offline parity');
