/* 네 가지 링크만 바꾸면 됩니다. 주소가 빈 문자열이면 클릭해도 이동하지 않습니다. */
const LINKS={
  mariaName:'',
  vittorioName:'',
  mariaImage:'',
  vittorioImage:'news.html'   // 비토리오 그림 클릭 → 신문 3·4면
};

// 배치 기준: 1920×1080 PSD.
// 데스크톱 최대화/F11에서는 *같은 모니터 전체*를 기준으로 배율과 세로 위치를 고정한다.
// 주소창이 나타나 줄어든 viewport 가운데로 장면을 재정렬하지 않는다.
// 일반 브라우저 창 크기 변경 시에도 top 50% 정렬 대신 상단 기준으로 고정한다.
const SCENE_W=1920, SCENE_H=1080;
const scene=document.getElementById('scene');
const viewport=document.getElementById('viewport');
const mobileMode=window.matchMedia('(max-width: 700px) and (orientation: portrait)');
let scale=1, panX=0, panY=0, maxPanX=0, maxPanY=0;
let sceneX=0, sceneY=0;
function renderScene(){
  // 절대 장면 좌표: 화면 크기 보정과 모든 호버/텍스트가 같은 변환을 받는다.
  scene.style.transform=`translate3d(${sceneX+panX}px,${sceneY}px,0) scale(${scale})`;
}
function fitScene(){
  const w=viewport.clientWidth, h=viewport.clientHeight;
  const isMobile=mobileMode.matches;
  // screen.width/height 는 현재 모니터의 CSS 픽셀 크기.
  const scrW=window.screen.width, scrH=window.screen.height;
  const avW=window.screen.availWidth || scrW;
  const avH=window.screen.availHeight || scrH;
  const fullscreen=!!document.fullscreenElement || Math.abs(window.innerHeight-scrH)<3 && Math.abs(window.innerWidth-scrW)<3;
  // Chrome/Edge 최대화된 창 판별: Windows 작업 표시줄이 있어도 동작하도록 availHeight 기준.
  const maximized=(!isMobile &&
    Math.abs(window.outerWidth-avW)<24 &&
    (Math.abs(window.outerHeight-avH)<34 || fullscreen));
  if(!isMobile && (maximized || fullscreen)){
    // F11과 일반 최대화 창 모두 모니터의 동일한 1920×1080 장면을 공유.
    scale=Math.max(scrW/SCENE_W, scrH/SCENE_H);
    // 최대화 창의 좌우 중앙은 동일하고, 위쪽 브라우저 UI만 그림을 가림.
    sceneX=(w-SCENE_W*scale)/2;
    const topInset=fullscreen?0:Math.max(0,window.outerHeight-window.innerHeight);
    sceneY=(scrH-SCENE_H*scale)/2-topInset;
  }else if(isMobile){
    // 모바일에서는 이전의 cover + 좌우 드래그 표시를 유지.
    scale=Math.max(w/SCENE_W,h/SCENE_H);
    sceneX=(w-SCENE_W*scale)/2;
    sceneY=(h-SCENE_H*scale)/2;
  }else{
    // 일반적인 비최대화 데스크톱 창: 화면 높이에 따른 재중앙 정렬을 하지 않음.
    const browserUI=Math.max(0,window.outerHeight-window.innerHeight);
    scale=Math.max(w/SCENE_W,(h+browserUI)/SCENE_H);
    sceneX=(w-SCENE_W*scale)/2;
    sceneY=-browserUI;
  }
  // 화면 아래(작업 표시줄 등)에 가려지는 장면 높이만큼 비토리오 이름·연대기를 올림
  const visibleBottom=(h-sceneY)/scale;
  const lift=Math.max(0,Math.min(300,SCENE_H-visibleBottom));
  scene.style.setProperty('--lift',lift+'px');
  const nameRect=document.querySelector('[data-link="vittorioName"] rect');
  if(nameRect)nameRect.setAttribute('y',948-lift);
  maxPanX=isMobile?Math.max(0,(SCENE_W*scale-w)/2):0;
  maxPanY=0;
  panX=Math.max(-maxPanX,Math.min(maxPanX,panX));
  panY=0;
  renderScene();
}
window.addEventListener('resize',fitScene,{passive:true});
window.addEventListener('orientationchange',fitScene);
window.addEventListener('focus',fitScene);
window.addEventListener('pageshow',fitScene);
if(window.visualViewport)window.visualViewport.addEventListener('resize',fitScene,{passive:true});
fitScene();
let blockClick=false;
for(const el of document.querySelectorAll('.hotspot')){
 const key=el.dataset.link;
 const url=(LINKS[key]||'').trim();
 el.setAttribute('href',url||'#');
 // 사이트 안 페이지(news.html 등)는 같은 탭에서, 외부 주소는 새 탭에서 엽니다.
 if(/^https?:\/\//i.test(url)){el.setAttribute('target','_blank');el.setAttribute('rel','noopener noreferrer');}
 el.addEventListener('click',e=>{if(!url||blockClick)e.preventDefault();});
 el.addEventListener('pointerenter',()=>scene.dataset.hover=el.dataset.hover);
 el.addEventListener('pointerleave',()=>{if(scene.dataset.hover===el.dataset.hover)scene.removeAttribute('data-hover');});
 el.addEventListener('focus',()=>scene.dataset.hover=el.dataset.hover);
 el.addEventListener('blur',()=>scene.removeAttribute('data-hover'));
}
let drag=null;
viewport.addEventListener('pointerdown',e=>{
 if(e.target.closest('.chronology'))return; // 텍스트 드래그 선택은 브라우저에 맡긴다.
 if(!mobileMode.matches||!maxPanX)return;
 drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:panX,py:panY,moved:false};blockClick=false;
});
viewport.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
 if(Math.abs(dx)>8)drag.moved=true;
 if(drag.moved){
  if(!viewport.hasPointerCapture(e.pointerId))viewport.setPointerCapture(e.pointerId);
  panX=Math.max(-maxPanX,Math.min(maxPanX,drag.px+dx));
  panY=0;
  renderScene();
 }
});
function endDrag(e){if(!drag||drag.id!==e.pointerId)return;if(drag.moved){blockClick=true;setTimeout(()=>blockClick=false,120)}drag=null}
viewport.addEventListener('pointerup',endDrag);
viewport.addEventListener('pointercancel',endDrag);
