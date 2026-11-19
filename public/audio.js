window.GC=window.GC||{tts:true,lang:'vi-VN',sfx:0.5,music:0.35};
let AC=null,sfxG=null,musG=null,audioInit=false,unlocked=false,synthTimer=0,mode='calm',musOn=false,musTok=0,curAudio=null,synthI=0,nb=null;
const trackIdx={calm:0,frenzy:0},tracks={calm:[],frenzy:[]},SFX={},Music={};
function startAudio(){
if(audioInit)return;audioInit=true;
try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null;return}
sfxG=AC.createGain();sfxG.gain.value=GC.sfx;sfxG.connect(AC.destination);
musG=AC.createGain();musG.gain.value=GC.music*0.5;musG.connect(AC.destination);
Music.init()}
function unlock(){
if(unlocked)return;unlocked=true;startAudio();
if(AC&&AC.state!=='running')AC.resume().catch(()=>{});
if(musOn&&!curAudio&&tracks[mode].length)Music.play()}
['pointerdown','keydown','touchstart'].forEach(e=>window.addEventListener(e,unlock,{once:true}));
function tn(f,t0,d,ty,v,f2,dst){
if(!AC||AC.state!=='running')return;
const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+t0;
o.type=ty||'sine';o.frequency.setValueAtTime(f,t);
if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(1,f2),t+d);
g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v||0.3,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
o.connect(g);g.connect(dst||sfxG);o.start(t);o.stop(t+d+0.02)}
function nz(t0,d,v,ft,f1,f2){
if(!AC||AC.state!=='running')return;
if(!nb){nb=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const a=nb.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1}
const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime+t0;
s.buffer=nb;s.loop=true;f.type=ft||'lowpass';f.frequency.setValueAtTime(f1||1000,t);
if(f2)f.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);
g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v||0.3,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
s.connect(f);f.connect(g);g.connect(sfxG);s.start(t);s.stop(t+d+0.02)}
const SD={
cast:()=>{nz(0,0.25,0.25,'bandpass',800,2500);tn(600,0,0.2,'sine',0.15,200)},
splash:()=>{nz(0,0.45,0.5,'lowpass',3000,300);tn(300,0,0.15,'sine',0.2,120)},
bell:()=>{tn(880,0,0.7,'sine',0.35);tn(1320,0.02,0.6,'sine',0.2);tn(1760,0.05,0.4,'triangle',0.12)},
junk:()=>{tn(220,0,0.3,'sawtooth',0.25,70);tn(110,0.1,0.25,'square',0.18,55)},
boom:()=>{tn(140,0,0.6,'sine',0.7,28);nz(0,0.5,0.6,'lowpass',1500,80)},
fire:()=>{nz(0,0.7,0.4,'bandpass',500,3000);tn(300,0,0.5,'sawtooth',0.1,900)},
drum:()=>{[0,0.18,0.36].forEach(t=>tn(160,t,0.15,'sine',0.6,60))},
zap:()=>{for(let i=0;i<6;i++)tn(1400-i*150,i*0.03,0.05,'square',0.2,300)},
splat:()=>{nz(0,0.2,0.5,'lowpass',2000,200);tn(260,0,0.12,'sine',0.3,90)},
fart:()=>{for(let i=0;i<5;i++)tn(90-i*6,i*0.07,0.08,'sawtooth',0.3,50)},
alert:()=>{[0,0.18,0.36].forEach(t=>tn(880,t,0.12,'square',0.22))},
bark:()=>{[0,0.22].forEach(t=>{tn(380,t,0.14,'sawtooth',0.3,170);nz(t,0.08,0.15,'bandpass',900,500)})},
meow:()=>{tn(520,0,0.18,'triangle',0.3,880);tn(880,0.18,0.25,'triangle',0.3,430)},
steal:()=>{[523,415,330,262].forEach((f,i)=>tn(f,i*0.09,0.1,'triangle',0.25))},
chase:()=>{[330,392,494,392,330,392,494,659].forEach((f,i)=>tn(f,i*0.07,0.06,'square',0.15))}
};
const lastSfx={};
Object.keys(SD).forEach(k=>{SFX[k]=()=>{const n=performance.now();if(n-(lastSfx[k]||0)<60)return;lastSfx[k]=n;try{SD[k]()}catch(e){}}});
SFX.play=k=>{if(SD[k])SFX[k]()};
const SCL={calm:[262,294,330,392,440,523,587,659],frenzy:[220,262,294,330,392,440,523,587]};
const MEL={calm:[0,2,4,2,5,4,2,1,0,2,4,5,7,5,4,2],frenzy:[0,3,5,3,7,5,3,0,2,4,6,4,7,6,4,2]};
function synthTick(){
clearTimeout(synthTimer);synthTimer=0;
if(!musOn)return;
const f=mode==='frenzy',s=SCL[mode],ml=MEL[mode],i=synthI++;
if(AC&&AC.state==='running'&&musG){
tn(s[ml[i%ml.length]],0,f?0.13:0.22,'square',0.25,0,musG);
if(i%4===0)tn(s[0]/2,0,f?0.4:0.9,'triangle',0.4,0,musG);
if(f&&i%2===1)tn(s[4]*2,0,0.06,'square',0.08,0,musG)}
synthTimer=setTimeout(synthTick,f?150:270)}
Music.stopAudio=()=>{
if(!curAudio)return;
const a=curAudio;curAudio=null;a.onended=null;a.onerror=null;
try{a.pause();a.src=''}catch(e){}};
Music.stop=()=>{musTok++;musOn=false;clearTimeout(synthTimer);synthTimer=0;Music.stopAudio()};
Music.play=()=>{
Music.stop();musOn=true;
const tok=musTok,l=tracks[mode];
if(l.length){
const url=l[trackIdx[mode]%l.length];trackIdx[mode]=(trackIdx[mode]+1)%l.length;
const a=new Audio(url);a.volume=Math.max(0,Math.min(1,GC.music));curAudio=a;
const fb=()=>{if(tok!==musTok)return;Music.stopAudio();synthTick()};
a.onended=()=>{if(tok===musTok)Music.play()};
a.onerror=fb;
const p=a.play();if(p&&p.catch)p.catch(fb)
}else synthTick()};
Music.setMode=m=>{if(m===mode)return;mode=m;if(musOn)Music.play()};
Music.init=()=>{
fetch('/api/music').then(r=>r.json()).then(j=>{tracks.calm=j.calm||[];tracks.frenzy=j.frenzy||[]}).catch(()=>{}).then(()=>{if(!musOn)Music.play()})};
let ttsQ=[],ttsBusy=false,ttsVoice=null,ttsWd=0,ttsId=0;
function pickVoice(){
if(!window.speechSynthesis)return;
const v=speechSynthesis.getVoices(),l=String(GC.lang||'vi-VN').toLowerCase();
ttsVoice=v.find(x=>x.lang.toLowerCase()===l)||v.find(x=>x.lang.toLowerCase().startsWith(l.slice(0,2)))||null}
if(window.speechSynthesis){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function ttsNext(){
if(ttsBusy||!ttsQ.length)return;
const it=ttsQ.shift(),id=++ttsId;ttsBusy=true;
const u=new SpeechSynthesisUtterance(it.t);u.lang=GC.lang||'vi-VN';if(ttsVoice)u.voice=ttsVoice;u.rate=1.08;u.volume=1;
let done=false;
const fin=()=>{if(done||id!==ttsId)return;done=true;clearTimeout(ttsWd);ttsBusy=false;setTimeout(ttsNext,60)};
u.onend=fin;u.onerror=fin;
clearTimeout(ttsWd);ttsWd=setTimeout(fin,Math.min(9000,1500+it.t.length*120));
try{speechSynthesis.speak(u)}catch(e){fin()}}
function say(t,p){
if(!GC.tts||!window.speechSynthesis||!t)return;
ttsQ.push({t:String(t).slice(0,140),p:p||1});
ttsQ.sort((a,b)=>b.p-a.p);
if(ttsQ.length>4)ttsQ.length=4;
ttsNext()}
function sayNow(t){
if(!GC.tts||!window.speechSynthesis||!t)return;
ttsId++;ttsQ=[];ttsBusy=false;clearTimeout(ttsWd);
try{speechSynthesis.cancel()}catch(e){}
say(t,9)}
startAudio();
