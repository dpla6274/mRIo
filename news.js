/* ═══════════════════════════════════════════════════════════
   🎵 음악 설정 — 여기만 고치면 됩니다
   - youtube: 유튜브 주소를 그대로 붙여넣기 (watch?v=, youtu.be/, shorts/ 모두 가능, &t=30s 시작 시간도 인식)
   - file   : 유튜브 대신 직접 올린 음원을 쓰고 싶을 때 (예: 'assets/music/song.mp3')
   - title  : 비워두면 유튜브 영상 제목을 자동으로 표시
   여러 곡을 넣으면 ⏭ 버튼이 생기고 순서대로 재생됩니다.
   ═══════════════════════════════════════════════════════════ */
const MUSIC = {
  tracks: [
    { youtube: 'https://www.youtube.com/watch?v=3r4GNv9b4KQ&list=RD3r4GNv9b4KQ&start_radio=1', title: 'Solitude' },
    // { youtube: 'https://www.youtube.com/watch?v=XXXXXXXXXXX', title: '' },
    // { file: 'assets/music/my-song.mp3', title: 'My Song' },
  ],
  volume: 70,              // 0–100
  loop: true,              // 마지막 곡이 끝나면 처음으로
  startOnFirstClick: false // true: 페이지 아무 곳이나 처음 클릭할 때 자동 재생 (브라우저가 소리 있는 자동재생을 막기 때문)
};

/* ── 화면 맞춤: 1920px 폭 기준을 창 폭에 맞게 확대/축소 ── */
const stage = document.getElementById('stage');
/* ── 화면 맞춤 (반응형) ──────────────────────────────
   · 가로: 창 폭에 맞춰 배율(z)
   · 세로: 주소창·작업 표시줄을 뺀 "실제 보이는 창 높이"에 맞춤 (내부 스크롤 없음, 3↔4면만 스크롤)
   · 위·아래 여백(PAD)은 고정. 남는/모자란 높이는 개체 사이 간격으로만 조절
   · 단마다 간격을 따로 계산해서 모든 단이 같은 줄에서 끝남
   · 광고는 자리가 모자라면 우선순위 숫자가 큰 것부터 숨김
   · 그래도 모자라면(아주 낮은 창) 전체를 축소 */
const ADDRESS_BAR = 87, PAD = 18, MIN_PX = 7, MIN_GS = 0.3, CG_MAX = 4;
let cols = null;
function measure(){
  stage.style.setProperty('--z', 1);
  document.querySelectorAll('.ad-off').forEach(e => e.classList.remove('ad-off'));
  cols = [...document.querySelectorAll('.page > .col')].map(c => ({
    el: c,
    items: [...c.children].map(k => ({
      el: k, h: k.offsetHeight, ad: k.classList.contains('ad'),
      pr: +(k.dataset.pr || 1), mt: parseFloat(getComputedStyle(k).getPropertyValue('--mt')) || 0
    }))
  }));
}
// 한 단의 높이: 개체 높이 합 + 간격(첫 개체 제외, 최소 MIN_PX)
function colHeight(items, cg){
  let h = 0, first = true;
  for (const it of items){ h += it.h; if (!first) h += Math.max(MIN_PX, it.mt * cg); first = false; }
  return h;
}
const textOnly = c => c.items.filter(i => !i.ad);
const need = gs => 284 + 86 * gs + 2 * PAD + Math.max(...cols.map(c => colHeight(textOnly(c), gs)));
function fit(){
  if (!cols) measure();
  const W = window.innerWidth, Hpx = window.innerHeight;
  let z = W / 1920, H = Hpx / z, gs = 1, top = 0;
  // 1) 머리 영역 간격(gs)과 맨 위 87px 노출량(top)
  if (need(1) <= H) top = Math.min(ADDRESS_BAR, H - need(1));
  else if (need(MIN_GS) > H){ gs = MIN_GS; z = Hpx / need(MIN_GS); H = Hpx / z; }
  else { let lo = MIN_GS, hi = 1; for (let i = 0; i < 30; i++){ const m = (lo + hi) / 2; need(m) <= H ? lo = m : hi = m; } gs = lo; }
  const avail = H - (top + 284 + 86 * gs) - 2 * PAD - 0.5;
  // 2) 단마다: 들어갈 광고 고르기 → 간격 배율(cg) 계산
  for (const c of cols){
    let vis = c.items.slice();
    while (colHeight(vis, 0) > avail){
      const ads = vis.filter(i => i.ad); if (!ads.length) break;
      const drop = ads.reduce((a, b) => b.pr >= a.pr ? b : a);
      vis = vis.filter(i => i !== drop);
    }
    let cg;
    if (colHeight(vis, CG_MAX) <= avail) cg = CG_MAX;
    else { let lo = 0, hi = CG_MAX; for (let i = 0; i < 30; i++){ const m = (lo + hi) / 2; colHeight(vis, m) <= avail ? lo = m : hi = m; } cg = lo; }
    c.el.style.setProperty('--cg', cg.toFixed(4));
    for (const it of c.items){
      it.el.classList.toggle('ad-off', !vis.includes(it));
      it.el.classList.toggle('lead', it === vis[0]);
    }
  }
  stage.style.setProperty('--z', z);
  stage.style.setProperty('--gs', gs.toFixed(4));
  stage.style.setProperty('--top', top.toFixed(2) + 'px');
  stage.style.height = H + 'px';
}
let fitRaf = 0;
const queueFit = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fit); };
fit();
window.addEventListener('resize', queueFit, {passive:true});
if (window.visualViewport) visualViewport.addEventListener('resize', queueFit, {passive:true});
// 글꼴이 늦게 들어오면 줄 수·광고 높이가 바뀌므로 다시 측정
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { cols = null; fit(); });

