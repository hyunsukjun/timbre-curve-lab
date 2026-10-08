import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const pick=name=>{const i=source.indexOf(`async function ${name}(`);assert.ok(i>=0);return source.slice(i,source.indexOf('\n}',i)+2)};
let resumes=0,busy=[],rejectDecode=false,decoded=0,options;
const revoked=[];
const candidate={numberOfChannels:2,duration:2};
class AudioContext {constructor(opts){options=opts;this.state='suspended'} resume(){resumes++;return new Promise(()=>{})}}
const text=()=>({textContent:''});
const c={downloadUrl:'blob:previous',URL:{revokeObjectURL:url=>revoked.push(url)},window:{AudioContext},audioContext:null,buffer:null,renderAbortController:null,node:null,
 spectrogram:{invalidate(){}},outputTime:{setBuffer(){}},fileStatus:text(),downloadReadout:text(),readouts:{download:text()},playButton:text(),isPlaying:false,
 setTransportBusy(x){busy.push(x)},setBusy(x){busy.push(x)},nextPlaybackToken(){return 1},
 decodeAudioFile:async()=>{decoded++;if(rejectDecode)throw new Error('Invalid audio');return candidate},
 buildWaveform(){},sendBufferToWorklet(){},resetSourceWindowToMinimum(){},sendSettings(){},clearDownload(){},largeFileSeconds:300,resetCurrentReadouts(){},draw(){},console:{error(){}}};
const start=source.indexOf('function clearDownload()');
const clearCode=source.slice(start,source.indexOf('\n}',start)+2);
vm.createContext(c);vm.runInContext(clearCode+'\n'+pick('ensureAudioContext')+'\n'+pick('loadAudioFile'),c);
const file={name:'test.wav',arrayBuffer:async()=>new ArrayBuffer(8)};
let timer;
try {await Promise.race([c.loadAudioFile(file),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Import blocked by pending audio resume')),200)})]);} finally {clearTimeout(timer)}
assert.equal(resumes,0);assert.equal(decoded,1);assert.equal(c.buffer,candidate);assert.deepEqual(busy,[true,false]);assert.match(c.fileStatus.textContent,/2.00 s/);
c.downloadUrl='blob:after-export';await c.loadAudioFile(null);assert.equal(c.downloadUrl,'blob:after-export');
rejectDecode=true;busy=[];await c.loadAudioFile(file);assert.equal(c.downloadUrl,null,'failed replacement must release old WAV');assert.deepEqual(revoked,['blob:previous','blob:after-export']);assert.equal(c.buffer,null);assert.deepEqual(busy,[true,false]);assert.match(c.fileStatus.textContent,/Could not load/);
rejectDecode=false;busy=[];await c.loadAudioFile(file);assert.equal(c.buffer,candidate);assert.deepEqual(busy,[true,false]);
void c.ensureAudioContext();assert.equal(resumes,1);
console.log('PASS: previous WAV revoked on replacement and decode failure; chooser cancellation preserves WAV; valid retry succeeds');
