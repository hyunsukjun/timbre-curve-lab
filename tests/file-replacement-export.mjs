import {validateAudioBuffer} from "../src/audio-import.js";
import {createSourceLoadGate} from "../src/default-source.js";
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const pick=name=>{const i=source.indexOf(`async function ${name}(`);assert.ok(i>=0);return source.slice(i,source.indexOf('\n}',i)+2)};
let resumes=0,busy=[],rejectDecode=false,decoded=0,options;
const revoked=[], statuses=[];
const candidate={numberOfChannels:2,duration:2,length:96000,sampleRate:48000,getChannelData:()=>new Float32Array(96000),copyFromChannel:out=>out.fill(0)};
class AudioContext {constructor(opts){options=opts;this.state='suspended';this.sampleRate=48000} resume(){resumes++;return new Promise(()=>{})}}
const text=()=>({textContent:''});
const c={validateAudioBuffer,sourceFileLabel:"",downloadUrl:'blob:previous',URL:{revokeObjectURL:url=>revoked.push(url)},window:{AudioContext},audioContext:null,buffer:null,renderAbortController:null,node:null,
 waveform:[],workletBufferLoaded:false,playheadSeconds:0,
 setExportStatus(value){statuses.push(value)},
 readAudioFile:async(file,rate)=>{assert.equal(rate,48000);return file.arrayBuffer()},fileStatus:text(),downloadReadout:text(),readouts:{download:text()},playButton:text(),isPlaying:false,
 setTransportBusy(x){busy.push(x)},setBusy(x){busy.push(x)},nextPlaybackToken(){return 1},
 decodeAudioFile:async()=>{decoded++;if(rejectDecode)throw new Error('Invalid audio');return candidate},
 buildWaveform(){},sendBufferToWorklet(){},resetSourceWindowToMinimum(){},sendSettings(){},clearDownload(){},largeFileSeconds:180,resetCurrentReadouts(){},draw(){},console:{error(){}}};
const start=source.indexOf('function clearDownload()');
const clearCode=source.slice(start,source.indexOf('\n}',start)+2);
c.sourceLoadGate = createSourceLoadGate();
 vm.createContext(c);vm.runInContext(clearCode+'\n'+pick('ensureAudioContext')+'\n'+pick('loadAudioFile'),c);
const file={name:'test.wav',arrayBuffer:async()=>new ArrayBuffer(8)};
let timer;
try {await Promise.race([c.loadAudioFile(file),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Import blocked by pending audio resume')),200)})]);} finally {clearTimeout(timer)}
assert.equal(resumes,0);assert.equal(decoded,1);assert.equal(c.buffer,candidate);assert.deepEqual(busy,[true,false]);assert.match(c.fileStatus.textContent,/2.00 s/);
assert.deepEqual(statuses,['loading','ready']);statuses.length=0;
c.downloadUrl='blob:after-export';await c.loadAudioFile(null);assert.equal(c.downloadUrl,'blob:after-export');
rejectDecode=true;busy=[];await c.loadAudioFile(file);assert.equal(c.downloadUrl,'blob:after-export','failed replacement must retain the valid previous WAV');assert.deepEqual(revoked,['blob:previous']);assert.equal(c.buffer,candidate);assert.deepEqual(busy,[true,false]);assert.match(c.fileStatus.textContent,/Could not load/);
assert.deepEqual(statuses,['loading','ready']);statuses.length=0;
rejectDecode=false;busy=[];await c.loadAudioFile(file);assert.equal(c.buffer,candidate);assert.deepEqual(busy,[true,false]);
void c.ensureAudioContext();assert.equal(resumes,1);
console.log('PASS: previous WAV revoked on successful replacement and retained on decode failure; chooser cancellation preserves WAV; valid retry succeeds');
