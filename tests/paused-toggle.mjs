import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../src/timbre-worklet.js',import.meta.url),'utf8');
const send=(p,data)=>p.port.onmessage({data});
const run=(p,n)=>{const a=new Float32Array(n),b=new Float32Array(n);for(let i=0;i<n;i+=128){const z=Math.min(128,n-i),x=new Float32Array(z),y=new Float32Array(z);p.process([],[[x,y]]);a.set(x,i);b.set(y,i);}return [a,b];};
const diff=(a,b)=>{let max=0;for(let c=0;c<2;c++)for(let i=0;i<a[c].length;i++){assert(Number.isFinite(a[c][i]));max=Math.max(max,Math.abs(a[c][i]-b[c][i]));}return max;};
const rate=48000;let P;
vm.runInNewContext(code,{sampleRate:rate,Float32Array,Math,AudioWorkletProcessor:class{constructor(){this.port={postMessage(){}};}},registerProcessor:(n,p)=>P=p});
const names=['lowpass','highpass','bandpass','comb','flanger','chorus','delay'],keys=['lowPassEnabled','highPassEnabled','bandPassEnabled','combEnabled','flangerEnabled','chorusEnabled','delayEnabled'];
const data=Float32Array.from({length:rate},(_,i)=>.1*Math.sin(i*2*Math.PI*997/rate));
const rows=[];
for(let i=0;i<names.length;i++)for(const paused of [false,true]){
 const effect=names[i],key=keys[i];
 const make=()=>{const p=new P();send(p,{type:'buffer',left:data,right:data,sampleRate:rate});send(p,{type:'settings',settings:{chainOrder:[effect],[key]:true}});return p;};
 const control=make(),unchanged=make();
 for(const q of [control,unchanged]){send(q,{type:'play'});run(q,24000);}
 send(unchanged,{type:'stop',reset:false});send(unchanged,{type:'settings',settings:{outputGain:.95}});send(unchanged,{type:'play'});
 assert.equal(diff(run(control,4096),run(unchanged,4096)),0,'active effect state must survive pause/settings');
 const p=make();send(p,{type:'play'});run(p,24000);if(paused)send(p,{type:'stop',reset:false});
 send(p,{type:'settings',settings:{chainOrder:[],[key]:false}});
 // No process quantum between disable and re-enable.
 send(p,{type:'settings',settings:{chainOrder:[effect],[key]:true}});
 if(paused)send(p,{type:'play'});
 const clean=make();send(clean,{type:'seek',seconds:24000/rate});send(clean,{type:'play'});
 rows.push({effect,paused,maxDifference:diff(run(p,4096),run(clean,4096))});
}
console.log(JSON.stringify(rows,null,2));
if(!process.argv.includes('--probe'))assert(rows.every(r=>r.maxDifference===0),'same-quantum bypass must clear disabled state');
