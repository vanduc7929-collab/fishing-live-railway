const emoCache=new Map();
let pierCache=null,bgCache=null,vigCache=null,lbCache=null,lbCtx=null,lbT=-9,lastTs=0;
const FONT='"Segoe UI",Roboto,Arial,sans-serif';
const SKIN=['#ffdbb5','#f5c18f','#e0a070','#c68642'],VEST=['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22','#34495e'],HAIR=['#2d1e12','#5a3a1c','#141414','#8b5a2b','#b03a2e','#e8c14a'],HCOL=['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c'];
const PAL=[['#ff9f43','#d9731a'],['#f1f2f6','#aab0bd'],['#5f7a95','#3d546b'],['#e8685a','#b84336'],['#fdcb6e','#d79a2a'],['#74b9ff','#3c83d1']],PALG=[['#ffd32a','#c79a00'],['#ffb142','#c97d12'],['#fff3a0','#d9b93a']],QC={common:['#8fa8bf','#5f7a95'],rare:['#ff9f43','#d9731a'],legend:['#ffd32a','#e0a500'],junk:['#ff9f43','#d9731a']};
function mkc(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function emo(e){let c=emoCache.get(e);if(!c){c=mkc(96,96);const x=c.getContext('2d');x.font='72px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,48,52);emoCache.set(e,c)}return c}
function dE(e,x,y,s,a,r){const c=emo(e);g.save();if(a!==undefined&&a!==null)g.globalAlpha*=a;g.translate(x,y);if(r)g.rotate(r);g.drawImage(c,-s/2,-s/2,s,s);g.restore()}
function rr(c,x,y,w,h,r){c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function tx(s,x,y,f,c,al,st){g.font=f;g.textAlign=al||'left';g.textBaseline='middle';g.lineJoin='round';if(st!==0){g.lineWidth=4;g.strokeStyle=st||'rgba(0,0,0,.7)';g.strokeText(s,x,y)}g.fillStyle=c;g.fillText(s,x,y)}
function ftx(s,x,y,mw,fs,c,al){g.font='bold '+fs+'px '+FONT;const w=g.measureText(s).width;if(w>mw)fs=Math.max(10,Math.floor(fs*mw/w));tx(s,x,y,'bold '+fs+'px '+FONT,c,al)}
function vis(x,y,m){return cam.z<=1.15||(Math.abs(x-cam.x)<540/cam.z+m&&Math.abs(y-cam.y)<960/cam.z+m)}
function pad(x,a,b,r,rot,fl){
x.save();x.translate(a,b);x.rotate(rot);
x.fillStyle='rgba(0,45,60,.2)';x.beginPath();x.ellipse(4,5,r,r*.92,0,0,6.3);x.fill();
x.fillStyle='#3fae54';x.beginPath();x.moveTo(0,0);x.arc(0,0,r,.4,6.28-.4);x.closePath();x.fill();
x.strokeStyle='#2a8640';x.lineWidth=2;x.stroke();
x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=1.2;
for(let i=1;i<6;i++){const an=.4+i*(5.48/6);x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(an)*r*.85,Math.sin(an)*r*.85);x.stroke()}
if(fl){for(let i=0;i<8;i++){x.save();x.rotate(i*Math.PI/4);x.fillStyle=i%2?'#ffc2e0':'#ff9ccb';x.beginPath();x.ellipse(0,-8,4.5,10,0,0,6.3);x.fill();x.restore()}
x.fillStyle='#ffe066';x.beginPath();x.arc(0,0,4,0,6.3);x.fill()}
x.restore()}
function pier(x,a,b,w,h,left){
x.fillStyle='rgba(0,40,60,.25)';x.fillRect(a+(left?8:-8),b+10,w,h);
x.fillStyle='#8c6233';x.fillRect(a,b,w,h);
for(let y=b,i=0;y<b+h;y+=15,i++){x.fillStyle=i%2?'#9c6f3b':'#86592c';x.fillRect(a+2,y+1,w-4,13);x.fillStyle='rgba(60,35,10,.5)';x.fillRect(a+2,y+13,w-4,2)}
x.fillStyle='#5e3d1b';x.fillRect(a,b,w,5);x.fillRect(a,b+h-5,w,5);
x.fillStyle='#4e3216';x.fillRect(left?a+w-8:a,b,8,h);
for(let y=b+30;y<b+h;y+=190){const px=left?a+w-4:a+4;x.fillStyle='#4a2f14';x.beginPath();x.arc(px,y,9,0,6.3);x.fill();x.fillStyle='#7a5527';x.beginPath();x.arc(px,y-1,6,0,6.3);x.fill()}}
function fence(x,a1,b1,a2,b2){
const n=Math.hypot(a2-a1,b2-b1),ux=(a2-a1)/n,uy=(b2-b1)/n,nx=-uy,ny=ux;
x.strokeStyle='#7a5a32';x.lineWidth=5;x.lineCap='round';x.beginPath();
x.moveTo(a1+nx*-9,b1+ny*-9);x.lineTo(a2+nx*-9,b2+ny*-9);x.moveTo(a1+nx*5,b1+ny*5);x.lineTo(a2+nx*5,b2+ny*5);x.stroke();
for(let d=0;d<=n;d+=50){const a=a1+ux*d,b=b1+uy*d;x.fillStyle='#8d6a3c';x.beginPath();x.arc(a,b,6.5,0,6.3);x.fill();x.fillStyle='#b58a4f';x.beginPath();x.arc(a-1,b-1,3.5,0,6.3);x.fill()}}
function lantern(x,a,b){
x.fillStyle='#4a3a2a';x.fillRect(a-2.5,b,5,44);
const gr=x.createRadialGradient(a,b-6,2,a,b-6,48);gr.addColorStop(0,'rgba(255,220,120,.5)');gr.addColorStop(1,'rgba(255,220,120,0)');x.fillStyle=gr;x.fillRect(a-50,b-56,100,100);
x.fillStyle='#3b2d20';x.beginPath();rr(x,a-10,b-24,20,6,2);x.fill();
x.fillStyle='#ffd166';x.beginPath();rr(x,a-8,b-18,16,22,5);x.fill();x.strokeStyle='#a8741a';x.lineWidth=2;x.stroke();
x.fillStyle='#3b2d20';x.fillRect(a-9,b+3,18,4)}
function buildBG(){
const c=mkc(W,H),x=c.getContext('2d'),R=rng(11);
if(!TR){
const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#58b058');gr.addColorStop(.5,'#47a04a');gr.addColorStop(1,'#3a8c40');x.fillStyle=gr;x.fillRect(0,0,W,H);
for(let i=0;i<60;i++){x.fillStyle=R()<.5?'rgba(40,120,50,.16)':'rgba(150,220,110,.14)';x.beginPath();x.ellipse(R()*W,R()*H,40+R()*90,20+R()*50,R()*3,0,6.3);x.fill()}
for(let i=0;i<1500;i++){const a=R()*W,b=R()*H;x.strokeStyle=R()<.5?'rgba(30,105,40,.55)':'rgba(140,210,95,.5)';x.lineWidth=2;x.beginPath();x.moveTo(a,b);x.lineTo(a+(R()-.5)*6,b-6-R()*7);x.stroke()}
for(let i=0;i<140;i++){x.fillStyle=['#fff','#ffe66d','#ff9ff3','#ffd1a1'][i%4];x.beginPath();x.arc(R()*W,R()*H,2.4,0,6.3);x.fill()}}
x.save();x.beginPath();rr(x,48,330,984,1500,26);rr(x,150,420,780,1300,70);x.clip('evenodd');
x.fillStyle='#cdbf9f';x.fillRect(40,320,1000,1520);
const SC=['#b7ab8f','#d8cbac','#a89d85','#c8bc9d','#e0d4b5'];
for(let b=326,r=0;b<1840;b+=22,r++)for(let a=44+(r%2)*12;a<1040;a+=26){x.fillStyle=SC[(R()*5)|0];x.strokeStyle='rgba(70,60,40,.4)';x.lineWidth=1.5;x.beginPath();x.ellipse(a+R()*4,b+R()*3,11+R()*2,9+R()*2,0,0,6.3);x.fill();x.stroke()}
x.restore();
x.save();x.beginPath();rr(x,150,420,780,1300,70);x.clip();
const wg=x.createRadialGradient(540,1070,60,540,1070,820);wg.addColorStop(0,'#2fd0cf');wg.addColorStop(.55,'#17a3b6');wg.addColorStop(1,'#0a6a8c');x.fillStyle=wg;x.fillRect(150,420,780,1300);
for(let i=0;i<26;i++){x.fillStyle='rgba(0,50,90,.09)';x.beginPath();x.ellipse(200+R()*680,480+R()*1180,40+R()*110,30+R()*80,R()*3,0,6.3);x.fill()}
for(let i=0;i<14;i++){x.fillStyle='rgba(190,255,245,.08)';x.beginPath();x.ellipse(200+R()*680,480+R()*1180,30+R()*70,20+R()*50,R()*3,0,6.3);x.fill()}
for(let i=0;i<220;i++){x.strokeStyle='rgba(255,255,255,'+(.05+R()*.07)+')';x.lineWidth=2;x.beginPath();x.arc(170+R()*740,440+R()*1260,6+R()*14,3.6,5.6);x.stroke()}
for(let i=0;i<7;i++){x.strokeStyle='rgba(200,255,240,'+(.16-i*.02)+')';x.lineWidth=7;x.beginPath();rr(x,150+i*9,420+i*9,780-i*18,1300-i*18,70-i*5);x.stroke()}
x.restore();
x.lineWidth=12;x.strokeStyle='#e6d9b4';x.beginPath();rr(x,150,420,780,1300,70);x.stroke();
x.lineWidth=3;x.strokeStyle='#8a7752';x.beginPath();rr(x,144,414,792,1312,76);x.stroke();
for(let i=0;i<60;i++){const s=i%4,t=R();let a,b;if(s===0){a=170+t*740;b=412}else if(s===1){a=170+t*740;b=1728}else if(s===2){a=142;b=440+t*1260}else{a=938;b=440+t*1260}
const rx=5+R()*7;x.fillStyle=R()<.5?'#9aa0a6':'#b8bdc2';x.beginPath();x.ellipse(a,b,rx,rx*.75,0,0,6.3);x.fill();x.fillStyle='rgba(255,255,255,.4)';x.beginPath();x.ellipse(a-rx*.3,b-rx*.3,rx*.35,rx*.2,0,0,6.3);x.fill()}
lilies.length=0;let tr=0;
while(lilies.length<16&&tr<500){tr++;const a=190+R()*700,b=470+R()*1180,de=Math.min(a-150,930-a,b-420,1720-b);if(de>150||de<40)continue;lilies.push({x:a,y:b,r:20+R()*16,rot:R()*6.28,fl:R()<.4})}
for(const l of lilies)pad(x,l.x,l.y,l.r,l.rot,l.fl);
fence(x,24,322,1056,322);fence(x,24,1838,1056,1838);fence(x,24,322,24,1838);fence(x,1056,322,1056,1838);
const pc=mkc(W,H),px=pc.getContext('2d');pier(px,28,478,172,1130,true);pier(px,880,478,172,1130,false);pierCache=pc;
[[40,350],[40,1790],[1040,350],[1040,1790],[40,452],[1040,452],[40,1625],[1040,1625]].forEach(a=>lantern(x,a[0],a[1]));
bgCache=c;
vigCache=mkc(1400,1400);
{const v=vigCache.getContext('2d'),gr=v.createRadialGradient(700,700,0,700,700,700);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.28,'rgba(0,0,0,0)');gr.addColorStop(.6,'rgba(0,10,25,.55)');gr.addColorStop(1,'rgba(0,10,25,.82)');v.fillStyle=gr;v.fillRect(0,0,1400,1400)}}
function fishShape(x,y,a,L,wag,col,dk){
const ux=Math.cos(a),uy=Math.sin(a),a2=a+wag*.35,a3=a+wag*.9;
const x2=x-ux*L*.38,y2=y-uy*L*.38,x3=x2-Math.cos(a2)*L*.34,y3=y2-Math.sin(a2)*L*.34,x4=x3-Math.cos(a3)*L*.22,y4=y3-Math.sin(a3)*L*.22;
const n1x=-Math.sin(a),n1y=Math.cos(a),n2x=-Math.sin(a2),n2y=Math.cos(a2),n3x=-Math.sin(a3),n3y=Math.cos(a3);
const w1=L*.17,w2=L*.2,w3=L*.08,wt=L*.17;
g.fillStyle=dk;g.beginPath();g.moveTo(x+n1x*w1*.9,y+n1y*w1*.9);g.lineTo(x2+n2x*(w2+L*.1)+Math.cos(a2)*L*.05,y2+n2y*(w2+L*.1)+Math.sin(a2)*L*.05);g.lineTo(x2+n2x*w2*.8-Math.cos(a2)*L*.12,y2+n2y*w2*.8-Math.sin(a2)*L*.12);g.closePath();g.fill();
g.fillStyle=col;g.beginPath();
g.moveTo(x+ux*L*.3,y+uy*L*.3);
g.quadraticCurveTo(x+n1x*w1*1.2,y+n1y*w1*1.2,x2+n2x*w2,y2+n2y*w2);
g.quadraticCurveTo(x3+n3x*w3*2,y3+n3y*w3*2,x3+n3x*w3,y3+n3y*w3);
g.lineTo(x4+n3x*wt,y4+n3y*wt);g.lineTo(x4-n3x*wt,y4-n3y*wt);g.lineTo(x3-n3x*w3,y3-n3y*w3);
g.quadraticCurveTo(x3-n3x*w3*2,y3-n3y*w3*2,x2-n2x*w2,y2-n2y*w2);
g.quadraticCurveTo(x-n1x*w1*1.2,y-n1y*w1*1.2,x+ux*L*.3,y+uy*L*.3);
g.closePath();g.fill();
g.fillStyle='#fff';g.beginPath();g.arc(x+ux*L*.13+n1x*w1*.5,y+uy*L*.13+n1y*w1*.5,L*.045,0,6.3);g.fill();
g.fillStyle='#111';g.beginPath();g.arc(x+ux*L*.14+n1x*w1*.5,y+uy*L*.14+n1y*w1*.5,L*.022,0,6.3);g.fill()}
const FCOL={koi:[['#e8452c','#ff8a3d'],['#d62f3a','#ff9f43'],['#f05a28','#ffb347']],carp:[['#d9922b','#b8721a','#f0b552'],['#e0a030','#b87a20','#f7c76a'],['#cf8420','#a86414','#e9a944']],arowana:[['#c8352b','#e8b84a'],['#b02a2a','#f0c456'],['#d4452a','#ffd070']],snakehead:[['#4d5a2a','#2c3516','#5f6e34'],['#3f4b24','#232a12','#566330'],['#59622e','#333a18','#6d7a3c']],turtle:[['#8a6a1e','#ffd84a','#8fb56a'],['#7a5c18','#f1c40f','#7fa65a'],['#9a7a28','#ffe27a','#9bc27a']]};
function fbody(L,wf,col){g.fillStyle=col;g.beginPath();g.moveTo(L*.5,0);g.bezierCurveTo(L*.42,-wf*1.15,L*.05,-wf*1.2,-L*.36,-wf*.3);g.lineTo(-L*.36,wf*.3);g.bezierCurveTo(L*.05,wf*1.2,L*.42,wf*1.15,L*.5,0);g.closePath();g.fill()}
function fin(s,x,y,l,w,ang,col){g.save();g.translate(x,y);g.rotate(Math.PI-s*ang);g.fillStyle=col;g.beginPath();g.ellipse(l*.5,0,l*.5,w,0,0,6.3);g.fill();g.restore()}
function feye(L,wf){g.fillStyle='#111';for(const s of[-1,1]){g.beginPath();g.arc(L*.34,s*wf*.5,Math.max(1.6,L*.025),0,6.3);g.fill()}}
function drawFish1(f){
const L=f.len,wg=Math.sin(T*f.sw+f.ph),fl=Math.sin(T*f.sw*.7+f.ph),c=FCOL[f.type][f.cv%3];
g.save();g.translate(f.x,f.y);g.rotate(f.a);g.globalAlpha=f.al;
if(f.type==='koi'){
const wf=L*.2;
g.save();g.translate(-L*.34,0);g.rotate(wg*.4);g.fillStyle='rgba(255,236,214,.92)';g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-L*.18,-L*.2,-L*.38,-L*.24,-L*.36,-L*.04);g.lineTo(-L*.3,0);g.lineTo(-L*.36,L*.04);g.bezierCurveTo(-L*.38,L*.24,-L*.18,L*.2,0,0);g.closePath();g.fill();g.restore();
fin(-1,L*.2,-wf*.9,L*.28,L*.06,.7+fl*.3,'rgba(255,236,214,.9)');fin(1,L*.2,wf*.9,L*.28,L*.06,.7+fl*.3,'rgba(255,236,214,.9)');
fbody(L,wf,'#fff0e0');
g.fillStyle=c[0];g.beginPath();g.ellipse(L*.18,-wf*.25,L*.11,wf*.5,.3,0,6.3);g.fill();
g.fillStyle=c[1];g.beginPath();g.ellipse(-L*.04,wf*.3,L*.13,wf*.45,-.2,0,6.3);g.fill();
g.fillStyle=c[0];g.beginPath();g.ellipse(-L*.22,-wf*.1,L*.08,wf*.4,0,0,6.3);g.fill();
g.beginPath();g.ellipse(L*.36,0,L*.06,wf*.35,0,0,6.3);g.fill();
feye(L,wf)}
else if(f.type==='carp'){
const wf=L*.21;
g.save();g.translate(-L*.34,0);g.rotate(wg*.35);g.fillStyle=c[1];g.beginPath();g.moveTo(0,-wf*.3);g.lineTo(-L*.26,-L*.2);g.lineTo(-L*.17,0);g.lineTo(-L*.26,L*.2);g.lineTo(0,wf*.3);g.closePath();g.fill();g.restore();
fin(-1,L*.18,-wf*.95,L*.22,L*.07,.9+fl*.25,c[1]);fin(1,L*.18,wf*.95,L*.22,L*.07,.9+fl*.25,c[1]);
fbody(L,wf,c[0]);
g.strokeStyle=c[1];g.lineWidth=Math.max(2,L*.05);g.lineCap='round';g.beginPath();g.moveTo(L*.36,0);g.lineTo(-L*.3,0);g.stroke();
g.strokeStyle=c[2];g.lineWidth=1.2;
for(let i=0;i<5;i++)for(const s of[-1,1]){g.beginPath();g.arc(L*.22-i*L*.12,s*wf*.5,L*.045,0,Math.PI);g.stroke()}
feye(L,wf)}
else if(f.type==='arowana'){
const wf=L*.11;
g.save();g.translate(-L*.36,0);g.rotate(wg*.3);g.fillStyle=c[0];g.beginPath();g.moveTo(0,-L*.03);g.quadraticCurveTo(-L*.26,-L*.2,-L*.3,0);g.quadraticCurveTo(-L*.26,L*.2,0,L*.03);g.closePath();g.fill();g.restore();
g.fillStyle=c[0];
for(const s of[-1,1]){g.beginPath();g.moveTo(-L*.02,s*wf*.9);g.quadraticCurveTo(-L*.2,s*(wf+L*.1),-L*.34,s*wf*.4);g.lineTo(-L*.3,s*wf*.15);g.closePath();g.fill()}
fin(-1,L*.28,-wf*.9,L*.15,L*.035,.7+fl*.25,c[1]);fin(1,L*.28,wf*.9,L*.15,L*.035,.7+fl*.25,c[1]);
fbody(L,wf,c[0]);
g.strokeStyle=c[1];g.lineWidth=Math.max(1.6,L*.035);g.lineCap='round';
for(const s of[-1,1]){g.beginPath();g.moveTo(L*.3,s*wf*.45);g.lineTo(-L*.3,s*wf*.35);g.stroke()}
g.fillStyle=c[1];g.beginPath();g.ellipse(L*.4,0,L*.1,wf*.7,0,0,6.3);g.fill();
feye(L,wf)}
else if(f.type==='snakehead'){
const wf=L*.14;
g.save();g.translate(-L*.35,0);g.rotate(wg*.4);g.fillStyle=c[1];g.beginPath();g.ellipse(-L*.08,0,L*.1,wf*.9,0,0,6.3);g.fill();g.restore();
fin(-1,L*.25,-wf*.9,L*.12,L*.04,.8+fl*.25,c[2]);fin(1,L*.25,wf*.9,L*.12,L*.04,.8+fl*.25,c[2]);
fbody(L,wf,c[0]);
g.strokeStyle=c[1];g.lineWidth=Math.max(2,L*.045);g.lineCap='round';
for(let i=0;i<5;i++){const x=L*.26-i*L*.14;g.beginPath();g.moveTo(x,-wf*.7);g.lineTo(x-L*.03,wf*.7);g.stroke()}
g.strokeStyle=c[2];g.lineWidth=Math.max(1.6,L*.04);g.beginPath();g.moveTo(L*.2,0);g.lineTo(-L*.32,0);g.stroke();
g.fillStyle=c[2];g.beginPath();g.ellipse(L*.38,0,L*.13,wf*.85,0,0,6.3);g.fill();
feye(L,wf)}
else{
const R=L*.38,sw=Math.sin(T*3+f.ph);
g.fillStyle=c[2];
g.beginPath();g.moveTo(-R*.95,0);g.lineTo(-R*1.3,-L*.04);g.lineTo(-R*1.3,L*.04);g.closePath();g.fill();
fin(-1,L*.2,-R*.8,L*.28,L*.07,.9+sw*.5,c[2]);fin(1,L*.2,R*.8,L*.28,L*.07,.9-sw*.5,c[2]);
fin(-1,-L*.2,-R*.65,L*.2,L*.06,.9-sw*.5,c[2]);fin(1,-L*.2,R*.65,L*.2,L*.06,.9+sw*.5,c[2]);
g.beginPath();g.ellipse(R*1.05+sw*L*.01,0,L*.1,L*.075,0,0,6.3);g.fill();
g.fillStyle='#111';g.beginPath();g.arc(R*1.15,-L*.04,Math.max(1.4,L*.018),0,6.3);g.arc(R*1.15,L*.04,Math.max(1.4,L*.018),0,6.3);g.fill();
g.fillStyle=c[0];g.beginPath();g.ellipse(0,0,R,R*.92,0,0,6.3);g.fill();
g.strokeStyle=c[1];g.lineWidth=Math.max(3,L*.07);g.stroke();
g.strokeStyle='rgba(255,226,120,.75)';g.lineWidth=1.6;
g.beginPath();g.ellipse(0,0,R*.4,R*.36,0,0,6.3);g.stroke();
for(let i=0;i<6;i++){const an=i*Math.PI/3+.5;g.beginPath();g.moveTo(Math.cos(an)*R*.4,Math.sin(an)*R*.36);g.lineTo(Math.cos(an)*R*.86,Math.sin(an)*R*.8);g.stroke()}}
g.restore()}
function drawFishes(){
for(const f of fish){if(!vis(f.x,f.y,100))continue;drawFish1(f)}
g.globalAlpha=1}
function drawRipples(){
for(const r of ripples){if(!vis(r.x,r.y,60))continue;g.globalAlpha=Math.max(0,(1-r.t)*(r.gold?.9:.5));g.strokeStyle=r.gold?'#ffd84a':'#e8fbff';g.lineWidth=r.gold?3:2;g.beginPath();g.ellipse(r.x,r.y,r.r,r.r*.55,0,0,6.3);g.stroke()}
g.globalAlpha=1}
function frenzyFx(){
g.fillStyle='rgba(255,214,60,'+(.08+.04*Math.sin(T*4))+')';g.beginPath();rr(g,150,420,780,1300,70);g.fill();
g.fillStyle='#fff3a0';
for(let i=0;i<12;i++){const x=150+((i*97+T*(18+i%4*9))%780),y=420+((i*173+T*(12+i%3*8))%1300),s=3+Math.abs(Math.sin(T*3+i))*4;if(!vis(x,y,20))continue;g.beginPath();g.moveTo(x,y-s*2);g.lineTo(x+s*.6,y-s*.6);g.lineTo(x+s*2,y);g.lineTo(x+s*.6,y+s*.6);g.lineTo(x,y+s*2);g.lineTo(x-s*.6,y+s*.6);g.lineTo(x-s*2,y);g.lineTo(x-s*.6,y-s*.6);g.closePath();g.fill()}}
function drawCrab(){
const c=crab;if(!vis(c.x,c.y,80))return;
g.globalAlpha=Math.max(0,Math.min(1,c.f));
g.fillStyle='rgba(0,40,60,.3)';g.beginPath();g.ellipse(c.x,c.y+30,36,10,0,0,6.3);g.fill();
dE('🦀',c.x,c.y+Math.sin(T*12)*2,88,1,Math.sin(T*10)*.15);
g.globalAlpha=1}
function drawYacht(p){
const i=p.vip.i,v=VPOS[i],x=v.x,y=v.y+10+Math.sin(T*1.6+i)*1.5;
if(!vis(x,y,90))return;
g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=2;g.beginPath();g.ellipse(x,y+22,62,14,0,0,6.3);g.stroke();
g.fillStyle='#f5f6fa';g.beginPath();g.moveTo(x-52,y-6);g.lineTo(x+52,y-6);g.quadraticCurveTo(x+48,y+22,x+30,y+25);g.lineTo(x-30,y+25);g.quadraticCurveTo(x-48,y+22,x-52,y-6);g.closePath();g.fill();
g.strokeStyle='#9aa4b2';g.lineWidth=2;g.stroke();
g.fillStyle='#f1c40f';g.fillRect(x-49,y+3,98,5);
g.fillStyle='#34495e';g.fillRect(x-40,y+16,80,5);
g.fillStyle='#dfe6e9';g.beginPath();rr(g,x+22,y-28,26,22,5);g.fill();g.strokeStyle='#9aa4b2';g.stroke();
g.fillStyle='#74b9ff';g.fillRect(x+27,y-22,7,8);g.fillRect(x+37,y-22,7,8);
g.strokeStyle='#7a5a32';g.lineWidth=3;g.beginPath();g.moveTo(x-42,y-6);g.lineTo(x-42,y-34);g.stroke();
g.fillStyle='#e74c3c';g.beginPath();g.moveTo(x-42,y-34);g.lineTo(x-24,y-28);g.lineTo(x-42,y-22);g.closePath();g.fill();
tx('VIP '+Math.ceil(p.vip.t)+'s',x,y+38,'bold 14px '+FONT,'#ffe27a','center')}
function outV(d){return d==='right'?{x:-1,y:0}:d==='left'?{x:1,y:0}:d==='down'?{x:0,y:-1}:{x:0,y:1}}
function hat(t,c){
g.lineWidth=2;
switch(t){
case 0:g.fillStyle='#e8d18c';g.strokeStyle='#a98a3d';g.beginPath();g.moveTo(-34,-38);g.quadraticCurveTo(-14,-56,0,-72);g.quadraticCurveTo(14,-56,34,-38);g.quadraticCurveTo(0,-31,-34,-38);g.closePath();g.fill();g.stroke();g.strokeStyle=c;g.beginPath();g.moveTo(-20,-37);g.lineTo(-16,-14);g.moveTo(20,-37);g.lineTo(16,-14);g.stroke();break;
case 1:g.fillStyle=c;g.beginPath();g.arc(0,-40,20,Math.PI,0);g.closePath();g.fill();g.fillStyle='rgba(0,0,0,.35)';g.beginPath();rr(g,-4,-41,30,6,3);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(0,-60,2.5,0,6.3);g.fill();break;
case 2:g.fillStyle=c;g.beginPath();g.arc(0,-40,21,Math.PI,0);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.85)';g.beginPath();rr(g,-21,-44,42,9,4);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(0,-62,6,0,6.3);g.fill();break;
case 3:g.fillStyle='#8b5a2b';g.beginPath();g.ellipse(0,-40,33,8,0,0,6.3);g.fill();g.fillStyle='#a9743b';g.beginPath();rr(g,-14,-66,28,28,8);g.fill();g.fillStyle='#4e2f14';g.beginPath();rr(g,-14,-46,28,5,2);g.fill();break;
case 4:g.fillStyle='#fff';g.strokeStyle='#cfd4d9';g.beginPath();g.arc(-10,-56,10,0,6.3);g.arc(10,-56,10,0,6.3);g.arc(0,-62,11,0,6.3);g.fill();g.beginPath();rr(g,-14,-52,28,14,3);g.fill();g.fillStyle='#e8e8e8';g.beginPath();rr(g,-15,-42,30,5,2);g.fill();break;
case 5:g.fillStyle='#111';g.beginPath();rr(g,-23,-42,46,6,3);g.fill();g.fillStyle='#1c1c1c';g.beginPath();rr(g,-14,-72,28,32,3);g.fill();g.fillStyle=c;g.fillRect(-14,-48,28,6);break;
case 6:g.fillStyle=c;g.beginPath();g.moveTo(-15,-40);g.lineTo(15,-40);g.lineTo(0,-76);g.closePath();g.fill();g.strokeStyle='rgba(255,255,255,.8)';g.beginPath();g.moveTo(-9,-50);g.lineTo(9,-50);g.moveTo(-5,-60);g.lineTo(5,-60);g.stroke();g.fillStyle='#ffe66d';g.beginPath();g.arc(0,-77,4.5,0,6.3);g.fill();break;
default:g.fillStyle='#e74c3c';g.beginPath();rr(g,-21,-44,42,8,3);g.fill();g.beginPath();g.moveTo(20,-40);g.lineTo(33,-47);g.lineTo(31,-37);g.closePath();g.fill();g.beginPath();g.moveTo(20,-40);g.lineTo(32,-34);g.lineTo(28,-27);g.closePath();g.fill()}}
function drawAngler(p){
const ps=pPos(p),o=outV(ps.dir),vp=!!p.vip,s=sc(p);
let x=ps.x,y=vp?ps.y-8:ps.y,al=1;
if(p.st==='walkout'){const w=Math.min(1,p.wo/1.4);x+=o.x*150*w;y+=o.y*150*w;al=1-w}
if(!vis(x,y,130))return;
const k=Math.min(1,p.arr),sz=.88*(.55+.45*(1-Math.pow(1-k,3)));
const fight=!!SP&&SP.pid===p.id&&p.st==='fight';
let tx0=ps.bx,ty0=ps.by;if(fight){tx0=SP.fx;ty0=SP.fy}
let dx=tx0-x,dy=ty0-y;const dl=Math.hypot(dx,dy)||1;dx/=dl;dy/=dl;
g.save();g.globalAlpha=Math.max(0,al);
g.translate(x,y);g.scale(sz,sz);
g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(0,26,23,7,0,0,6.3);g.fill();
g.fillStyle='#33475b';g.fillRect(-10,13,8,13);g.fillRect(2,13,8,13);
g.fillStyle='#222';g.beginPath();g.ellipse(-6,26,6,3,0,0,6.3);g.ellipse(6,26,6,3,0,0,6.3);g.fill();
g.fillStyle=VEST[p.vest];g.beginPath();rr(g,-14,-10,28,28,8);g.fill();
g.fillStyle='#f4f1e8';g.beginPath();rr(g,-5,-10,10,26,3);g.fill();
g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1.5;g.beginPath();rr(g,-14,-10,28,28,8);g.stroke();
const hx=dx*15,hy=dy*13-2;
g.strokeStyle=SKIN[p.skin];g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(-12,-4);g.lineTo(hx,hy);g.moveTo(12,-4);g.lineTo(hx,hy);g.stroke();
g.fillStyle=SKIN[p.skin];g.beginPath();g.arc(hx,hy,4.5,0,6.3);g.fill();
const h0=-28;
g.fillStyle=HAIR[p.hair];g.beginPath();g.arc(0,h0-2,21.5,0,6.3);g.fill();
g.fillStyle=SKIN[p.skin];g.beginPath();g.arc(0,h0+1,19.5,0,6.3);g.fill();
g.fillStyle=HAIR[p.hair];g.beginPath();g.arc(0,h0-1,20.5,Math.PI,2*Math.PI);g.closePath();g.fill();
for(let i=-1;i<=1;i++){g.beginPath();g.arc(i*9,h0-1,6,0,Math.PI);g.fill()}
const bl=Math.sin(T*1.3+p.bl)>.97?.12:1,ex=dx*1.6,ey=dy*1.4;
for(const sx of[-7.5,7.5]){g.fillStyle='#fff';g.beginPath();g.ellipse(sx,h0+5,5,6*bl,0,0,6.3);g.fill();if(bl>.5){g.fillStyle='#1a1a2e';g.beginPath();g.arc(sx+ex,h0+5+ey,3,0,6.3);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(sx+ex-1,h0+4+ey,1,0,6.3);g.fill()}}
g.fillStyle='rgba(255,120,130,.35)';g.beginPath();g.ellipse(-12,h0+12,4,2.5,0,0,6.3);g.ellipse(12,h0+12,4,2.5,0,0,6.3);g.fill();
if(p.st==='bite'||fight){g.fillStyle='#7a1f1f';g.beginPath();g.ellipse(0,h0+14,3.5,4.5,0,0,6.3);g.fill()}
else{g.strokeStyle='#7a3b2e';g.lineWidth=1.8;g.beginPath();g.arc(0,h0+11,4.5,.25,Math.PI-.25);g.stroke()}
if(fight){g.strokeStyle='#2b1b10';g.lineWidth=2.2;g.beginPath();g.moveTo(-13,h0-1);g.lineTo(-3,h0+2);g.moveTo(13,h0-1);g.lineTo(3,h0+2);g.stroke()}
hat(p.hat,HCOL[(p.hash>>5)%6]);
g.restore();
g.save();g.globalAlpha=Math.max(0,al);
const hxw=x+hx*sz,hyw=y+hy*sz,rl=s.rodLevel,R=70+rl*8;
const tipx=hxw+dx*R,tipy=hyw+dy*R-R*.4*(1-Math.abs(dy)*.6);
const bend=p.st==='reel'?.9:fight?1.2+Math.sin(T*18)*.15:p.st==='bite'?.6:.25;
const cx=(hxw+tipx)/2,cy=(hyw+tipy)/2+bend*14;
g.lineCap='round';
g.strokeStyle=['#9b6b2f','#2d3436','#101820'][rl];g.lineWidth=rl===0?4.5:rl===1?3.8:3.2;
g.beginPath();g.moveTo(hxw,hyw);g.quadraticCurveTo(cx,cy,tipx,tipy);g.stroke();
if(rl===0){g.fillStyle='#6e4a1d';for(const t of[.33,.66]){const u=1-t;g.beginPath();g.arc(u*u*hxw+2*u*t*cx+t*t*tipx,u*u*hyw+2*u*t*cy+t*t*tipy,2.6,0,6.3);g.fill()}}
if(rl===2){g.strokeStyle='#00e5ff';g.lineWidth=1.2;g.beginPath();g.moveTo(hxw,hyw);g.quadraticCurveTo(cx,cy,tipx,tipy);g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(tipx,tipy,2.4,0,6.3);g.fill()}
if(rl>=1){g.fillStyle=rl===2?'#00e5ff':'#b2bec3';g.beginPath();g.arc(hxw+dx*8,hyw+dy*8+4,5,0,6.3);g.fill()}
let bx=ps.bx,by=ps.by,show=false,sag=12;
switch(p.st){
case'cast':{const kk=1-Math.max(0,p.t)/.55;bx=hxw+(ps.bx-hxw)*kk;by=hyw+(ps.by-hyw)*kk-Math.sin(kk*Math.PI)*70;show=true;sag=-6;break}
case'wait':by+=Math.sin(T*2.6+p.ph)*1.5;show=true;break;
case'bite':by+=4+Math.sin(T*35)*2.5;show=true;sag=4;break;
case'reel':{const kk=(1-Math.max(0,p.t)/(p.rt0||1))*.8;bx=ps.bx+(hxw+dx*30-ps.bx)*kk;by=ps.by+(hyw+dy*30-ps.by)*kk;show=true;sag=5;break}
case'fight':if(SP){bx=SP.fx;by=SP.fy}show=true;sag=0;break;
}
if(show){
g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.4;g.beginPath();g.moveTo(tipx,tipy);g.quadraticCurveTo((tipx+bx)/2,(tipy+by)/2+sag,bx,by);g.stroke();
if(!fight){
g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1.5;g.beginPath();g.ellipse(bx,by+4,10,4,0,0,6.3);g.stroke();
g.fillStyle='#fff';g.beginPath();g.arc(bx,by,6,0,6.3);g.fill();
g.fillStyle='#e84118';g.beginPath();g.arc(bx,by,6,Math.PI,2*Math.PI);g.fill();
if(p.st==='reel'&&p.cf)dE(p.cf.e,bx,by-6,30,1,Math.sin(T*14)*.4);
if(p.st==='bite')dE('❗',bx,by-34,34+Math.sin(T*20)*4)}}
g.restore();
g.save();g.globalAlpha=Math.max(0,al);
if(p.nw===undefined||p.nn!==p.name){p.nn=p.name;g.font='bold 14px '+FONT;p.nm=p.name.length>12?p.name.slice(0,11)+'…':p.name;p.nw=g.measureText(p.nm).width}
const pw=p.nw+(s.av?22:10),py=y+31;
g.fillStyle=vp?'rgba(120,80,0,.78)':'rgba(0,0,0,.5)';g.beginPath();rr(g,x-pw/2,py,pw,19,9);g.fill();
if(s.av)g.drawImage(s.av,x-pw/2+3,py+2,15,15);
g.font='bold 14px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillStyle=vp?'#ffe27a':'#fff';g.fillText(p.nm,x+(s.av?8:0),py+10);
if(leader===p.id)dE('👑',x,y-76*sz-6,30);
if(p.stun>0){for(let i=0;i<3;i++){const an=T*6+i*2.1;tx('★',x+Math.cos(an)*20,y-56*sz+Math.sin(an)*5,'bold 18px '+FONT,'#ffd84a','center')}}
const it=[];if(s.catches>0)it.push(['🪣',s.catches]);if(p.shield>0)it.push(['🛡️',0]);if(p.afkW)it.push(['⚠️',0]);
const pxv=Math.abs(o.y),pyv=Math.abs(o.x);
it.forEach((a,i)=>{const m=(i-(it.length-1)/2)*30,ix=x+o.x*50+pxv*m,iy=y+o.y*50+pyv*m+(o.x?8:0);dE(a[0],ix,iy,26);if(a[1])tx(String(a[1]),ix+2,iy+15,'bold 12px '+FONT,'#fff','center')});
g.restore()}
function drawNpc(n){
if(!vis(n.x,n.y,100))return;
const hop=Math.abs(Math.sin(n.hop))*10;
g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(n.x,n.y+8,26,8,0,0,6.3);g.fill();
g.save();g.translate(n.x,n.y-26-hop);g.scale(n.fl||1,1);g.drawImage(emo(n.e),-34,-34,68,68);g.restore();
if(n.carry)dE(n.carry,n.x+20,n.y-62-hop,28);
if(n.st!=='flee'){const ay=n.y-84,pulse=Math.sin(T*10)*3;dE('❗',n.x,ay,40+pulse);g.strokeStyle='#ff5252';g.lineWidth=5;g.beginPath();g.arc(n.x,ay,26,-Math.PI/2,-Math.PI/2+6.283*Math.max(0,n.t)/7);g.stroke()}}
function gSpine(L,n,amp,tp){const r=[];for(let i=0;i<=n;i++){const t=i/n;r.push({x:L*.5-t*L,y:Math.sin(T*7-t*5)*amp*(.2+t)*tp})}return r}
function gBody(P,wf,col){
const n=P.length-1,u=[],d=[];
for(let i=0;i<=n;i++){const p=P[Math.max(0,i-1)],q=P[Math.min(n,i+1)],dx=q.x-p.x,dy=q.y-p.y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,w=wf(i/n);u.push([P[i].x+nx*w,P[i].y+ny*w]);d.push([P[i].x-nx*w,P[i].y-ny*w])}
g.fillStyle=col;g.beginPath();g.moveTo(u[0][0],u[0][1]);for(let i=1;i<=n;i++)g.lineTo(u[i][0],u[i][1]);for(let i=n;i>=0;i--)g.lineTo(d[i][0],d[i][1]);g.closePath();g.fill();
return{u:u,d:d}}
function gEye(x,y,r,c){g.fillStyle=c||'#fff';g.beginPath();g.arc(x,y,r,0,6.3);g.fill();g.fillStyle='#111';g.beginPath();g.arc(x+r*.25,y,r*.55,0,6.3);g.fill()}
function gTri(a1,b1,c1,d1,e1,f1,col){g.fillStyle=col;g.beginPath();g.moveTo(a1,b1);g.lineTo(c1,d1);g.lineTo(e1,f1);g.closePath();g.fill()}
function gLine(P){g.beginPath();P.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke()}
function bossDragon(L){
const n=16,P=gSpine(L,n,L*.1,1),wf=t=>L*.075*(1-t*.8)+L*.02;
for(const k of[.28,.52])for(const sd of[-1,1]){const p=P[Math.round(k*n)];g.save();g.translate(p.x,p.y+sd*L*.05);g.rotate(sd*(1.05+Math.sin(T*9+k*5)*.22));g.fillStyle='rgba(255,208,70,.55)';g.beginPath();g.ellipse(L*.08,0,L*.15,L*.05,0,0,6.3);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(L*.07,0,L*.09,L*.022,0,0,6.3);g.fill();g.restore()}
const e=P[n];g.save();g.translate(e.x,e.y);g.rotate(Math.sin(T*8)*.3);g.fillStyle='rgba(255,196,60,.72)';g.beginPath();g.moveTo(L*.02,0);g.quadraticCurveTo(-L*.12,-L*.2,-L*.26,-L*.12);g.quadraticCurveTo(-L*.18,0,-L*.26,L*.12);g.quadraticCurveTo(-L*.12,L*.2,L*.02,0);g.closePath();g.fill();g.fillStyle='rgba(255,120,60,.5)';g.beginPath();g.ellipse(-L*.1,0,L*.09,L*.05,0,0,6.3);g.fill();g.restore();
gBody(P,wf,'#b3121f');
g.strokeStyle='#ffd84a';g.lineWidth=L*.025;g.lineCap='round';gLine(P);
g.strokeStyle='rgba(255,190,70,.6)';g.lineWidth=1.6;
for(let i=1;i<n;i++){const p=P[i],w=wf(i/n);for(const sd of[-1,1]){g.beginPath();g.arc(p.x,p.y+sd*w*.55,w*.36,0,Math.PI);g.stroke()}}
g.save();g.translate(P[0].x,P[0].y);
g.fillStyle='#c4142a';g.beginPath();g.ellipse(L*.03,0,L*.11,L*.07,0,0,6.3);g.fill();
g.fillStyle='#e0213a';g.beginPath();g.ellipse(L*.11,0,L*.06,L*.045,0,0,6.3);g.fill();
g.fillStyle='#ffd84a';g.beginPath();g.arc(L*.15,-L*.015,L*.007,0,6.3);g.arc(L*.15,L*.015,L*.007,0,6.3);g.fill();
for(let k=-1;k<=1;k++)gTri(L*.02,k*L*.035-L*.012,L*.02,k*L*.035+L*.012,-L*.07-(1-Math.abs(k))*L*.05,k*L*.055,'#ffd84a');
gEye(L*.04,-L*.05,L*.02,'#ffe27a');gEye(L*.04,L*.05,L*.02,'#ffe27a');
g.strokeStyle='#ffd84a';g.lineWidth=2.4;
for(const sd of[-1,1]){const w1=Math.sin(T*5)*L*.03,w2=Math.sin(T*5+1)*L*.04;g.beginPath();g.moveTo(L*.12,sd*L*.03);g.bezierCurveTo(L*.2,sd*(L*.1)+w1,L*.26,sd*L*.04,L*.34,sd*L*.12+w2);g.stroke()}
g.restore()}
function bossCroc(L){
const n=14,P=gSpine(L*.85,n,L*.05,1),wf=t=>L*.085*(1-t*.75)+L*.012;
g.save();g.translate(-L*.04,0);
for(const k of[3,9])for(const sd of[-1,1]){const p=P[k];g.save();g.translate(p.x,p.y+sd*wf(k/n)*.8);g.rotate(sd*(1+Math.sin(T*8+k)*.3));g.fillStyle='#174d30';g.beginPath();g.ellipse(L*.05,0,L*.08,L*.032,0,0,6.3);g.fill();g.restore()}
const B=gBody(P,wf,'#1d5c3a');
g.strokeStyle='#2f8a58';g.lineWidth=2;for(let i=1;i<n;i++){g.beginPath();g.moveTo(B.u[i][0],B.u[i][1]);g.lineTo(B.d[i][0],B.d[i][1]);g.stroke()}
g.fillStyle='#0f3320';
for(let i=1;i<n;i++)for(const sd of[-1,1]){g.beginPath();g.ellipse(P[i].x,P[i].y+sd*wf(i/n)*.3,L*.02,L*.014+wf(i/n)*.15,0,0,6.3);g.fill()}
for(let i=n-5;i<=n;i++)gTri(P[i].x+L*.02,P[i].y-L*.012,P[i].x-L*.02,P[i].y-L*.012,P[i].x,P[i].y-L*.05,'#0f3320');
g.save();g.translate(P[0].x,P[0].y);
const op=.1+Math.abs(Math.sin(T*8))*.28;
g.fillStyle='#b83a3a';g.beginPath();g.moveTo(-L*.01,0);g.lineTo(L*.2,0);g.lineTo(L*.2*Math.cos(op),L*.2*Math.sin(op));g.closePath();g.fill();
g.fillStyle='#2a7048';g.beginPath();g.moveTo(-L*.03,-L*.075);g.lineTo(L*.2,-L*.04);g.lineTo(L*.23,0);g.lineTo(-L*.03,0);g.closePath();g.fill();
g.fillStyle='#fff';for(let i=0;i<5;i++){const x=L*.04+i*L*.035;gTri(x,0,x+L*.012,0,x+L*.006,L*.022,'#fff')}
g.save();g.translate(0,L*.005);g.rotate(op);
g.fillStyle='#17402a';g.beginPath();g.moveTo(-L*.03,L*.07);g.lineTo(L*.2,L*.035);g.lineTo(L*.22,0);g.lineTo(-L*.03,0);g.closePath();g.fill();
for(let i=0;i<5;i++){const x=L*.05+i*L*.035;gTri(x,0,x+L*.012,0,x+L*.006,-L*.022,'#fff')}
g.restore();
g.fillStyle='#2a7048';g.beginPath();g.arc(L*.03,-L*.07,L*.025,0,6.3);g.fill();gEye(L*.035,-L*.07,L*.017,'#e8c13a');
g.fillStyle='#2a7048';g.beginPath();g.arc(L*.03,L*.075,L*.025,0,6.3);g.fill();gEye(L*.035,L*.075,L*.017,'#e8c13a');
g.restore();g.restore()}
function hexP(r){g.beginPath();for(let i=0;i<6;i++){const an=i*Math.PI/3+Math.PI/6;i?g.lineTo(Math.cos(an)*r,Math.sin(an)*r):g.moveTo(Math.cos(an)*r,Math.sin(an)*r)}g.closePath()}
function bossTurtle(L){
const R=L*.36,sw=Math.sin(T*6);
g.fillStyle='#2e9a5a';
for(const q of[[1,-1],[1,1],[-1,-1],[-1,1]]){g.save();g.translate(q[0]*R*.75,q[1]*R*.78);g.rotate(q[1]*(q[0]>0?1.05:2.2)+sw*.4*q[0]*q[1]);g.beginPath();g.ellipse(L*.1,0,L*.17,L*.06,0,0,6.3);g.fill();g.restore()}
gTri(-R*.95,0,-R*1.35,-L*.035,-R*1.35,L*.035,'#2e9a5a');
g.fillStyle='#3aa766';g.beginPath();g.ellipse(R*1.08+sw*L*.012,0,L*.11,L*.08,0,0,6.3);g.fill();
gEye(R*1.18,-L*.045,L*.02);gEye(R*1.18,L*.045,L*.02);
const gr=g.createRadialGradient(-R*.25,-R*.25,R*.1,0,0,R);gr.addColorStop(0,'#ffe27a');gr.addColorStop(1,'#b8861e');
g.fillStyle=gr;g.beginPath();g.ellipse(0,0,R,R*.92,0,0,6.3);g.fill();
g.strokeStyle='#fff0a0';g.lineWidth=6;g.stroke();
g.strokeStyle='#7a5410';g.lineWidth=2;g.beginPath();g.ellipse(0,0,R*.9,R*.82,0,0,6.3);g.stroke();
for(let i=0;i<6;i+=2){g.fillStyle='rgba(140,90,10,.28)';g.beginPath();g.moveTo(0,0);g.arc(0,0,R*.88,i*Math.PI/3,(i+1)*Math.PI/3);g.closePath();g.fill()}
g.strokeStyle='#7a5410';g.lineWidth=2.4;
for(let i=0;i<6;i++){const an=i*Math.PI/3+Math.PI/6;g.beginPath();g.moveTo(Math.cos(an)*R*.38,Math.sin(an)*R*.38);g.lineTo(Math.cos(an)*R*.86,Math.sin(an)*R*.8);g.stroke()}
g.fillStyle='rgba(255,236,150,.6)';hexP(R*.38);g.fill();g.stroke();
g.fillStyle='#2ecc71';g.beginPath();g.arc(0,0,R*.1,0,6.3);g.fill();g.strokeStyle='#fff';g.lineWidth=1.5;g.stroke()}
function bossLeviathan(L){
const n=12,P=gSpine(L,n,L*.07,1),wf=t=>L*.12*Math.sin(Math.PI*Math.min(1,.2+t*.8))*(1-t*.55)+L*.01,e=P[n];
g.save();g.translate(e.x,e.y);g.rotate(Math.sin(T*14)*.45);g.fillStyle='#2c4560';g.beginPath();g.moveTo(L*.03,0);g.quadraticCurveTo(-L*.1,-L*.22,-L*.28,-L*.2);g.quadraticCurveTo(-L*.16,0,-L*.28,L*.2);g.quadraticCurveTo(-L*.1,L*.22,L*.03,0);g.closePath();g.fill();g.restore();
for(const sd of[-1,1]){g.save();g.translate(P[3].x,P[3].y+sd*wf(.25)*.9);g.rotate(sd*(1+Math.sin(T*8)*.25));g.fillStyle='rgba(170,196,222,.88)';g.beginPath();g.ellipse(L*.09,0,L*.17,L*.055,0,0,6.3);g.fill();g.restore()}
const lg=g.createLinearGradient(0,-L*.13,0,L*.13);lg.addColorStop(0,'#2f4a68');lg.addColorStop(.5,'#6f8cab');lg.addColorStop(1,'#d3dce8');
gBody(P,wf,lg);
g.strokeStyle='#223a52';g.lineWidth=3;g.lineCap='round';gLine(P);
g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=1.4;
for(let i=1;i<n;i++){const p=P[i],w=wf(i/n);for(const sd of[-1,1]){g.beginPath();g.arc(p.x,p.y+sd*w*.5,w*.3,0,Math.PI);g.stroke()}}
g.save();g.translate(P[0].x,P[0].y);
g.fillStyle='#4d6c8c';g.beginPath();g.ellipse(L*.02,0,L*.09,L*.075,0,0,6.3);g.fill();
g.strokeStyle='#cfd8e3';g.lineWidth=2.2;
for(const sd of[-1,1]){g.beginPath();g.moveTo(L*.1,sd*L*.03);g.quadraticCurveTo(L*.16,sd*L*.1+Math.sin(T*6)*L*.02,L*.23,sd*L*.09);g.stroke();gEye(L*.03,sd*L*.055,L*.018)}
g.strokeStyle='rgba(20,40,60,.55)';g.lineWidth=2;g.beginPath();g.arc(-L*.04,0,L*.07,-1.1,1.1);g.stroke();
g.restore()}
function bossChest(L){
g.fillStyle='#8a5a22';g.beginPath();rr(g,-L*.22,-L*.14,L*.44,L*.28,10);g.fill();
g.strokeStyle='#ffd84a';g.lineWidth=5;g.stroke();
g.fillStyle='#a8742e';g.beginPath();rr(g,-L*.22,-L*.14,L*.44,L*.11,10);g.fill();g.stroke();
g.fillStyle='#ffd84a';g.fillRect(-L*.03,-L*.06,L*.06,L*.09);
g.fillStyle='#fff3a0';for(let i=0;i<5;i++){const t=T*3+i*1.3;g.beginPath();g.arc(Math.cos(t)*L*.24,Math.sin(t)*L*.16,3,0,6.3);g.fill()}}
let bossErr=0;
function drawGiantBoss(loot,x,y,jumpH,angle,sc){
const L=170,nm=loot.n||'',an=angle||0;
if(bossErr>0){bossErr--;dE(loot.e||'🐟',x,y-(jumpH||0),150);return}
g.save();
try{
g.translate(x,y-(jumpH||0));g.rotate(an);if(Math.cos(an)<0)g.scale(1,-1);if(sc)g.scale(sc,sc);
if(nm.indexOf('Rương')>=0)bossChest(L);
else if(nm.indexOf('Rồng')>=0)bossDragon(L);
else if(nm.indexOf('Sấu')>=0)bossCroc(L);
else if(nm.indexOf('Rùa')>=0)bossTurtle(L);
else bossLeviathan(L);
g.restore()
}catch(e){
console.log('[boss]',e&&e.message||e);bossErr=120;
try{if(g.reset)g.reset();else g.setTransform(1,0,0,1,0,0)}catch(_){}
g.globalAlpha=1;g.lineWidth=1;g.lineCap='butt';
}}
function drawWhirl(x,y,al){
g.save();g.translate(x,y);g.scale(1,.5);g.globalAlpha*=al;
g.fillStyle='rgba(190,255,255,.18)';g.beginPath();g.arc(0,0,130,0,6.3);g.fill();
for(let i=0;i<4;i++){const r=40+i*34,o=T*(3.2-i*.5)*(i%2?-1:1);
g.strokeStyle=i%2?'rgba(255,255,255,.8)':'rgba(70,225,230,.85)';g.lineWidth=Math.max(1.5,5.5-i*1.2);g.lineCap='round';
g.beginPath();g.arc(0,0,r,o,o+4.2);g.stroke();
g.beginPath();g.arc(0,0,r*.84,o+3.4,o+5.8);g.stroke()}
g.restore()}
function drawSpray(x,y,jh){/*DROPLETS*/
const n=jh>60?26:18,k=.7+Math.min(1,jh/170)*.6;
g.save();g.lineCap='round';
for(let i=0;i<n;i++){
const r1=Math.abs(Math.sin(i*12.9898)),r2=Math.abs(Math.sin(i*78.233)),r3=Math.abs(Math.sin(i*37.719)),r4=Math.abs(Math.sin(i*4.581));
const L=.95,t=((T*1.15+r3)%1)*L;
if(t<.02)continue;
const an=-Math.PI/2+(r1-.5)*1.7,sp=(240+r2*320)*k,ox=x+(r4-.5)*80,oy=y-jh*.45;
const px=ox+Math.cos(an)*sp*t,py=oy+Math.sin(an)*sp*t+450*t*t;
const t0=Math.max(0,t-.045),qx=ox+Math.cos(an)*sp*t0,qy=oy+Math.sin(an)*sp*t0+450*t0*t0;
const al=Math.max(0,1-t/L),r=1.8+r2*2.6;
g.globalAlpha=al*.55;g.strokeStyle='#d8f6ff';g.lineWidth=r*.8;g.beginPath();g.moveTo(qx,qy);g.lineTo(px,py);g.stroke();
g.globalAlpha=al;g.fillStyle='#eaffff';g.beginPath();g.arc(px,py,r,0,6.3);g.fill();
g.globalAlpha=al*.8;g.fillStyle='#8fe3f0';g.beginPath();g.arc(px+r*.25,py+r*.25,r*.55,0,6.3);g.fill();
}
g.restore()}
function drawSun(x,y,r,a){
g.save();g.translate(x,y);g.globalAlpha*=Math.max(0,Math.min(1,a));
g.rotate(T*.6);const w=Math.PI*2/14;
for(let i=0;i<14;i++){g.fillStyle=i%2?'rgba(255,226,120,.4)':'rgba(255,200,60,.22)';g.beginPath();g.moveTo(0,0);g.arc(0,0,r,i*w,(i+1)*w);g.closePath();g.fill()}
g.rotate(-T*.6);
const gr=g.createRadialGradient(0,0,0,0,0,r*.5);gr.addColorStop(0,'rgba(255,248,200,.7)');gr.addColorStop(1,'rgba(255,230,120,0)');
g.fillStyle=gr;g.beginPath();g.arc(0,0,r*.5,0,6.3);g.fill();
g.restore()}
function drawBossTag(loot,x,y){
const kg=loot.kg!==undefined?loot.kg:(SP&&SP.f===loot&&SP.kg!==undefined?SP.kg:(loot.k?(loot.k[0]+loot.k[1])/2:0)),t='⚠️ '+String(loot.n||'').toUpperCase()+' ('+Math.round(kg)+' KG) ⚠️';
g.font='bold 26px '+FONT;
const w=g.measureText(t).width+44,pu=1+Math.sin(T*8)*.03,fs=w>760?760/w:1;
g.save();g.translate(x,y);g.scale(pu*fs,pu*fs);
g.beginPath();rr(g,-w/2,-22,w,44,22);g.fillStyle='rgba(120,10,28,.94)';g.fill();g.strokeStyle='#ffd84a';g.lineWidth=4;g.stroke();
tx(t,0,1,'bold 26px '+FONT,'#ffe27a','center',0);
g.restore()}
function drawSpotFish(){
const f=SP.f,dis=(SP.fake&&!SP.res)?{n:'Cá Hô Sông Mê Kông',c:'legend',k:[60,100]}:f;
const x=SP.fx,y=SP.fy,jh=SP.jh||0;
if(SP.res==='win'){/*WINLEAP*/
const e=2.4-SP.rt,fd=Math.min(1,SP.rt/.6),u=e*4.2,ph=(u/Math.PI)%1,j2=Math.abs(Math.sin(u))*170*Math.max(.25,1-e/2.4);
if(j2<8&&(SP.wj||0)>=8){qSplash(x,y);dotP(x,y,'#e8fbff',10)}
SP.wj=j2;
g.globalAlpha=fd;drawWhirl(x,y,.8);
g.globalAlpha=.3*fd;g.fillStyle='#003a4a';g.beginPath();g.ellipse(x,y+6,Math.max(10,170*.42*(1-j2/420)),170*.14,0,0,6.3);g.fill();
g.globalAlpha=fd;
if(j2>5)drawSpray(x,y,j2);
if(f.c==='junk')dE(f.e,x,y-j2,150);else drawGiantBoss(f,x,y,j2,-2.2+ph*2.8,1);
g.strokeStyle='#ffd84a';g.lineWidth=5;g.globalAlpha=Math.max(0,SP.rt/2.4);g.beginPath();g.arc(x,y-j2,60+e*90,0,6.3);g.stroke();
g.globalAlpha=fd;dE(f.e,x,y-j2-135,80);
g.globalAlpha=1;return}
let al=1;if(SP.res==='fall')al=Math.max(0,SP.rt/1.8);
g.globalAlpha=al;
drawWhirl(x,y,1);
g.globalAlpha=.3*al;g.fillStyle='#003a4a';g.beginPath();g.ellipse(x,y+6,Math.max(10,170*.42*(1-jh/420)),170*.14,0,0,6.3);g.fill();
g.globalAlpha=al;
if(jh>5)drawSpray(x,y,jh);
let a;
if(jh>2)a=-2.2+(1-SP.jt/.75)*2.8;else a=Math.atan2(SP.by-SP.ay,SP.bx-SP.ax)+Math.sin(SP.ph*5)*.9;
drawGiantBoss(dis,x,y,jh,a,1);
if(!SP.res)drawBossTag(dis,x,y-jh-125);
g.globalAlpha=1}
function drawParts(){
for(const q of parts){
if(!vis(q.x,q.y,60))continue;
const a=1-q.t/q.m;
if(q.k==='d'){g.globalAlpha=Math.max(0,a);g.fillStyle=q.c;g.beginPath();g.arc(q.x,q.y,q.sz/2,0,6.3);g.fill()}
else if(q.k==='e')dE(q.e,q.x,q.y,q.sz,Math.max(0,Math.min(1,a*1.6)),q.r);
else{g.globalAlpha=Math.max(0,Math.min(1,a*1.8));tx(q.s,q.x,q.y,'bold 24px '+FONT,q.c,'center')}
g.globalAlpha=1}}
function drawLB(){
if(!lbCache){lbCache=mkc(480,342);lbCtx=lbCache.getContext('2d')}
const x=lbCtx;x.clearRect(0,0,480,342);
x.fillStyle='rgba(6,22,38,.8)';x.beginPath();rr(x,0,0,480,342,18);x.fill();x.strokeStyle='#f1c40f';x.lineWidth=3;x.stroke();
x.textBaseline='middle';x.textAlign='center';x.font='bold 22px '+FONT;x.fillStyle='#ffe27a';x.fillText('🏆 BẢNG XẾP HẠNG TOP 10',240,24);
for(let i=0;i<10;i++){
const y=44+i*27,s=tops[i];
x.fillStyle=i%2?'rgba(255,255,255,.04)':'rgba(255,255,255,.09)';x.fillRect(8,y,464,26);
x.textAlign='left';
if(!s){x.fillStyle='rgba(255,255,255,.3)';x.font='15px '+FONT;x.fillText('#'+(i+1)+'  —',16,y+13);continue}
x.font='bold 17px '+FONT;x.fillStyle=i===0?'#ffd84a':i===1?'#d5dbe3':i===2?'#e0996a':'#9fb4c8';x.fillText('#'+(i+1),14,y+14);
if(s.av)x.drawImage(s.av,52,y+3,20,20);else{x.fillStyle=VEST[hs(s.id)%8];x.beginPath();x.arc(62,y+13,10,0,6.3);x.fill();x.fillStyle='#fff';x.font='bold 12px '+FONT;x.textAlign='center';x.fillText((s.name||'?').charAt(0).toUpperCase(),62,y+14);x.textAlign='left'}
let nm=s.name||'Khách';x.font='bold 17px '+FONT;while(x.measureText(nm).width>200&&nm.length>2)nm=nm.slice(0,-1);
x.fillStyle='#fff';x.fillText(nm,80,y+14);
x.font='bold 15px '+FONT;x.fillStyle='#7ee8ff';x.fillText('🐟'+s.species.size,296,y+14);
x.textAlign='right';x.font='bold 16px '+FONT;x.fillStyle='#ffe27a';x.fillText(s.kg.toFixed(1)+' kg',468,y+14)}}
function hudR(){
const X=540,Y=20,Wd=516,Ht=150;
g.fillStyle='rgba(6,22,38,.75)';g.beginPath();rr(g,X,Y,Wd,Ht,18);g.fill();g.strokeStyle=frenzy>0?'#ffd32a':'rgba(120,200,255,.6)';g.lineWidth=3;g.stroke();
let n=0;for(const p of players.values())if(p.st!=='walkout')n++;
dE('🎣',X+30,Y+28,30);tx(n+'/36 cần thủ  ·  VIP '+vips.length+'/3',X+54,Y+28,'bold 22px '+FONT,'#fff','left');
const sc0=tst.state==='live'?'#2ecc71':tst.state==='connecting'?'#f1c40f':'#e74c3c';
g.fillStyle=sc0;g.beginPath();g.arc(X+Wd-24,Y+28,7,0,6.3);g.fill();
tx(tst.state==='live'?'LIVE':tst.state==='connecting'?'Kết nối...':tst.state==='nouser'?'Chưa có user':'Offline',X+Wd-38,Y+28,'bold 15px '+FONT,'#cfe8ff','right',0);
g.fillStyle='rgba(255,255,255,.12)';g.beginPath();rr(g,X+16,Y+52,Wd-32,30,12);g.fill();
const fr=frenzy>0?frenzy/45:energy/100;
if(fr>.01){g.fillStyle=frenzy>0?'#ffd32a':'#3ec6ff';g.beginPath();rr(g,X+16,Y+52,Math.max(24,(Wd-32)*Math.min(1,fr)),30,12);g.fill()}
const lab=frenzy>0?'GOLDEN FRENZY x2 điểm · x3 hiếm · '+Math.ceil(frenzy)+'s':frenzyCD>0&&energy>=99?'Năng lượng đầy · chờ '+Math.ceil(frenzyCD)+'s':'Năng lượng Like '+Math.floor(energy)+'%';
tx(lab,X+Wd/2,Y+67,'bold 17px '+FONT,frenzy>0?'#3b2a00':'#fff','center',0);
tx('Gõ: câu · thay mồi · ném dép · kéo · phá · đuổi',X+16,Y+104,'16px '+FONT,'#cfe8ff','left',0);
tx('Like = cần tự động 30s · Quà = Khiên, VIP, Frenzy',X+16,Y+128,'15px '+FONT,'#9fc4e6','left',0)}
function hudB(){
const b=banner,a=Math.max(0,Math.min(1,b.t*3,(b.m-b.t)*6+.2)),cx=798,cy=216;
g.save();g.globalAlpha=a;
g.fillStyle='rgba(6,22,38,.8)';g.beginPath();rr(g,cx-258,cy-30,516,60,22);g.fill();g.strokeStyle=b.col;g.lineWidth=3;g.stroke();
if(b.e)dE(b.e,cx-228,cy,38);
ftx(b.text,cx+(b.e?18:0),cy,b.e?430:480,26,b.col,'center');
g.restore()}
function hudQ(){
const X=140,Y=1846,Wd=800,Hh=40,v=Math.max(0,Math.min(1,SP.v/100));
g.fillStyle='rgba(6,22,38,.85)';g.beginPath();rr(g,X-14,Y-48,Wd+28,Hh+84,16);g.fill();
dE('💪',X+16,Y-24,28);tx('PHE KÉO '+SP.pn,X+36,Y-24,'bold 22px '+FONT,'#7dff9a','left');
tx(SP.res?(SP.res==='win'?'HẠ GỤC!':'CÁ SỔNG!'):Math.ceil(SP.t)+'s',X+Wd/2,Y-24,'bold 24px '+FONT,'#fff','center');
tx('PHE PHÁ '+SP.dn,X+Wd-36,Y-24,'bold 22px '+FONT,'#ff8a8a','right');dE('💥',X+Wd-14,Y-24,28);
g.fillStyle='#1b2a3a';g.beginPath();rr(g,X,Y,Wd,Hh,12);g.fill();
g.fillStyle=v>=.5?'#2ecc71':v>.25?'#f1c40f':'#e74c3c';g.beginPath();rr(g,X,Y,Math.max(24,Wd*v),Hh,12);g.fill();
g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.rect(X,Y,Wd,Hh);g.stroke();
const mx2=X+Wd*CFG.qteWinTarget/100;
g.strokeStyle='#fff';g.lineWidth=4;g.beginPath();g.moveTo(mx2,Y-8);g.lineTo(mx2,Y+Hh+8);g.stroke();
dE('🚩',mx2+4,Y-10,26);
tx(Math.round(SP.v)+'%',X+Wd*Math.max(.06,v)-30,Y+Hh/2+1,'bold 20px '+FONT,'#fff','center');
tx('60%',mx2,Y+Hh+16,'bold 15px '+FONT,'#ffe27a','center',0);
tx('Gõ KÉO +6% · Like +1%',X,Y+Hh+16,'14px '+FONT,'#9fffa8','left',0);
tx('Gõ PHÁ -5%',X+Wd,Y+Hh+16,'14px '+FONT,'#ff9a9a','right',0)}
function hudC(){
const k=Math.min(1,(card.m-card.t)*4),f=card.t<.4?card.t/.4:1,z=.6+.4*(1-Math.pow(1-k,3)),w=760,h=460;
g.save();g.globalAlpha=f;g.translate(540,900);g.scale(z,z);
const gr=g.createLinearGradient(0,-h/2,0,h/2);gr.addColorStop(0,'#16314d');gr.addColorStop(1,'#0a1829');
g.fillStyle=gr;g.beginPath();rr(g,-w/2,-h/2,w,h,34);g.fill();g.strokeStyle='#ffd84a';g.lineWidth=8;g.stroke();
dE('👑',0,-h/2-6,96);
ftx(card.title,0,-h/2+58,w-80,38,'#ffd84a','center');
g.fillStyle='#ffd84a';g.beginPath();g.arc(0,-60,66,0,6.3);g.fill();
g.fillStyle=VEST[hs(card.s.id)%8];g.beginPath();g.arc(0,-60,60,0,6.3);g.fill();
if(card.s.av)g.drawImage(card.s.av,-60,-120,120,120);else tx((card.name||'?').charAt(0).toUpperCase(),0,-58,'bold 64px '+FONT,'#fff','center',0);
ftx(card.name,0,48,w-80,46,'#ffffff','center');
dE(card.e,-w/2+130,150,120);
ftx(card.l1,70,130,w/2+10,30,'#ffffff','center');
ftx(card.l2,70,180,w/2+10,24,'#ffd84a','center');
g.restore()}
function draw(){
if(!bgCache){buildBG();drawLB()}
g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.clearRect(0,0,W,H);
g.save();
g.translate(540,960);g.scale(cam.z,cam.z);g.translate(-cam.x,-cam.y);
if(shk>0)g.translate((Math.random()-.5)*shk*12,(Math.random()-.5)*shk*12);
g.drawImage(bgCache,0,0);
if(frenzy>0)frenzyFx();
drawFishes();drawRipples();if(pierCache)g.drawImage(pierCache,0,0);if(pierCache)g.drawImage(pierCache,0,0);
if(crab)drawCrab();
for(const p of vips)drawYacht(p);
const ord=[...players.values()].sort((a,b)=>pPos(a).y-pPos(b).y);
for(const p of ord)drawAngler(p);
for(const n of npcs)drawNpc(n);
if(SP){
g.globalAlpha=Math.min(1,SP.a)*(SP.res==='fall'?Math.max(0,SP.rt/1.8):1);g.drawImage(vigCache,SP.fx-700,SP.fy-700);g.globalAlpha=1;
const op=players.get(SP.pid);if(op)drawAngler(op);
drawSpotFish()}
drawParts();
g.restore();
if(lbDirty&&cam.z<1.1&&T-lbT>.4){drawLB();lbDirty=false;lbT=T}
if(lbCache)g.drawImage(lbCache,24,20);
hudR();
if(SP)hudQ();
if(banner)hudB();
if(card)hudC();
g.globalAlpha=1}
function loop(ts){
requestAnimationFrame(loop);
const el=ts-lastTs;
if(el<15.5)return;
lastTs=ts-(el%15.5);
const dt=Math.min(.05,el/1000);
T+=dt;update(dt);draw()}
buildBG();drawLB();
requestAnimationFrame(loop);