/* ── 제목 위 투명 텍스트를 PSD 글자 폭에 맞춤 (드래그 범위가 글자와 일치하도록) ── */
function fitSelectableText(){
  for (const ln of document.querySelectorAll('.sel .ln')){
    ln.style.setProperty('--sx', 1);
    const target = parseFloat(getComputedStyle(ln).getPropertyValue('--lw'));
    const natural = ln.scrollWidth;
    if (natural && target) ln.style.setProperty('--sx', (target / natural).toFixed(4));
  }
}
(document.fonts ? document.fonts.ready : Promise.resolve()).then(fitSelectableText);

/* ── 키보드 ↑↓ / PageUp·PageDown으로도 면 넘기기 ── */
const pages = document.getElementById('pages');
pages.focus({preventScroll:true});
document.addEventListener('keydown', e => {
  if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if (e.target.closest && e.target.closest('.pl-track')) return;
  const step = pages.clientHeight;
  if (['PageDown',' '].includes(e.key) && !e.shiftKey){ pages.scrollBy({top:step, behavior:'smooth'}); e.preventDefault(); }
  if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)){ pages.scrollBy({top:-step, behavior:'smooth'}); e.preventDefault(); }
});
/* 머리 영역 위에서 굴려도 아래 면이 넘어가도록 */
document.querySelector('.masthead').addEventListener('wheel', e => {
  pages.scrollBy({top:e.deltaY, left:0}); e.preventDefault();
}, {passive:false});

