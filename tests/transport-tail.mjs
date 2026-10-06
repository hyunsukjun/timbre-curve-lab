import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
import {renderOffline} from '../src/offline-render.js';
let Processor;const rate=48000;
vm.runInNewContext(fs.readFileSync(new URL('../src/timbre-worklet.js',import.meta.url),'utf8'),{sampleRate:rate,Float32Array,Math,AudioWorkletProcessor:class{constructor(){this.messages=[];this.port={postMessage:m=>this.messages.push(m)};}},registerProcessor:(n,p)=>Processor=p});
const flat=y=>[{x:0,y},{x:1,y}];
const base=Object.fromEntries('lowpass highpass bandpassCenter bandpassWidth combDelay combFeedback combMix flangerDelay flangerDepth flangerRate flangerFeedback chorusDelay chorusDepth chorusRate chorusMix delayTime delayFeedback delayMix'.split(' ').map(k=>[k,flat(.5)]));
const names=['lowpass','highpass','bandpass','comb','flanger','chorus','delay'],keys=['lowPassEnabled','highPassEnabled','bandPassEnabled','combEnabled','flangerEnabled','chorusEnabled','delayEnabled'];
const l=new Float32Array(12000),r=new Float32Array(l.length);for(let i=0;i<l.length;i++){l[i]=.03*Math.sin(i*2*Math.PI*997/rate);r[i]=.021*Math.sin(i*2*Math.PI*1499/rate);}
const send=(p,data)=>p.port.onmessage({data});
const run=(p,n)=>{const a=new Float32Array(n),b=new Float32Array(n);for(let i=0;i<n;i+=128){const z=Math.min(128,n-i),x=new Float32Array(z),y=new Float32Array(z);p.process([],[[x,y]]);a.set(x,i);b.set(y,i);}return [a,b];};
const difference=(a,b)=>{let max=0;for(let c=0;c<2;c++)for(let i=0;i<a[c].length;i++){assert(Number.isFinite(a[c][i]));max=Math.max(max,Math.abs(a[c][i]-(b[c][i]||0)));}return max;};
const rows=[];
for(const order of [[],['flanger'],['chorus'],['delay'],['chorus','delay'],['delay','chorus'],names,[...names].reverse()]){
 for(const feedback of order.includes('delay')?[0,1]:[0]){
 const curves={...base,delayTime:flat(0),delayFeedback:flat(feedback),delayMix:flat(.5)};
 const settings={outputGain:.95,chainOrder:order,...Object.fromEntries(keys.map((k,i)=>[k,order.includes(names[i])]))};
 const make=()=>{const p=new Processor();send(p,{type:'buffer',left:l,right:r,sampleRate:rate});send(p,{type:'settings',settings});send(p,{type:'curves',...Object.fromEntries(Object.entries(curves).map(([k,v])=>[k.replace('lowpass','lowPass').replace('highpass','highPass').replace('bandpass','bandPass')+'Curve',v]))});return p;};
 const p=make();send(p,{type:'play',token:10});const first=run(p,4096);send(p,{type:'stop',reset:true});send(p,{type:'play',token:11});assert.equal(difference(first,run(p,4096)),0,'stereo restart');
 send(p,{type:'seek',seconds:.1});const seek=run(p,2048),fresh=make();send(fresh,{type:'seek',seconds:.1});send(fresh,{type:'play'});assert.equal(difference(seek,run(fresh,2048)),0,'stereo seek');
 send(p,{type:'stop',reset:true});send(p,{type:'play',token:12});
 const offline=await renderOffline({audioBuffer:{duration:.25,sampleRate:rate,numberOfChannels:2,getChannelData:c=>c?r:l},settings,curves});
 const complete=run(p,offline.left.length+256);assert.equal(p.settings.playing,false);assert.equal(p.messages.filter(m=>m.type==='ended'&&m.token===12).length,1,'single natural end');
 assert(run(p,256).every(a=>a.every(v=>v===0)),'silence after end');
 send(p,{type:'play',token:13});assert.equal(difference(first,run(p,4096)),0,'natural replay');
 rows.push({order,feedback,stereoRestart:true,stereoSeek:true,naturalReplay:true,singleEnd:true,tailSeconds:offline.duration-.25,fullPreviewRenderMax:difference(complete,[offline.left,offline.right])});
 }
}
assert(rows.every(row=>row.fullPreviewRenderMax<2e-7),'full stereo tail parity');
console.log(JSON.stringify(rows,null,2));
