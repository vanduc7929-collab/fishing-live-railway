const cv=document.getElementById('c'),W=1080,H=1920,POND={x:150,y:420,w:780,h:1300},g=cv.getContext('2d',{alpha:TR,desynchronized:true});
const CFG={likeEnergy:0.35,chatEnergy:1.2,spotCooldown:35,fakeFocusChance:0.25,qteWinTarget:60,frenzyCooldown:150,frenzyTime:45};
const players=new Map(),scores=new Map(),parts=[],ripples=[],lilies=[],npcs=[],vips=[];
let energy=0,frenzy=0,frenzyCD=0,shk=0,banner=null,T=0,leader=null,tops=[],SP=null,card=null,fish=[],crab=null,spotCD=0,evT=100,thT=70,slipCD=0,lastQS=0,lbDirty=true,lbSig='',tst={state:'idle',msg:''},tpT=0,pruT=0,rpT=0;
const cam={z:1,x:540,y:960,tz:1,tx:540,ty:960};
const rd=(a,b)=>a+Math.random()*(b-a),clp=(v,a,b)=>Math.max(a,Math.min(b,v)),r1=v=>Math.round(v*10)/10,hs=s=>{let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const CR=[[115,395],[965,395],[965,1750],[115,1750]];
function slotPos(i){
if(i<12){const y=520+i*95;return{x:95,y,dir:'right',bx:240+(i%3)*45,by:y+10}}
if(i<24){const y=520+(i-12)*95;return{x:985,y,dir:'left',bx:840-(i%3)*45,by:y+10}}
if(i<30){const x=240+(i-24)*115;return{x,y:395,dir:'down',bx:x,by:510+(i%2)*40}}
const x=240+(i-30)*115;return{x,y:1755,dir:'up',bx:x,by:1620-(i%2)*40}}
function vipPos(i){const vx=[430,540,650][i]||540;return{x:vx,y:490,dir:'down',bx:vx,by:600}}
const SPOS=Array.from({length:36},(_,i)=>slotPos(i)),VPOS=[0,1,2].map(vipPos);
function pPos(p){return p.vip?VPOS[p.vip.i]:SPOS[p.slot]}
function freeSlot(){const taken=new Set([...players.values()].filter(p=>p.st!=='walkout').map(p=>p.slot));for(let i=0;i<36;i++)if(!taken.has(i))return i;return -1}
function inQte(p){return !!SP&&(!p||SP.pid===p.id)}
const immune=p=>!!p.vip||inQte(p)||p.st==='fight';
const mf=(c,k,l)=>l.map(a=>({n:a[0],c,k,e:a[1]||'🐟',f:a[2]}));
const FS=[].concat(
mf('junk',[0,0],[['Ủng rách','🥾'],['Vịt cao su','🦆',1],['Quần đùi hoa','🩳'],['Bồn cầu vàng','🚽',1]]),
mf('common',[.3,2.5],[['Cá Rô Phi'],['Cá Diếc Bạc'],['Cá Bảy Màu','🐠'],['Cá Chép Vàng','🐠'],['Cá Trôi Ấn'],['Cá Mè Hoa'],['Cá Trê Đồng'],['Cá Thác Lác']]),
mf('rare',[3,14],[['Cá Lóc Bông'],['Cá Trắm Đen'],['Cá Koi Kohaku','🎏'],['Cá Đĩa Xanh','🐡'],['Cá Lăng Nha'],['Lươn Vàng Khổng Lồ','🐍'],['Cá Chình Hoa','🐍']]),
mf('legend',[25,120],[['Cá Rồng Huyết Long','🐉'],['Cá Tra Dầu Khổng Lồ','🐋'],['Cá Hô Sông Mê Kông','🐋'],['Cá Sấu Hoa Cà','🐊'],['Rùa Vàng Quý Hiếm','🐢'],['Rương Kho Báu Đáy Hồ','💰']]));
const BYC={};FS.forEach(f=>(BYC[f.c]=BYC[f.c]||[]).push(f));
function sc(p){let s=scores.get(p.id);if(!s){s={id:p.id,name:p.name,kg:0,catches:0,species:new Set(),rodLevel:0,u1:0,u2:0,pic:'',av:null,ld:0};scores.set(p.id,s)}return s}
function loadAv(s){if(!s.pic||s.ld)return;s.ld=1;const im=new Image();im.onload=()=>{try{const c=mkc(48,48),x=c.getContext('2d');x.beginPath();x.arc(24,24,24,0,6.3);x.clip();x.drawImage(im,0,0,48,48);s.av=c;lbDirty=true}catch(e){}};im.src=s.pic}
function setBanner(text,e,t,col){banner={text:text,e:e||'',t:t||3,m:t||3,col:col||'#ffffff'}}
function showCard(p,title,l1,l2,e){card={t:4,m:4,title:title,name:p.name,s:sc(p),l1:l1,l2:l2,e:e}}
function addP(o){if(parts.length>=120)parts.shift();parts.push(o)}
function txtPart(x,y,s,c){addP({k:'t',x:x,y:y,vx:0,vy:-34,g:0,t:0,m:1.7,s:s,c:c||'#fff'})}
function emoPart(e,x,y,vx,vy,gr,m,sz){addP({k:'e',e:e,x:x,y:y,vx:vx,vy:vy,g:gr,t:0,m:m,sz:sz||40,r:0,vr:rd(-4,4)})}
function dotP(x,y,c,n){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=rd(40,200);addP({k:'d',x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,g:420,t:0,m:rd(.4,.9),c:c,sz:rd(3,6)})}}
function addRipple(x,y,gold){if(ripples.length>=35)ripples.shift();ripples.push({x:x,y:y,r:6,t:0,gold:!!gold})}
function qSplash(x,y,s,c){if(T-lastQS<=0.16)return;lastQS=T;addRipple(x,y,false);dotP(x,y,'#e8fbff',4);if(s)txtPart(x+rd(-30,30),y-40,s,c);SFX.splash()}
function buildFish(){
const pick=a=>a[Math.random()*a.length|0];
fish=[];const n=frenzy>0?14:8,TY=['koi','carp','arowana','snakehead','turtle'];
for(let i=0;i<n;i++){let x,y,k=0;do{x=rd(270,810);y=rd(580,1550);k++}while(k<40&&fish.some(f=>Math.hypot(f.x-x,f.y-y)<110));
fish.push({x:x,y:y,a:rd(0,6.28),v:rd(30,70),ph:Math.random()*6.28+i*0.37,sw:rd(5,8),len:rd(42,72),ci:i%6,type:pick(TY),cv:Math.random()*3|0,al:rd(.35,.55),ta:0,tt:0})}}
buildFish();
function mkPlayer(u,slot){const h=hs(u.id);return{id:u.id,name:u.name||'Khách',pic:u.pic||'',slot:slot,st:'idle',t:0,rt0:1,afk:0,afkW:0,boost:0,keep:0,shield:0,autoCast:0,want:0,stun:0,arr:0,wo:0,hat:h%8,vest:(h>>3)%8,skin:(h>>6)%4,hair:(h>>8)%6,hash:h,vip:null,pendVip:0,ph:Math.random()*6.28,bl:Math.random()*6.28,bst:false,rp:1,cf:null}}
function evict(){let b=null;for(const p of players.values()){if(p.st==='walkout'||immune(p))continue;if(!b||p.afk>b.afk)b=p}if(b){leave(b);return true}return false}
function leave(p){if(p.vip)unVip(p);p.st='walkout';p.wo=0;p.want=0;p.cf=null}
function join(u){
if(!u||!u.id)return null;
let p=players.get(u.id);
if(p&&p.st!=='walkout'){p.afk=0;p.afkW=0;if(u.name&&p.name!==u.name)p.name=u.name;const s=sc(p);if(u.pic&&!s.pic){s.pic=u.pic;loadAv(s)}return p}
let cnt=0;for(const q of players.values())if(q.st!=='walkout')cnt++;
if(cnt>=36&&!evict())return null;
const sl=freeSlot();if(sl<0)return null;
p=mkPlayer(u,sl);players.set(p.id,p);
const s=sc(p);if(u.name)s.name=u.name;if(u.pic&&!s.pic){s.pic=u.pic;loadAv(s)}
lbDirty=true;return p}
function makeVip(p){
if(p.st==='walkout')return;
if(inQte(p)){p.pendVip=1;return}
if(p.vip){p.vip.t=180;return}
const used=new Set(vips.map(q=>q.vip.i));let i=-1;
for(let k=0;k<3;k++)if(!used.has(k)){i=k;break}
if(i<0){let w=vips[0];for(const q of vips)if(q.vip.t<w.vip.t)w=q;i=w.vip.i;unVip(w)}
p.vip={t:180,i:i};vips.push(p);p.st='idle';p.want=1;p.cf=null;p.arr=0.2;SFX.drum();
setBanner(p.name+' lên Du thuyền VIP 180s! x1.5 cân nặng','🚢',3.2,'#ffe27a')}
function unVip(p){const i=vips.indexOf(p);if(i>=0)vips.splice(i,1);p.vip=null;if(p.st!=='fight'&&p.st!=='walkout'){p.st='idle';p.cf=null}}
function rollFish(p,force){
const s=sc(p),b=1+([0,.15,.35][s.rodLevel]||0),m=frenzy>0?3:1;
const w=[['junk',15],['common',58],['rare',22*b*m],['legend',5*b*m]];
let c=force;
if(!c){const tot=w.reduce((a,x)=>a+x[1],0);let r=Math.random()*tot;c='legend';for(const x of w){r-=x[1];if(r<0){c=x[0];break}}}
const l=BYC[c];return l[Math.random()*l.length|0]}
function rodChk(p,s){const n=s.species.size;
if(n>=5&&!s.u1){s.u1=1;if(s.rodLevel<1)s.rodLevel=1;const ps=pPos(p);txtPart(ps.x,ps.y-70,'Nâng cấp: Cần Máy!','#7ee8ff');SFX.bell()}
if(n>=15&&!s.u2){s.u2=1;if(s.rodLevel<2)s.rodLevel=2;const ps=pPos(p);txtPart(ps.x,ps.y-70,'Nâng cấp: Cần Carbon!','#7ee8ff');SFX.bell();say(p.name+' lên cần cacbon!',4)}}
function award(p,f,mx,q){
const s=sc(p),k0=f.k[1]>0?r1(rd(f.k[0],f.k[1])):0,m=(frenzy>0?2:1)*(p.vip?1.5:1)*(mx||1),kg=r1(k0*m);
s.kg=r1(s.kg+kg);s.catches++;
if(f.c!=='junk'){s.species.add(f.n);rodChk(p,s)}
lbDirty=true;
if(!q){const ps=pPos(p),col=f.c==='legend'?'#ffd84a':f.c==='rare'?'#7ee8ff':f.c==='junk'?'#ff9a9a':'#ffffff';
txtPart(ps.bx,ps.by-24,(kg>0?'+'+kg+'kg ':'')+f.n,col);
emoPart(f.e,ps.bx,ps.by-10,rd(-30,30),-150,420,.9,f.c==='legend'?56:40);
if(f.f)SFX.fart();else if(f.c==='junk')SFX.junk();else if(f.c==='legend'){SFX.bell();SFX.fire();say(p.name+' câu được '+f.n+'!',5)}else if(f.c==='rare')SFX.bell();else if(players.size<8||Math.random()<.25)SFX.splash();
if(f.c!=='junk')dotP(ps.bx,ps.by,'#e8fbff',3)}
return kg}
function bigNet(p){let t=0;const ps=pPos(p);for(let i=0;i<8;i++)t+=award(p,rollFish(p,'legend'),1,true);SFX.boom();shk=1;for(let i=0;i<5;i++)dotP(ps.bx+rd(-70,70),ps.by+rd(-40,40),'#ffd84a',5);setBanner(p.name+' thả LƯỚI RỒNG: 8 cá huyền thoại!','🌊',3.5,'#7ee8ff');return r1(t)}
function triggerFrenzy(force){
if(frenzy>0)return;if(!force&&frenzyCD>0)return;
frenzy=CFG.frenzyTime;frenzyCD=CFG.frenzyCooldown;energy=0;Music.setMode('frenzy');buildFish();
setBanner('GOLDEN FRENZY! x2 điểm, x3 cá hiếm','✨',4,'#ffd32a');SFX.fire();SFX.drum();shk=.6;
say('Golden Frenzy! Nhân đôi điểm, cá hiếm nhân ba!',7);
for(let i=0;i<5;i++)dotP(rd(200,880),rd(500,1600),'#ffd84a',5)}
function castLine(p){p.st='cast';p.t=.55;p.bst=p.boost>0;if(p.bst)p.boost--;p.rp=1;p.cf=null;if(players.size<10)SFX.cast()}
function biteT(p){return p.bst?rd(.7,1.3):rd(3.2,6.5)*(frenzy>0?.6:1)}
function resolve(p){
const f=p.cf||rollFish(p);p.cf=null;
if(!SP&&spotCD<=0){const ep=f.c==='rare'||f.c==='legend';if(ep||(f.f&&Math.random()<CFG.fakeFocusChance)){if(startSpot(p,f,!!f.f))return}}
award(p,f);p.st='idle'}
function startSpot(p,f,fake){
if(SP)return false;
const ps=pPos(p);
SP={st:'qte',pid:p.id,f:f,fake:!!fake,t:15,v:25,a:0,ax:ps.x,ay:ps.y,bx:ps.bx,by:ps.by,fx:ps.bx,fy:ps.by,jt:0,jh:0,jc:rd(.8,1.6),ph:0,res:'',rt:0,pn:0,dn:0};
p.st='fight';p.cf=null;
setBanner('SPOTLIGHT! Cá khổng lồ cắn câu của '+p.name,'🔦',3.5,'#ffe27a');SFX.drum();shk=.4;
say('Cá khổng lồ cắn câu của '+p.name+'! Gõ kéo để kéo, gõ phá để phá!',8);
return true}
function qChk(){if(!SP||SP.res)return;if(SP.v>=CFG.qteWinTarget)qteWin(false);else if(SP.v<=0)qteFall()}
function qAct(d,u){
if(!SP||SP.res)return;
let m=1;if(d>0&&u&&u.id===SP.pid){const os=scores.get(SP.pid);if(os&&os.rodLevel>=2)m=1.05}
SP.v=clp(SP.v+d*m,0,100);if(d>0)SP.pn++;else SP.dn++;
qSplash(SP.fx,SP.fy,(d>0?'+':'')+r1(d*m)+'%',d>0?'#8dff9a':'#ff8a8a');
qChk()}
function qteWin(zap){
if(!SP||SP.res)return;
const p=players.get(SP.pid);SP.res='win';SP.rt=2.4;SP.v=100;
if(zap){SFX.zap();for(let i=0;i<3;i++)dotP(SP.fx,SP.fy,'#fff36b',6)}
if(!p)return;
const f=SP.f;
if(SP.fake){award(p,f,1);setBanner('Hạ gục... chỉ là '+f.n+'! Bị lừa rồi!',f.e,3.5,'#ffb26b');SFX.fart();say('Ha ha ha, đó chỉ là '+f.n+'!',6)}
else{const kg=award(p,f,1,true);showCard(p,'MVP KÉO CÁ KHỔNG LỒ',f.n+' · '+kg+' kg','Du thuyền VIP 180s · x1.5 cân nặng',f.e);p.pendVip=1;SFX.bell();SFX.fire();shk=.8;for(let i=0;i<4;i++)dotP(SP.fx+rd(-60,60),SP.fy+rd(-60,60),'#ffd84a',6);say('Chúc mừng '+p.name+' đã chinh phục '+f.n+'!',8)}
p.st='idle';p.cf=null}
function qteFall(){
if(!SP||SP.res)return;
SP.res='fall';SP.rt=1.8;const p=players.get(SP.pid);if(p){p.st='idle';p.cf=null}
setBanner('Cá khổng lồ sổng mất!','💨',3,'#ff9a9a');SFX.junk();say('Cá sổng mất rồi!',5)}
function endSpot(){const p=SP?players.get(SP.pid):null;SP=null;spotCD=CFG.spotCooldown;if(p){if(p.pendVip){p.pendVip=0;makeVip(p)}if(p.st==='fight')p.st='idle'}}
function updP(p,dt){
if(p.st==='walkout'){p.wo+=dt;if(p.wo>=1.4)players.delete(p.id);return}
p.arr=Math.min(1,p.arr+dt*2.5);
if(immune(p)){p.afk=0;p.afkW=0}else{p.afk+=dt;if(p.afk>=150&&!p.afkW){p.afkW=1;SFX.alert();say(p.name+' ơi, còn đó không? Gõ câu để ở lại!',3)}if(p.afk>=180){leave(p);return}}
if(p.stun>0){p.stun-=dt;return}
if(p.keep>0)p.keep-=dt;if(p.autoCast>0)p.autoCast-=dt;
if(p.vip){p.vip.t-=dt;if(p.vip.t<=0){unVip(p);return}}
switch(p.st){
case'idle':if(p.want||p.keep>0||p.autoCast>0){p.want=0;castLine(p)}break;
case'cast':p.t-=dt;if(p.t<=0){p.st='wait';p.t=biteT(p);const ps=pPos(p);addRipple(ps.bx,ps.by,p.bst)}break;
case'wait':p.t-=dt;if(p.bst){p.rp-=dt;if(p.rp<=0){p.rp=.5;const ps=pPos(p);addRipple(ps.bx,ps.by,true)}}if(p.t<=0){p.st='bite';p.t=.9;p.cf=rollFish(p);const ps=pPos(p);addRipple(ps.bx,ps.by,p.bst)}break;
case'bite':p.t-=dt;if(p.t<=0){p.st='reel';p.rt0=1.4/(1+[0,.3,.5][sc(p).rodLevel]);p.t=p.rt0}break;
case'reel':p.t-=dt;if(p.t<=0)resolve(p);break;
}}
function stand(sl){const q=SPOS[sl];if(sl<12)return{S:[115,q.y],te:3};if(sl<24)return{S:[965,q.y],te:1};if(sl<30)return{S:[q.x,395],te:0};return{S:[q.x,1750],te:2}}
function route(c0,S,te){
const cw=(te-c0+4)%4,ccw=(c0-(te+1)+4)%4,pts=[];
if(cw<=ccw){let i=c0;for(let k=0;k<=cw;k++){pts.push(CR[i]);i=(i+1)%4}}
else{let i=c0;for(let k=0;k<=ccw;k++){pts.push(CR[i]);i=(i+3)%4}}
pts.push(S);return pts.map(a=>({x:a[0],y:a[1]}))}
function spawnThief(kind,force){
if(npcs.some(n=>n.st!=='flee'))return false;
let c=[...players.values()].filter(p=>p.st!=='walkout'&&!p.vip);
const rich=c.filter(p=>sc(p).kg>.5);if(rich.length)c=rich;
if(!c.length&&force){const p=join(mu());if(p){sc(p).kg=8;c=[p]}}
if(!c.length)return false;
const p=c[Math.random()*c.length|0],st=stand(p.slot),c0=Math.random()*4|0,path=route(c0,st.S,st.te);
let len=0;for(let i=1;i<path.length;i++)len+=Math.hypot(path[i].x-path[i-1].x,path[i].y-path[i-1].y);
const dog=kind==='dog';
npcs.push({kind:kind,e:dog?'🐕':'🐈',x:path[0].x,y:path[0].y,path:path,pi:1,sp:Math.max(320,len/6.2),pid:p.id,t:7,st:'run',carry:null,fx:0,fy:0,hop:0,fl:1});
if(dog)SFX.bark();else SFX.meow();SFX.alert();
setBanner((dog?'Chó':'Mèo')+' đang rình trộm cá của '+p.name+'! Gõ đuổi / suỵt / thả tim','❗',4,'#ff9a9a');
say('Cẩn thận! Có '+(dog?'chó':'mèo')+' trộm cá! Gõ đuổi hoặc suỵt!',6);return true}
function flee(n){n.st='flee';if(n.x<=122){n.fx=-90;n.fy=n.y}else if(n.x>=958){n.fx=1170;n.fy=n.y}else if(n.y<=402){n.fx=n.x;n.fy=-90}else{n.fx=n.x;n.fy=2000}}
function steal(n,p){
const s=sc(p),dog=n.kind==='dog';
if(p.shield>0){p.shield=0;setBanner('Khiên của '+p.name+' đã chặn '+(dog?'chó':'mèo')+' trộm!','🛡️',3,'#7ee8ff');SFX.zap();say('Khiên chặn trộm thành công!',4);dotP(n.x,n.y,'#7ee8ff',8)}
else{const loss=r1(s.kg*rd(.1,.35));
if(loss>0){s.kg=r1(Math.max(0,s.kg-loss));lbDirty=true;n.carry='🐟';setBanner((dog?'Chó':'Mèo')+' cướp '+loss+'kg của '+p.name+'!',n.e,3.2,'#ff9a9a');SFX.steal();say((dog?'Chó':'Mèo')+' cướp cá của '+p.name+'!',5)}
else setBanner((dog?'Chó':'Mèo')+' tay trắng, '+p.name+' chưa có cá!',n.e,2.5,'#ffffff')}
flee(n)}
function shoo(u){let k=0;for(const n of npcs)if(n.st!=='flee'){flee(n);k++}if(k){setBanner((u&&u.name?u.name:'Ai đó')+' đã đuổi trộm thành công!','👋',2.6,'#9fffa8');SFX.chase();say('Đuổi được rồi!',3)}}
function updNpc(n,dt,i){
if(n.st==='flee'){const dx=n.fx-n.x,dy=n.fy-n.y,d=Math.hypot(dx,dy),st=520*dt;if(d<=st){npcs.splice(i,1);return}n.x+=dx/d*st;n.y+=dy/d*st;n.hop+=dt*14;n.fl=dx>0?-1:1;return}
n.t-=dt;
const p=players.get(n.pid);
if(!p||p.st==='walkout'||p.vip){flee(n);return}
if(n.st==='run'){const w=n.path[n.pi];if(!w){n.st='wait';return}const dx=w.x-n.x,dy=w.y-n.y,d=Math.hypot(dx,dy),st=n.sp*dt;n.hop+=dt*14;if(Math.abs(dx)>1)n.fl=dx>0?-1:1;if(d<=st){n.x=w.x;n.y=w.y;n.pi++}else{n.x+=dx/d*st;n.y+=dy/d*st}}
if(n.st==='wait'&&n.t<=0)steal(n,p)}
function spawnCrab(force){
if(crab)return false;
let c=[...players.values()].filter(p=>(p.st==='wait'||p.st==='bite'||p.st==='reel')&&p.st!=='walkout');
if(!c.length&&force){const p=join(mu());if(p){p.st='wait';p.t=30;c=[p]}}
if(!c.length)return false;
const p=c[Math.random()*c.length|0],ps=pPos(p);
crab={pid:p.id,x:ps.bx<540?165:915,y:ps.by,st:'walk',t:0,sp:120,f:1};
SFX.alert();setBanner('Cua khổng lồ bò tới cắt cước của '+p.name+'!','🦀',3.5,'#ffb26b');say('Cua khổng lồ xuất hiện!',5);return true}
function snip(p){
p.st='idle';p.cf=null;p.t=0;crab.st='leave';crab.f=1;
const ps=pPos(p);setBanner('Cua cắt đứt cước của '+p.name+'!','✂️',3,'#ffb26b');txtPart(ps.bx,ps.by-30,'✂️ Cua cắt đứt cước!','#ffb26b');SFX.splat();SFX.alert();shk=.5;say('Cua khổng lồ cắt đứt cước của '+p.name,5)}
function updCrab(dt){
const c=crab;if(!c)return;
if(c.st==='walk'){
const p=players.get(c.pid);
if(!p||p.st==='walkout'||!(p.st==='wait'||p.st==='bite'||p.st==='reel')){c.st='leave';c.f=1;return}
const ps=pPos(p),dx=ps.bx-c.x,dy=ps.by-c.y,d=Math.hypot(dx,dy),st=c.sp*dt;c.t+=dt;
if(d<=Math.max(10,st)){c.x=ps.bx;c.y=ps.by;snip(p)}else{c.x+=dx/d*st;c.y+=dy/d*st}
if(Math.random()<dt*3)addRipple(c.x,c.y+16,false)}
else{c.f-=dt*1.2;if(c.f<=0)crab=null}}
function slip(u){
if(slipCD>0)return;
const t=tops.find(s=>{const p=players.get(s.id);return p&&p.st!=='walkout'});
if(!t)return;
const p=players.get(t.id),ps=pPos(p);slipCD=6;p.stun=2;
const sx=ps.x<540?ps.x+280:ps.x-280,sy=ps.y-170;
emoPart('🩴',sx,sy,(ps.x-sx)/.5,(ps.y-24-sy)/.5,0,.5,52);
setTimeout(()=>{dotP(ps.x,ps.y-30,'#ffe27a',8);SFX.splat()},480);
setBanner((u&&u.name?u.name:'Ai đó')+' ném dép trúng Top 1: '+p.name+'!','🩴',3,'#ffe27a');say((u&&u.name?u.name:'Ai đó')+' ném dép trúng '+p.name+'!',5)}
function computeTops(){
tops=[...scores.values()].filter(s=>s.catches>0).sort((a,b)=>b.kg-a.kg||b.species.size-a.species.size).slice(0,10);
leader=tops.length&&tops[0].kg>0?tops[0].id:null;
const sg=tops.map(s=>s.id+':'+s.kg+':'+s.species.size+(s.av?1:0)).join('|');
if(sg!==lbSig){lbSig=sg;lbDirty=true}}
function update(dt){
spotCD=Math.max(0,spotCD-dt);frenzyCD=Math.max(0,frenzyCD-dt);slipCD=Math.max(0,slipCD-dt);shk=Math.max(0,shk-dt*2);
if(frenzy>0){frenzy-=dt;if(frenzy<=0){frenzy=0;Music.setMode('calm');buildFish();setBanner('Hết Golden Frenzy','🌙',2.5,'#ffffff')}}
if(banner){banner.t-=dt;if(banner.t<=0)banner=null}
if(card){card.t-=dt;if(card.t<=0)card=null}
for(const p of players.values())updP(p,dt);
const fm=frenzy>0?1.4:1;
for(const f of fish){
f.tt-=dt;if(f.tt<=0){f.tt=rd(1.5,4);f.ta=rd(-1,1)}
const xl=230+f.len*.5,xh=850-f.len*.5,yl=530+f.len*.5,yh=1600-f.len*.5;
if(f.x<xl+45||f.x>xh-45||f.y<yl+45||f.y>yh-45){const d=Math.atan2(1065-f.y,540-f.x);let df=d-f.a;df=Math.atan2(Math.sin(df),Math.cos(df));f.a+=df*Math.min(1,dt*3)}
else f.a+=f.ta*dt*.9+Math.sin(T*.8+f.ph)*dt*.3;
f.x+=Math.cos(f.a)*f.v*fm*dt;f.y+=Math.sin(f.a)*f.v*fm*dt;
if(f.x<xl){f.x=xl;f.a=Math.PI-f.a}else if(f.x>xh){f.x=xh;f.a=Math.PI-f.a}
if(f.y<yl){f.y=yl;f.a=-f.a}else if(f.y>yh){f.y=yh;f.a=-f.a}}
rpT-=dt;if(rpT<=0){rpT=rd(.9,1.8);if(ripples.length<20)addRipple(rd(200,880),rd(480,1660),false)}
for(let i=ripples.length-1;i>=0;i--){const r=ripples[i];r.t+=dt;r.r+=dt*70;if(r.t>=1)ripples.splice(i,1)}
for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.t+=dt;if(q.t>=q.m){parts.splice(i,1);continue}q.vy+=(q.g||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.r!==undefined)q.r+=q.vr*dt}
for(let i=npcs.length-1;i>=0;i--)updNpc(npcs[i],dt,i);
updCrab(dt);
if(SP){
const p=players.get(SP.pid);
if(!p||p.st==='walkout'){SP=null;spotCD=CFG.spotCooldown}
else{
SP.a=Math.min(1,SP.a+dt*2.5);SP.ph+=dt;
if(SP.res){SP.rt-=dt;if(SP.rt<=0)endSpot()}
else{
SP.t-=dt;SP.v=Math.max(0,SP.v-1.2*dt);
SP.fx=SP.bx+Math.sin(SP.ph*3.1)*38+Math.sin(SP.ph*7.3)*12;SP.fy=SP.by+Math.cos(SP.ph*2.3)*26;
if(SP.jt>0){SP.jt-=dt;SP.jh=Math.sin(Math.PI*(1-Math.max(0,SP.jt)/.75))*170;if(SP.jt<=0){SP.jh=0;SP.jc=rd(1.4,2.8);qSplash(SP.fx,SP.fy);dotP(SP.fx,SP.fy,'#e8fbff',12);/*DROPLETS*/shk=Math.max(shk,.35)}}
else{SP.jc-=dt;if(SP.jc<=0){SP.jt=.75;qSplash(SP.fx,SP.fy);dotP(SP.fx,SP.fy,'#e8fbff',8)}}
if(SP.v>=CFG.qteWinTarget)qteWin(false);else if(SP.v<=0||SP.t<=0)qteFall()}}}
if(players.size>0){
evT-=dt;thT-=dt;
if(evT<=0)evT=spawnCrab(false)?rd(110,160):15;
if(thT<=0)thT=spawnThief(Math.random()<.5?'dog':'cat',false)?rd(60,100):15}
if(SP){cam.tz=1.8;cam.tx=(SP.ax+SP.bx)/2;cam.ty=(SP.ay+SP.by)/2-20}else{cam.tz=1;cam.tx=540;cam.ty=960}
const k=Math.min(1,dt*4);cam.z+=(cam.tz-cam.z)*k;
const ex=clp(cam.tx,540/cam.tz,W-540/cam.tz),ey=clp(cam.ty,960/cam.tz,H-960/cam.tz);
cam.x+=(ex-cam.x)*k;cam.y+=(ey-cam.y)*k;
const hx=540/cam.z,hy=960/cam.z;cam.x=clp(cam.x,hx,W-hx);cam.y=clp(cam.y,hy,H-hy);
tpT-=dt;if(tpT<=0){tpT=.5;computeTops()}
pruT-=dt;if(pruT<=0){pruT=60;if(scores.size>800){const a=[...scores.values()].filter(s=>!players.has(s.id)).sort((x,y)=>x.kg-y.kg);for(let i=0;i<a.length&&scores.size>600;i++)scores.delete(a[i].id)}}}
function norm(t){return String(t).replace(/[đĐ]/g,'d').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function handleChat(u,t){
if(!u||!u.id)return;
const n=norm(t),ex=players.get(u.id);
if(ex&&ex.st!=='walkout'){ex.afk=0;ex.afkW=0}
if(frenzy<=0){energy=Math.min(100,energy+CFG.chatEnergy);if(energy>=100&&frenzyCD<=0)triggerFrenzy(false)}
switch(n){
case'cau':case'cauca':{const p=join(u);if(p){p.want=1;p.afk=0}break}
case'thaymoi':{const p=join(u);if(p){p.boost=2;p.want=1;const ps=pPos(p);txtPart(ps.x,ps.y-60,'Thay mồi!','#ffd84a')}break}
case'nemdep':slip(u);break;
case'keo':if(SP&&!SP.res)qAct(u.id===SP.pid?9:6,u);break;
case'pha':case'tha':if(SP&&!SP.res)qAct(-5,u);break;
case'duoi':case'suyt':shoo(u);break;
}}
function handleLike(u,c){
if(!u||!u.id)return;c=Math.max(1,c|0);
const p=join(u);
if(npcs.some(n=>n.st!=='flee'))shoo(u);
if(SP&&!SP.res)qAct(1,u);
if(!p)return;
p.afk=0;p.afkW=0;p.autoCast=30;p.want=1;
if(frenzy<=0){energy=Math.min(100,energy+Math.min(c,100)*CFG.likeEnergy);if(energy>=100&&frenzyCD<=0)triggerFrenzy(false)}}
function handleFollow(u){const p=join(u);if(!p)return;p.want=1;p.afk=0;const ps=pPos(p);txtPart(ps.x,ps.y-60,'Follow!','#ff9ccb');say('Cảm ơn '+p.name+' đã theo dõi!',2)}
function handleGift(u,coins,name,cnt){
const p=join(u);if(!p)return;
coins=Math.max(1,coins|0);p.afk=0;p.afkW=0;
const s=sc(p),own=inQte(p),nm=p.name;
SFX.bell();
if(coins>=100){
s.rodLevel=2;makeVip(p);const kg=bigNet(p);p.keep=Math.max(p.keep,60);p.boost=5;p.shield=1;p.want=1;triggerFrenzy(true);
showCard(p,'MVP ĐẠI GIA','Lưới Rồng: 8 cá huyền thoại · +'+kg+' kg','Cần Carbon · Golden Frenzy · Du thuyền VIP','🐉');
say(nm+' thả lưới rồng! Tám cá huyền thoại! Cần cacbon!',8)}
else if(coins>=30){
s.rodLevel=Math.min(2,s.rodLevel+1);makeVip(p);p.keep=Math.max(p.keep,60);p.boost=5;p.want=1;
setBanner(nm+' nâng cấp cần câu '+(s.rodLevel===2?'Carbon':'Máy')+'!','🎣',3.2,'#7ee8ff');say(nm+' nâng cấp cần câu và lên du thuyền VIP!',7)}
else if(coins>=2){
p.boost=5;p.keep=Math.max(p.keep,60);p.shield=1;p.want=1;
setBanner(nm+': Thay mồi x5, tự câu 60s, Khiên chống trộm','🛡️',3.2,'#9fffa8');say('Cảm ơn '+nm+'! Mồi ngon và khiên chống trộm!',5)}
else if(!own){
const f=rollFish(p,'legend');
if(!SP&&p.st!=='fight'){startSpot(p,f,false);say(nm+' tặng hoa hồng! Cá huyền thoại cắn câu!',6)}
else{const kg=award(p,f,1);setBanner('Hoa hồng của '+nm+': bắt ngay '+f.n+' '+kg+'kg','🌹',3,'#ffd84a');say(nm+' tặng hoa hồng, bắt được '+f.n+'!',6)}}
if(own&&SP&&!SP.res){setBanner(nm+' tặng quà: ZAP hạ gục cá khổng lồ!','⚡',3,'#fff36b');qteWin(true)}}
let mi=0;
const MN=['Minh','Lan','Hùng','Trang','Tuấn','Hoa','Nam','Linh','Khánh','Mai','Phúc','Thảo','Bảo','Vy','Đạt','Ngọc','Long','Hạnh','Quân','Yến'];
const mu=()=>{mi++;return{id:'mock'+mi,name:MN[mi%MN.length]+' '+mi,pic:''}};
const live=()=>[...players.values()].filter(p=>p.st!=='walkout');
const mx=()=>{const a=live();if(a.length&&Math.random()<.75){const p=a[Math.random()*a.length|0];return{id:p.id,name:p.name,pic:p.pic}}return mu()};
function mockSpot(fake){
if(SP)return;
const p=join(mx());if(!p)return;
const fl=BYC.junk.filter(x=>x.f);
const f=fake?fl[Math.random()*fl.length|0]:rollFish(p,Math.random()<.5?'legend':'rare');
startSpot(p,f,fake)}
function mockAfk(v){
let a=live().filter(p=>!immune(p));
if(!a.length){const p=join(mu());if(!p)return;a=[p]}
const p=a[Math.random()*a.length|0];p.afk=Math.max(p.afk,v)}
window.mockEvent=function(k){
switch(k){
case'cau':handleChat(mu(),'câu');break;
case'like':handleLike(mx(),12);break;
case'bait':handleChat(mx(),'thay mồi');break;
case'rose':handleGift(mx(),1,'Rose',1);break;
case'small':handleGift(mx(),5,'Gift',1);break;
case'vipgift':handleGift(mx(),50,'Gift',1);break;
case'big':handleGift(mx(),200,'Gift',1);break;
case'spot':mockSpot(false);break;
case'fake':mockSpot(true);break;
case'keo':handleChat(mu(),'kéo');break;
case'pha':handleChat(mu(),'phá');break;
case'slip':handleChat(mx(),'ném dép');break;
case'crab':spawnCrab(true);break;
case'dog':spawnThief('dog',true);break;
case'cat':spawnThief('cat',true);break;
case'shoo':handleChat(mx(),'đuổi');break;
case'afkwarn':mockAfk(150);break;
case'afkout':mockAfk(179.9);break;
case'frenzy':triggerFrenzy(true);break;
}};
const sock=io();
sock.on('chat',d=>handleChat(d.user,d.text));
sock.on('like',d=>handleLike(d.user,d.count));
sock.on('follow',d=>handleFollow(d.user));
sock.on('gift',d=>handleGift(d.user,d.coins,d.name,d.count));
sock.on('status',d=>{tst=d||tst});
