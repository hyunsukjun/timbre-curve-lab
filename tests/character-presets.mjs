import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {renderOffline} from '../src/offline-render.js';
import {prepareWavChannels} from '../src/wav-output.js';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const block=app.slice(app.indexOf('const defaultCutoffY'),app.indexOf('const curveLabels'));
const box={};vm.runInNewContext(block+';this.curves=curves;this.defaults=defaultCurves;',box);
const curves=JSON.parse(JSON.stringify(box.curves));
for(const [key,curve] of Object.entries(curves)) assert.deepEqual(curve,JSON.parse(JSON.stringify(box.defaults[key]())));
const flat=y=>[{x:0,y},{x:1,y}];
const approx=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
approx(40*450**curves.lowpass[0].y,800);approx(40*450**curves.highpass[0].y,900);
approx(40*450**curves.bandpassCenter[0].y,1500);approx(.5*24**(1-curves.bandpassWidth[0].y),3);
const source=fs.readFileSync(new URL('../src/timbre-worklet.js',import.meta.url),'utf8');
const names=['lowpass','highpass','bandpass','comb','flanger','chorus','delay'];
const keys=['lowPassEnabled','highPassEnabled','bandPassEnabled','combEnabled','flangerEnabled','chorusEnabled','delayEnabled'];
let cases=0;
for(const rate of [44100,48000,96000]){
 let Processor;vm.runInNewContext(source,{sampleRate:rate,Float32Array,Math,AudioWorkletProcessor:class{constructor(){this.port={postMessage(){}}}},registerProcessor:(n,p)=>Processor=p});
 const length=Math.round(rate*.6);const left=Float32Array.from({length},(_,i)=>.12*Math.sin(2*Math.PI*331*i/rate)+.06*Math.sin(2*Math.PI*3701*i/rate));const right=Float32Array.from(left,(x,i)=>-.6*x+.02*Math.sin(i*.37));
 const audioBuffer={duration:length/rate,sampleRate:rate,numberOfChannels:2,getChannelData:i=>i?right:left};
 const render=async(order,c)=>{
  const settings={outputGain:.95,chainOrder:order,...Object.fromEntries(keys.map((k,i)=>[k,order.includes(names[i])]))};
  const p=new Processor(),send=data=>p.port.onmessage({data});send({type:'buffer',left,right,sampleRate:rate});send({type:'curves',...Object.fromEntries(Object.entries(c).map(([k,v])=>[k.replace('lowpass','lowPass').replace('highpass','highPass').replace('bandpass','bandPass')+'Curve',v]))});send({type:'settings',settings});send({type:'play'});
  const result=await renderOffline({audioBuffer,curves:c,settings});
  const frames=length+Math.round(p.delayTailSeconds()*rate);
  const channels=[new Float32Array(frames),new Float32Array(frames)];
  for(let n=0;n<channels[0].length;n+=128){const size=Math.min(128,channels[0].length-n);const out=[new Float32Array(size),new Float32Array(size)];p.process([],[out]);out.forEach((a,i)=>channels[i].set(a,n));}
  const converted=await prepareWavChannels(channels[0],channels[1],rate);
  const comparable=[converted.left,converted.right];
  for(let ch=0;ch<2;ch++){assert.equal(comparable[ch].length,result.left.length);const offline=ch?result.right:result.left;for(let i=0;i<offline.length;i++){assert(Number.isFinite(offline[i]));assert(Math.abs(offline[i])<=.995001);assert(Math.abs(offline[i]-comparable[ch][i])<1e-7,`parity ${rate} ${order} ch${ch} at${i}`);}}
  cases++;return result;
 };
 for(const order of names.map(n=>[n]).concat([names]))await render(order,curves);
 for(const width of [0,.9949,.995,.9951,1]) await render(["bandpass"],{...curves,bandpassWidth:flat(width)});
 await render(["bandpass"],{...curves,bandpassWidth:[{x:0,y:0},{x:.3,y:1},{x:.6,y:.9949},{x:1,y:1}]});
 for(const effect of ['flanger','chorus']) {
  for(const delay of [0,1]) await render([effect],{...curves,[effect+'Delay']:flat(delay),[effect+'Depth']:flat(1)});
  await render([effect],{...curves,[effect+'Delay']:[{x:0,y:1},{x:.5,y:0},{x:1,y:1}],[effect+'Depth']:[{x:0,y:0},{x:.2,y:1},{x:1,y:1}]});
 }
 const dry=await render([],curves);
 for(const mix of [0,.5,1]){
  const result=await render(['flanger'],{...curves,flangerMix:flat(mix)});
  if(mix===0){assert.deepEqual(result.left,dry.left);assert.deepEqual(result.right,dry.right);}
  else assert(result.left.some((v,i)=>Math.abs(v-dry.left[i])>.001));
 }
 await render(['flanger'],{...curves,flangerMix:[{x:0,y:0},{x:.5,y:1},{x:1,y:.2}]});
 const legacy={...curves};delete legacy.flangerMix;
 const old=await render(['flanger'],legacy),explicit=await render(['flanger'],{...curves,flangerMix:flat(.54)});assert.deepEqual(old.left,explicit.left);assert.deepEqual(old.right,explicit.right);
}
console.log(`PASS ${cases} stereo Preview/Render cases at 44.1/48/96 kHz: seven presets, combined chain, MIX dry/wet/automation, legacy 54%, finite and bounded output; initial/reset defaults agree`);
