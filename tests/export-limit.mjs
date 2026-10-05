import assert from 'node:assert/strict';
import {renderOffline} from '../src/offline-render.js';
const flat=y=>[{x:0,y},{x:1,y}];
const curves={};
for(const duration of [180,181,540]){
const audioBuffer={duration,sampleRate:48000,numberOfChannels:1,getChannelData:()=>new Float32Array(duration*48000)};
const args={audioBuffer,curves,settings:{globalDirection:1,outputGain:.95,chainOrder:[]}};
if(duration>180)await assert.rejects(renderOffline(args),e=>e.code==='EXPORT_DURATION_LIMIT');
else assert.equal((await renderOffline(args)).duration,180);
}
console.log('180-second boundary accepted; 181/540-second exports rejected without truncation');

const source=new Float32Array(180*48000);
const tail=await renderOffline({audioBuffer:{duration:180,sampleRate:48000,numberOfChannels:1,getChannelData:()=>source},curves:{delayTime:flat(0),delayFeedback:flat(0),delayMix:flat(1)},settings:{outputGain:.95,delayEnabled:true,chainOrder:['delay']}});
assert.equal(tail.duration,180.1);console.log('180-second body retains 100ms Delay tail');
