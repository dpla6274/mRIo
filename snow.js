/* ═══════════════════════════════════════════════════════════
   눈 — 마우스를 피하는 눈송이
   PSD 구성 그대로 실시간 합성:  (배경 ＋ 눈[스크린]) ÷ 노이즈[나누기]  → 하프톤 눈
   눈 위치·크기는 기존 디자인에서 추출. WebGL을 못 쓰면 정지 이미지(scene-static.png) 그대로.
   ═══════════════════════════════════════════════════════════ */
(function(){
const FLAKES = [[1068, 91, 5.87, 0.114], [239, 92, 7.6, 0.411], [1888, 113, 8.44, 0.287], [168, 115, 9.27, 0.541], [1403, 126, 10.08, 0.446], [1511, 128, 8.44, 0.333], [1221, 129, 7.6, 0.084], [1433, 145, 18.77, 0.191], [1753, 162, 8.44, 0.274], [1820, 167, 19.55, 0.567], [1135, 170, 8.44, 0.169], [1866, 192, 10.89, 0.528], [1392, 202, 8.44, 0.136], [1285, 223, 8.44, 0.129], [1713, 223, 10.08, 0.486], [1793, 241, 8.44, 0.277], [1516, 280, 8.44, 0.232], [1623, 288, 8.44, 0.349], [780, 293, 14.86, 0.476], [648, 308, 18.0, 0.617], [207, 316, 19.55, 0.531], [41, 328, 14.86, 0.475], [1501, 350, 8.44, 0.262], [123, 388, 8.44, 0.232], [1545, 398, 8.44, 0.265], [1386, 408, 16.43, 0.12], [1378, 430, 12.49, 0.124], [746, 441, 13.28, 0.318], [678, 470, 11.69, 0.239], [265, 502, 16.43, 0.385], [540, 530, 9.27, 0.427], [362, 561, 9.27, 0.088], [263, 565, 9.27, 0.328], [375, 576, 10.08, 0.083], [1308, 607, 17.21, 0.23], [325, 610, 8.44, 0.193], [965, 610, 11.69, 0.359], [1839, 621, 15.65, 0.306], [1504, 644, 10.89, 0.413], [1011, 658, 8.44, 0.284], [398, 666, 8.44, 0.079], [787, 675, 7.6, 0.11], [1445, 688, 6.75, 0.202], [216, 704, 9.27, 0.329], [113, 729, 9.27, 0.332], [264, 732, 8.44, 0.086], [307, 734, 8.44, 0.106], [234, 762, 8.44, 0.233], [446, 800, 9.27, 0.31], [104, 802, 8.44, 0.135], [1584, 814, 8.44, 0.255], [13, 815, 9.27, 0.183], [205, 826, 14.86, 0.253], [1514, 858, 10.08, 0.442], [36, 920, 8.44, 0.169], [408, 923, 8.44, 0.134], [454, 930, 6.75, 0.086], [761, 933, 8.44, 0.134], [363, 942, 8.44, 0.231], [1832, 965, 14.86, 0.38], [1568, 970, 8.44, 0.27], [208, 973, 14.86, 0.259], [1562, 1004, 21.11, 0.334], [1532, 1018, 12.49, 0.55], [1291, 1030, 22.66, 0.092], [1814, 1036, 8.44, 0.417], [1380, 1042, 15.65, 0.316], [1021, 1050, 15.65, 0.223], [1550, 1074, 25.75, 0.24], [499, 1079, 10.89, 0.123], [1318, 1079, 21.11, 0.554]];          // [x, y, 크기, 밝기]  (1920×1080 기준)
const PUSH_RADIUS = 150;           // 커서가 눈을 미는 범위
const PUSH_POWER  = 70;            // 최대로 밀리는 거리
const RETURN      = 0.06;          // 제자리로 돌아오는 속도 (0~1)

const scene = document.getElementById('scene');
const img = scene && scene.querySelector('.scene-image');
if (!img) return;
const cv = document.createElement('canvas');
cv.className = 'scene-canvas'; cv.width = 1920; cv.height = 1080;
const gl = cv.getContext('webgl', {premultipliedAlpha:false, antialias:false, preserveDrawingBuffer:false});
if (!gl) return;
/* 1단계: 눈송이마다 자기 둘레 네모에만 그려서 '눈 지도'를 만듦 (더하기 혼합)
   2단계: 눈 지도 + 배경 + 노이즈를 한 번에 합성 (픽셀마다 텍스처 4번 읽기)
   → 예전처럼 모든 픽셀이 71개를 다 계산하지 않아 훨씬 가벼움 */
function sh(t,src){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);return s;}
function mk(vs,fs){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw 'link';return p;}
let pFlake,pComp;
try{
 pFlake=mk(`attribute vec2 aPos;attribute vec2 aOff;attribute vec2 aSA;varying vec2 vD;varying vec2 vSA;
  void main(){vD=aOff;vSA=aSA;vec2 p=aPos+aOff;gl_Position=vec4(p.x/960.-1.,1.-p.y/540.,0.,1.);}`,
  `precision mediump float;varying vec2 vD;varying vec2 vSA;
  void main(){float r2=dot(vD,vD);gl_FragColor=vec4(vSA.y*exp(-r2/(2.*vSA.x*vSA.x)),0.,0.,1.);}`);
 pComp=mk('attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}',
  `precision highp float;uniform sampler2D uBase,uNoise,uMask,uSnow;
  void main(){vec2 uv=gl_FragCoord.xy/vec2(1920.,1080.);
   float s=min(texture2D(uSnow,uv).r,1.);
   vec3 P=texture2D(uBase,uv).rgb;vec3 Q=1.-(1.-P)*(1.-s);
   float n=max(texture2D(uNoise,uv).r,1./255.);float a=texture2D(uMask,uv).r;
   gl_FragColor=vec4(mix(Q,min(Q/n,vec3(1.)),a),1.);}`);
}catch(e){ return; }
// 눈 지도 그릴 판(FBO)
const snowTex=gl.createTexture(); gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D,snowTex);
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1920,1080,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D,k,v);
const fbo=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,snowTex,0);
gl.bindFramebuffer(gl.FRAMEBUFFER,null);
const quad=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,quad); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const fbuf=gl.createBuffer();
const N=FLAKES.length, verts=new Float32Array(N*6*6);
const CORN=[[-1,-1],[1,-1],[-1,1],[-1,1],[1,-1],[1,1]];
function tex(unit,name,image){
  const t=gl.createTexture(); gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
  for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D,k,v);
  gl.useProgram(pComp); gl.uniform1i(gl.getUniformLocation(pComp,name),unit);
}
const load=src=>new Promise((ok,no)=>{const i=new Image();i.decoding='async';i.onload=()=>ok(i);i.onerror=no;i.src=src;});

