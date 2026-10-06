import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../src/timbre-worklet.js',import.meta.url),'utf8');
const send=(p,data)=>p.port.onmessage({data});
const run=(p,n)=>{const a=new Float32Array(n),b=new Float32Array(n);for(let i=0;i<n;i+=128){const z=Math.min(128,n-i),x=new Float32Array(z),y=new Float32Array(z);p.process([],[[x,y]]);a.set(x,i);b.set(y,i);}return [a,b];};
const diff=(a,b)=>{let max=0;for(let c=0;c<2;c++)for(let i=0;i<a[c].length;i++){assert(Number.isFinite(a[c][i]));max=Math.max(max,Math.abs(a[c][i]-b[c][i]));}return max;};
const rows=[],toggles=[];
for(const rate of [44100,48000]){
 let P;vm.runInNewContext(code,{sampleRate:rate,Float32Array,Math,AudioWorkletProcessor:class{constructor(){this.messages=[];this.port={postMessage:m=>this.messages.push(m)};}},registerProcessor:(n,p)=>P=p});
 for(const sourceRate of [44100,48000,88200,96000])for(const effect of [null,'flanger','chorus']){
  const data=Float32Array.from({length:Math.round(sourceRate*.2)},(_,i)=>.1*Math.sin(2*Math.PI*997*i/sourceRate));
  const make=()=>{const p=new P();send(p,{type:'buffer',left:data,right:data,sampleRate:sourceRate});send(p,{type:'settings',settings:{chainOrder:effect?[effect]:[],...(effect?{[effect+'Enabled']:true}:{})}});return p;};
  const p=make();send(p,{type:'play'});const first=run(p,1024);send(p,{type:'stop',reset:true});send(p,{type:'play'});assert.equal(diff(first,run(p,1024)),0);
  send(p,{type:'seek',seconds:.1});const seek=run(p,1024),fresh=make();send(fresh,{type:'seek',seconds:.1});send(fresh,{type:'play'});assert.equal(diff(seek,run(fresh,1024)),0);
  send(p,{type:'stop',reset:true});send(p,{type:'play'});let frames=0;while(p.settings.playing&&frames<rate){run(p,1);frames++;}assert(Math.abs(frames-rate*.2)<=1);assert.equal(p.messages.filter(m=>m.type==='ended').length,1);send(p,{type:'play'});assert.equal(diff(first,run(p,1024)),0);
  rows.push({rate,sourceRate,effect,frames,expectedFrames:rate*.2,restart:true,seek:true,naturalReplay:true});
  if(sourceRate===rate&&effect){
   const q=make();send(q,{type:'play'});run(q,2048);send(q,{type:'settings',settings:{[effect+'Enabled']:false,chainOrder:[]}});run(q,128);
   const left=q[effect+'LeftState'].phase,right=q[effect+'RightState'].phase;
   assert.equal(left,0);assert.equal(right,effect==='flanger'?.25:.5);
   const clean=make();send(clean,{type:'settings',settings:{[effect+'Enabled']:false,chainOrder:[]}});send(clean,{type:'play'});run(clean,2176);
   for(const target of [q,clean])send(target,{type:'settings',settings:{[effect+'Enabled']:true,chainOrder:[effect]}});
   const reenableDifference=diff(run(q,1024),run(clean,1024));assert.equal(reenableDifference,0);
   toggles.push({rate,effect,afterBypassPhaseLeft:left,afterBypassPhaseRight:right,reenableDifference});
  }
 }
}
console.log('rate cases',rows.length,'toggles',toggles);
