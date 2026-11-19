const fs=require('fs'),path=require('path'),http=require('http');
const envP=path.join(__dirname,'.env'),exP=path.join(__dirname,'.env.example');
if(!fs.existsSync(envP)&&fs.existsSync(exP))fs.copyFileSync(exP,envP);
require('dotenv').config({path:envP});
const express=require('express'),{Server}=require('socket.io');
const E=process.env,nf=(v,d)=>{const n=parseFloat(v);return isNaN(n)?d:n};
const PORT=nf(E.PORT,3000),USER=(E.TIKTOK_USERNAME||'').trim().replace(/^@/,''),KEY=E.SIGN_API_KEY||E.EULER_API_KEY||'',EXT=String(E.EXTENDED_GIFT_INFO).toLowerCase()==='true',UNK=nf(E.UNKNOWN_GIFT_COINS,1);
const GC={tts:String(E.TTS_ENABLED).toLowerCase()!=='false',lang:E.TTS_LANG||'vi-VN',sfx:nf(E.SFX_VOLUME,0.5),music:nf(E.MUSIC_VOLUME,0.35),user:USER};
const app=express(),srv=http.createServer(app),io=new Server(srv,{cors:{origin:'*'}});
process.on('unhandledRejection',e=>console.log('[err]',e&&e.message||e));
process.on('uncaughtException',e=>console.log('[err]',e&&e.message||e));
app.get('/config.js',(q,r)=>{r.type('application/javascript');r.set('Cache-Control','no-store');r.send('window.GC='+JSON.stringify(GC)+';')});
const AV=new Map(),AH=/(^|\.)(tiktokcdn(-us)?\.com|tiktokv\.com|tiktok\.com|byteimg\.com|ibyteimg\.com|muscdn\.com|byteoversea\.com|ttwstatic\.com)$/i;
const avGet=k=>{if(!AV.has(k))return null;const v=AV.get(k);AV.delete(k);AV.set(k,v);return v};
const avSet=(k,v)=>{AV.set(k,v);if(AV.size>300)AV.delete(AV.keys().next().value)};
app.get('/avatar',async(q,r)=>{
const u=String(q.query.u||'');let url;
try{url=new URL(u)}catch(e){return r.status(400).end()}
if(url.protocol!=='https:'||!AH.test(url.hostname))return r.status(403).end();
let c=avGet(u);
if(!c){try{const f=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://www.tiktok.com/'}});if(!f.ok)return r.status(502).end();c={b:Buffer.from(await f.arrayBuffer()),t:f.headers.get('content-type')||'image/jpeg'};avSet(u,c)}catch(e){return r.status(502).end()}}
r.set('Content-Type',c.t);r.set('Cache-Control','public,max-age=86400');r.send(c.b)});
const TD=path.join(__dirname,'public','tracks'),AX=/\.(mp3|ogg|wav|m4a|aac|flac)$/i;
['calm','frenzy'].forEach(k=>fs.mkdirSync(path.join(TD,k),{recursive:true}));
function scan(){
const o={calm:[],frenzy:[]},add=(k,rel)=>o[k].push('/tracks/'+rel.split('/').map(encodeURIComponent).join('/'));
try{for(const f of fs.readdirSync(TD,{withFileTypes:true})){
if(f.isFile()&&AX.test(f.name))add(/frenzy/i.test(f.name)?'frenzy':'calm',f.name);
else if(f.isDirectory()){const k=/frenzy/i.test(f.name)?'frenzy':'calm';for(const g of fs.readdirSync(path.join(TD,f.name)))if(AX.test(g))add(k,f.name+'/'+g)}}}catch(e){}
return o}
app.get('/api/music',(q,r)=>r.json(scan()));
app.use(express.static(path.join(__dirname,'public')));
const GF=path.join(__dirname,'gifts.json');
function gifts(){try{if(!fs.existsSync(GF))fs.writeFileSync(GF,JSON.stringify({"5655":{name:"Rose",coins:1}},null,2));return JSON.parse(fs.readFileSync(GF,'utf8'))}catch(e){return{}}}
const KS=['uniqueId','userId','secUid','displayId','id'];
function picOf(cs){
for(const c of cs){if(!c||typeof c!=='object')continue;
const p=c.profilePicture,a=c.avatarThumb||c.avatarMedium||c.avatarLarger;
const x=(p&&(Array.isArray(p.url)?p.url[0]:p.url))||(p&&p.urls&&p.urls[0])||c.profilePictureUrl||(a&&((a.urlList&&a.urlList[0])||(Array.isArray(a.url)?a.url[0]:a.url)))||'';
if(typeof x==='string'&&x)return x}
return''}
function extractUser(d){
const cs=[d&&d.user,d&&d.user&&d.user.user,d&&d.userInfo,d];
let id='',x=null;
for(const c of cs){if(!c||typeof c!=='object')continue;
for(const k of KS){if(c[k]!==undefined&&c[k]!==null&&String(c[k])!==''){id=String(c[k]);x=c;break}}
if(id)break}
if(!id){x=cs.find(c=>c&&typeof c==='object')||{};id='u_'+(x.nickname||Math.random().toString(36).slice(2,8))}
let name='';
for(const c of cs){if(!c||typeof c!=='object')continue;const n=c.nickname||c.uniqueId||c.displayId;if(n){name=String(n);break}}
const pic=picOf(cs);
return{id,name:name||'Khách',pic:pic?'/avatar?u='+encodeURIComponent(pic):''}}
const seen=new Set();
function dup(k){if(seen.has(k))return true;seen.add(k);if(seen.size>800)seen.delete(seen.values().next().value);return false}
function onGift(d){
const u=extractUser(d),gid=String(d.giftId||(d.gift&&d.gift.id)||''),db=gifts(),ge=db[gid];
const dc=nf(d.diamondCount!==undefined?d.diamondCount:(d.gift&&(d.gift.diamondCount||d.gift.diamond_count)),NaN);
const streak=d.giftType===1||(d.gift&&d.gift.type===1);
if(streak&&!d.repeatEnd)return;
if(d.msgId||d.groupId){if(dup((d.msgId||d.groupId)+':'+u.id+':'+gid+(streak?':e':':s')))return}
const name=(ge&&ge.name)||d.giftName||(d.gift&&d.gift.name)||('Gift '+gid);
const unit=ge?nf(ge.coins,UNK):(isNaN(dc)?UNK:dc);
if(!ge&&gid&&!isNaN(dc)){db[gid]={name:name,coins:dc};try{fs.writeFileSync(GF,JSON.stringify(db,null,2))}catch(e){}}
const cnt=Math.max(1,nf(d.repeatCount,1));
io.emit('gift',{user:u,giftId:gid,name:name,unit:unit,count:cnt,coins:unit*cnt})}
let status={state:'idle',msg:''};
function setStatus(s,m){status={state:s,msg:m||''};io.emit('status',status);console.log('[tiktok]',s,m||'')}
io.on('connection',s=>s.emit('status',status));
const TL=require('tiktok-live-connector'),V2=!!TL.TikTokLiveConnection,Conn=V2?TL.TikTokLiveConnection:TL.WebcastPushConnection;
let conn=null,retry=0,rt=0;
function later(){clearTimeout(rt);const d=Math.min(60000,4000*Math.pow(2,Math.min(retry,4)));retry++;rt=setTimeout(connect,d)}
function connect(){
if(!USER){setStatus('nouser','Chưa cấu hình TIKTOK_USERNAME');return}
clearTimeout(rt);
const old=conn;conn=null;
try{if(old)old.disconnect()}catch(e){}
const c=new Conn(USER,{signApiKey:KEY||undefined,enableExtendedGiftInfo:EXT,processInitialData:false});
conn=c;
setStatus('connecting',USER);
c.on('chat',d=>{const t=String(d.comment||'').trim();if(t)io.emit('chat',{user:extractUser(d),text:t})});
c.on('like',d=>io.emit('like',{user:extractUser(d),count:Math.max(1,nf(d.likeCount,1))}));
c.on('follow',d=>io.emit('follow',{user:extractUser(d)}));
c.on('gift',d=>{try{onGift(d)}catch(e){console.log('[gift]',e.message)}});
c.on('error',e=>console.log('[tiktok] error',e&&e.message||e));
c.on('streamEnd',()=>{if(c!==conn)return;setStatus('ended','Live kết thúc')});
c.on('disconnected',()=>{if(c!==conn)return;setStatus('disconnected','Mất kết nối');later()});
Promise.resolve().then(()=>c.connect()).then(()=>{if(c!==conn)return;retry=0;setStatus('live',USER)}).catch(e=>{if(c!==conn)return;setStatus('error',String(e&&e.message||e).slice(0,120));later()})}
srv.listen(PORT,()=>{console.log('http://localhost:'+PORT+'/?transparent=1&mock=0');connect()});