const pos=FLAKES.map(f=>({hx:f[0],hy:f[1],x:f[0],y:f[1],s:f[2],a:f[3]}));
let mouse=null, raf=0, ready=false;
function draw(){
  // 1) 눈 지도
  let k=0;
  for(const p of pos){ const r=4*p.s;
    for(const c of CORN){ verts[k++]=p.x; verts[k++]=p.y; verts[k++]=c[0]*r; verts[k++]=c[1]*r; verts[k++]=p.s; verts[k++]=p.a; } }
  gl.bindFramebuffer(gl.FRAMEBUFFER,fbo); gl.viewport(0,0,1920,1080);
  gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(pFlake); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE);
  gl.bindBuffer(gl.ARRAY_BUFFER,fbuf); gl.bufferData(gl.ARRAY_BUFFER,verts,gl.DYNAMIC_DRAW);
  const L=n=>gl.getAttribLocation(pFlake,n);
  [['aPos',0],['aOff',2],['aSA',4]].forEach(([n,o])=>{const l=L(n);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,24,o*4);});
  gl.drawArrays(gl.TRIANGLES,0,N*6);
  [ 'aPos','aOff','aSA' ].forEach(n=>gl.disableVertexAttribArray(L(n)));
  gl.disable(gl.BLEND); gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  // 2) 합성
  gl.useProgram(pComp); gl.bindBuffer(gl.ARRAY_BUFFER,quad);
  const lp=gl.getAttribLocation(pComp,'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
  gl.uniform1i(gl.getUniformLocation(pComp,'uSnow'),3);
  gl.viewport(0,0,1920,1080); gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.disableVertexAttribArray(lp);
}
function step(){
  raf=0; let moving=false;
  for(const p of pos){
    let tx=p.hx, ty=p.hy;
    if(mouse){ const dx=p.hx-mouse.x, dy=p.hy-mouse.y, d=Math.hypot(dx,dy);
      if(d<PUSH_RADIUS){ const k=Math.pow(1-d/PUSH_RADIUS,2)*PUSH_POWER/(d||1); tx+=dx*k; ty+=dy*k; } }
    p.x+=(tx-p.x)*RETURN*2; p.y+=(ty-p.y)*RETURN*2;
    if(Math.abs(tx-p.x)>.05||Math.abs(ty-p.y)>.05) moving=true;
  }
  draw();
  if(moving) raf=requestAnimationFrame(step);
}
const kick=()=>{ if(ready&&!raf) raf=requestAnimationFrame(step); };
// 커서 위치를 장면(1920×1080) 좌표로
function toScene(e){ const r=scene.getBoundingClientRect(); return {x:(e.clientX-r.left)/r.width*1920, y:(e.clientY-r.top)/r.height*1080}; }
window.addEventListener('pointermove',e=>{mouse=toScene(e);kick();},{passive:true});
window.addEventListener('pointerleave',()=>{mouse=null;kick();});
document.addEventListener('mouseleave',()=>{mouse=null;kick();});
window.addEventListener('blur',()=>{mouse=null;kick();});

Promise.all(['assets/scene-base.png','assets/scene-noise.png','assets/scene-mask.png'].map(load)).then(([b,n,m])=>{
  tex(0,'uBase',b); tex(1,'uNoise',n); tex(2,'uMask',m);
  img.after(cv); ready=true; draw(); cv.classList.add('on');
}).catch(()=>{});
})();