/* ═══════════════ 음악 재생 바 ═══════════════ */
(function(){
  const ui = {
    root: document.getElementById('player'), play: document.getElementById('plPlay'),
    next: document.getElementById('plNext'), mute: document.getElementById('plMute'),
    title: document.getElementById('plTitle'), track: document.getElementById('plTrack'),
    fill: document.getElementById('plFill'), knob: document.getElementById('plKnob'),
    time: document.getElementById('plTime')
  };
  const tracks = MUSIC.tracks.filter(t => (t.youtube && t.youtube.trim()) || (t.file && t.file.trim()));
  if (!tracks.length){ ui.root.classList.add('empty'); ui.play.addEventListener('click', () => {
    ui.title.textContent = 'NO RECORD — news.js 의 MUSIC 에 곡을 넣어주세요'; }); return; }
  if (tracks.length > 1) ui.next.hidden = false;

  let idx = 0, engine = null, muted = false, raf = 0, ytReady = null;

  const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); };
  function ytId(url){
    const m = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/) || url.match(/^([\w-]{11})$/);
    return m ? m[1] : null;
  }
  function ytStart(url){
    const m = url.match(/[?&](?:t|start)=(\d+h)?(\d+m)?(\d+)s?/);
    if (!m) return 0;
    return (parseInt(m[1])||0)*3600 + (parseInt(m[2])||0)*60 + (parseInt(m[3])||0);
  }
  function setTitle(t){ ui.title.textContent = t || '—'; ui.title.title = t || ''; }
  function setPlaying(p){ ui.root.classList.toggle('playing', p); ui.play.setAttribute('aria-label', p ? 'Pause' : 'Play'); if (p) loop(); else cancelAnimationFrame(raf); paint(); }
  function paint(){
    if (!engine) return;
    const cur = engine.time(), dur = engine.duration();
    const pct = dur ? Math.min(100, cur / dur * 100) : 0;
    ui.fill.style.width = pct + '%'; ui.knob.style.left = pct + '%';
    ui.track.setAttribute('aria-valuenow', Math.round(pct));
    ui.time.textContent = fmt(cur) + ' / ' + fmt(dur);
  }
  function loop(){ paint(); raf = requestAnimationFrame(loop); }

  /* 유튜브 */
  function loadYT(){
    if (ytReady) return ytReady;
    ytReady = new Promise(res => {
      window.onYouTubeIframeAPIReady = res;
      const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
    });
    return ytReady;
  }
  function ytEngine(t){
    const id = ytId(t.youtube.trim());
    if (!id){ setTitle('유튜브 주소를 확인해주세요'); return Promise.reject(); }
    return loadYT().then(() => new Promise(res => {
      const holder = document.getElementById('ytHolder'); holder.innerHTML = '<div id="ytFrame"></div>';
      const p = new YT.Player('ytFrame', {
        width: 200, height: 200, videoId: id,
        playerVars: { start: ytStart(t.youtube), playsinline: 1, controls: 0, disablekb: 1, rel: 0 },
        events: {
          onReady: () => {
            p.setVolume(MUSIC.volume); if (muted) p.mute();
            if (!t.title){ const d = p.getVideoData && p.getVideoData(); if (d && d.title) setTitle(d.title); }
            res({
              play: () => p.playVideo(), pause: () => p.pauseVideo(),
              time: () => p.getCurrentTime ? p.getCurrentTime() : 0, duration: () => p.getDuration ? p.getDuration() : 0,
              seek: s => p.seekTo(s, true), mute: m => m ? p.mute() : p.unMute(), destroy: () => p.destroy()
            });
          },
          onStateChange: e => {
            if (e.data === YT.PlayerState.PLAYING){ setPlaying(true); if (!t.title){ const d = p.getVideoData(); if (d && d.title) setTitle(d.title); } }
            else if (e.data === YT.PlayerState.PAUSED) setPlaying(false);
            else if (e.data === YT.PlayerState.ENDED) ended();
          },
          onError: () => { setTitle('재생할 수 없는 영상입니다 (퍼가기 허용 여부 확인)'); setPlaying(false); }
        }
      });
    }));
  }
  /* 직접 올린 음원 */
  function fileEngine(t){
    const a = new Audio(t.file.trim()); a.preload = 'metadata'; a.volume = MUSIC.volume / 100; a.muted = muted;
    a.addEventListener('play', () => setPlaying(true)); a.addEventListener('pause', () => setPlaying(false));
    a.addEventListener('ended', ended); a.addEventListener('loadedmetadata', paint);
    a.addEventListener('error', () => setTitle('음원 파일을 찾을 수 없습니다: ' + t.file));
    return Promise.resolve({ play: () => a.play(), pause: () => a.pause(), time: () => a.currentTime, duration: () => a.duration || 0,
      seek: s => { a.currentTime = s; }, mute: m => { a.muted = m; }, destroy: () => { a.pause(); a.src = ''; } });
  }

  let loading = null;
  function load(i){
    if (engine){ engine.destroy(); engine = null; }
    idx = i; const t = tracks[i];
    setTitle(t.title || (t.youtube ? '—' : t.file.split('/').pop()));
    loading = (t.youtube && t.youtube.trim() ? ytEngine(t) : fileEngine(t)).then(e => { engine = e; loading = null; paint(); return e; });
    return loading;
  }
  function ended(){
    setPlaying(false);
    if (idx + 1 < tracks.length) load(idx + 1).then(e => e.play());
    else if (MUSIC.loop) load(0).then(e => e.play());
  }
  function toggle(){
    if (!engine && !loading) return load(idx).then(e => e.play());
    if (!engine) return;
    ui.root.classList.contains('playing') ? engine.pause() : engine.play();
  }
  // 제목은 미리 표시 (유튜브 API는 첫 재생 때 불러옴)
  setTitle(tracks[0].title || (tracks[0].youtube ? '—' : tracks[0].file.split('/').pop()));

  ui.play.addEventListener('click', toggle);
  ui.next.addEventListener('click', () => load((idx + 1) % tracks.length).then(e => e.play()));
  ui.mute.addEventListener('click', () => { muted = !muted; ui.root.classList.toggle('muted', muted); if (engine) engine.mute(muted); });

  function seekAt(clientX){
    if (!engine) return;
    const r = ui.track.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    engine.seek(f * engine.duration()); paint();
  }
  ui.track.addEventListener('pointerdown', e => {
    seekAt(e.clientX); ui.track.setPointerCapture(e.pointerId);
    const mv = ev => seekAt(ev.clientX);
    ui.track.addEventListener('pointermove', mv);
    ui.track.addEventListener('pointerup', () => ui.track.removeEventListener('pointermove', mv), {once:true});
  });
  ui.track.addEventListener('keydown', e => {
    if (!engine) return;
    if (e.key === 'ArrowRight'){ engine.seek(engine.time() + 5); paint(); e.preventDefault(); }
    if (e.key === 'ArrowLeft'){ engine.seek(Math.max(0, engine.time() - 5)); paint(); e.preventDefault(); }
  });
  if (MUSIC.startOnFirstClick){
    document.addEventListener('pointerdown', function first(e){
      if (e.target.closest('.player')) return;
      document.removeEventListener('pointerdown', first, true);
      if (!ui.root.classList.contains('playing')) toggle();
    }, true);
  }
})();
