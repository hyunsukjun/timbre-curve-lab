import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
import {renderOffline} from '../src/offline-render.js';
let Processor;const rate=48000;
const context=vm.createContext({sampleRate:rate,Float32Array,Math,AudioWorkletProcessor:class{constructor(){this.port={postMessage(){}};}},registerProcessor:(name,p)=>Processor=p});
vm.runInContext(fs.readFileSync(new URL('../src/timbre-worklet.js',import.meta.url),'utf8'),context);
const flat=y=>[{x:0,y},{x:1,y}];
const curves=Object.fromEntries('lowpass highpass bandpassCenter bandpassWidth combDelay combFeedback combMix flangerDelay flangerDepth flangerRate flangerFeedback chorusDelay chorusDepth chorusRate chorusMix delayTime delayFeedback delayMix'.split(' ').map(k=>[k,flat(.5)]));
const names=['lowpass','highpass','bandpass','comb','flanger','chorus','delay'],keys=['lowPassEnabled','highPassEnabled','bandPassEnabled','combEnabled','flangerEnabled','chorusEnabled','delayEnabled'];
const left=Float32Array.from({length:rate},(_,i)=>.1*Math.sin(2*Math.PI*997*i/rate)),right=Float32Array.from(left,x=>-.7*x);
const send=(p,data)=>p.port.onmessage({data});
const run=(p,n)=>{const out=new Float32Array(n);for(let i=0;i<n;i+=128){const size=Math.min(128,n-i),a=new Float32Array(size),b=new Float32Array(size);p.process([],[[a,b]]);out.set(a,i);}return out;};
const diff=(a,b)=>{let max=0,sum=0;for(let i=0;i<a.length;i++){const d=a[i]-b[i];max=Math.max(max,Math.abs(d));sum+=d*d;}return {max,rms:Math.sqrt(sum/a.length)};};
const rows=[];
for(const order of [[],...names.map(n=>[n]),['chorus','delay'],names]){
 const settings={outputGain:.95,chainOrder:order,...Object.fromEntries(keys.map((k,i)=>[k,order.includes(names[i])]))};
 const make=()=>{const p=new Processor();send(p,{type:'buffer',left,right,sampleRate:rate});send(p,{type:'curves',...Object.fromEntries(Object.entries(curves).map(([k,v])=>[k.replace('lowpass','lowPass').replace('highpass','highPass').replace('bandpass','bandPass')+'Curve',v]))});send(p,{type:'settings',settings});return p;};
 const p=make();send(p,{type:'play'});const first=run(p,24000);send(p,{type:'stop',reset:true});send(p,{type:'play'});const replay=run(p,24000);
 send(p,{type:'seek',seconds:.25});const seek=run(p,12000);const fresh=make();send(fresh,{type:'seek',seconds:.25});send(fresh,{type:'play'});const freshSeek=run(fresh,12000);
 const offline=await renderOffline({audioBuffer:{duration:1,sampleRate:rate,numberOfChannels:2,getChannelData:i=>i?right:left},curves,settings});
 rows.push({order,restart:diff(first,replay),seek:diff(seek,freshSeek),previewRenderFirstHalf:diff(first,offline.left.subarray(0,24000)),renderDuration:offline.duration});
}
assert(rows.every(r=>r.restart.max===0&&r.seek.max===0&&r.previewRenderFirstHalf.max===0));console.log(rows);
