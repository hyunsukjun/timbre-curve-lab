import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const offline=fs.readFileSync(new URL('../src/offline-render.js',import.meta.url),'utf8');
const kernel=offline.slice(offline.indexOf('function processBandPass('),offline.indexOf('function processComb('));
const ctx={};vm.runInNewContext(kernel+';this.filter=processBandPass;',ctx);
let count=0,maxError=0;
function response(rate,hz,center,q){let inputPower=0,outputPower=0;const state={ic1:0,ic2:0};const n=rate;for(let i=0;i<n;i++){const x=.05*Math.sin(2*Math.PI*hz*i/rate),y=ctx.filter(x,state,center,q,rate);assert(Number.isFinite(y));if(i>n/2){inputPower+=x*x;outputPower+=y*y;}}return 10*Math.log10(outputPower/inputPower);}
for(const rate of [44100,48000,96000])for(const center of [100,1500,10000])for(const q of [.5,3,12]){const db=response(rate,center,center,q);maxError=Math.max(maxError,Math.abs(db));assert(Math.abs(db)<.002,`center gain ${rate}/${center}/${q}: ${db}`);count++;}
for(const width of [.9949,.995,.9951,1]){const q=.5*24**(1-width);const db=response(48000,100,1500,q);assert(db < -15,`wide band must still filter: ${width} ${db}`);}
const before=response(48000,100,1500,.5*24**(1-.9949)),after=response(48000,100,1500,.5*24**(1-.9951));assert(Math.abs(after-before)<.01,'old bypass threshold must be continuous');
console.log(`PASS ${count} center-gain cases: worst ${maxError.toFixed(6)} dB; width .9949/ .995/ .9951/1 remains filtered, boundary delta ${(after-before).toFixed(6)} dB`);
