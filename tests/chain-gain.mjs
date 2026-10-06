import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {renderOffline} from '../src/offline-render.js';
const rate=48000;
let Processor;
vm.runInNewContext(fs.readFileSync(new URL('../src/timbre-worklet.js',import.meta.url),'utf8'),{sampleRate:rate,Float32Array,Math,AudioWorkletProcessor:class{constructor(){this.port={postMessage(){}};}},registerProcessor:(_name,p)=>Processor=p});
const names=['lowpass','highpass','bandpass','comb','flanger','chorus','delay'];
const keys=['lowPassEnabled','highPassEnabled','bandPassEnabled','combEnabled','flangerEnabled','chorusEnabled','delayEnabled'];
const send=(p,data)=>p.port.onmessage({data});
const settingsFor=order=>({chainOrder:order,outputGain:.95,...Object.fromEntries(keys.map((k,i)=>[k,order.includes(names[i])]))});
function make(left,right,settings){const p=new Processor();send(p,{type:'buffer',left,right,sampleRate:rate});send(p,{type:'settings',settings});send(p,{type:'play'});return p;}
function run(p,n){const out=[new Float32Array(n),new Float32Array(n)];for(let i=0;i<n;i+=128){const z=Math.min(128,n-i),block=[new Float32Array(z),new Float32Array(z)];p.process([],[block]);for(let c=0;c<2;c++)out[c].set(block[c],i);}return out;}
function difference(a,b,scale=1){let max=0;for(let c=0;c<2;c++)for(let i=0;i<a[c].length;i++){assert(Number.isFinite(a[c][i])&&Number.isFinite(b[c][i]));max=Math.max(max,Math.abs(a[c][i]*scale-b[c][i]));}return max;}
const left=Float32Array.from({length:rate*2},(_,i)=>.12*Math.sin(2*Math.PI*997*i/rate));
const right=Float32Array.from(left,(_,i)=>.09*Math.sin(2*Math.PI*1499*i/rate));
const reorder=[];
for(const order of [['flanger','chorus'],['comb','delay'],names])for(const paused of [false,true]){
 const settings=settingsFor(order),p=make(left,right,settings),control=make(left,right,settings);
 run(p,24000);run(control,24000);
 if(paused)send(p,{type:'stop',reset:false});
 // No audio frame elapses between changing order and restoring it.
 send(p,{type:'settings',settings:{chainOrder:[...order].reverse()}});
 send(p,{type:'settings',settings:{chainOrder:order}});
 if(paused)send(p,{type:'play'});
 const max=difference(run(p,4096),run(control,4096));assert.equal(max,0,'reordering must retain active state');
 send(p,{type:'settings',settings:{chainOrder:[...order].reverse()}});
 const changed=run(p,4096);assert(changed.every(a=>a.every(Number.isFinite)));
 reorder.push({order,paused,roundTripMaxDifference:max,reversedOutputFinite:true});
}
const gain=[];
for(const amplitude of [.1,.92/.95,.96,1.02,1.1,2.5]){
 const l=Float32Array.from({length:4800},(_,i)=>amplitude*Math.sin(2*Math.PI*1000*i/rate)),r=Float32Array.from(l,x=>-x);
 const settings=settingsFor([]),preview=run(make(l,r,settings),l.length);
 const rendered=await renderOffline({audioBuffer:{duration:l.length/rate,sampleRate:rate,numberOfChannels:2,getChannelData:c=>c?r:l},settings,curves:{}});
 const peak=Math.max(...preview[0].map(Math.abs)),scale=Math.min(1,.98/peak);
 const adjustedError=difference(preview,[rendered.left,rendered.right],scale);
 assert(adjustedError<2e-7,'only documented global normalization may differ');
 assert(peak<=.9950001);
 assert(Math.max(...rendered.left.map(Math.abs))<=.9800001);
 for(let i=0;i<l.length;i++)assert.equal(preview[0][i]+preview[1][i],0,'limiter sign symmetry');
 gain.push({amplitude,previewPeak:peak,renderPeak:Math.max(...rendered.left.map(Math.abs)),renderScale:scale,levelDifferenceDb:20*Math.log10(scale),adjustedError});
}
console.log(JSON.stringify({reorder,gain},null,2));
