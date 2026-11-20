/* ═══════════════════════════════════════════════════════════
   🎵 음악 설정 — 여기만 고치면 됩니다
   - youtube: 유튜브 주소를 그대로 붙여넣기 (watch?v=, youtu.be/, shorts/ 모두 가능, &t=30s 시작 시간도 인식)
   - file   : 유튜브 대신 직접 올린 음원을 쓰고 싶을 때 (예: 'assets/music/song.mp3')
   - title  : 비워두면 유튜브 영상 제목을 자동으로 표시
   여러 곡을 넣으면 ⏭ 버튼이 생기고 순서대로 재생됩니다.
   ═══════════════════════════════════════════════════════════ */
const MUSIC = {
  tracks: [
    { youtube: 'https://www.youtube.com/watch?v=3r4GNv9b4KQ&list=RD3r4GNv9b4KQ&start_radio=1', title: '' },
    // { youtube: 'https://www.youtube.com/watch?v=XXXXXXXXXXX', title: '' },
    // { file: 'assets/music/my-song.mp3', title: 'My Song' },
  ],
  volume: 70,              // 0–100
  loop: true,              // 마지막 곡이 끝나면 처음으로
  startOnFirstClick: false // true: 페이지 아무 곳이나 처음 클릭할 때 자동 재생 (브라우저가 소리 있는 자동재생을 막기 때문)
};

/* ── 화면 맞춤: 1920px 폭 기준을 창 폭에 맞게 확대/축소 ── */
const stage = document.getElementById('stage');
function fit(){
  const z = window.innerWidth / 1920;
  stage.style.setProperty('--z', z);
  stage.style.height = (window.innerHeight / z) + 'px';
}
fit();
window.addEventListener('resize', fit, {passive:true});
if (window.visualViewport) visualViewport.addEventListener('resize', fit, {passive:true});

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
    setTitle(t.title || (t.youtube ? 'loading…' : t.file.split('/').pop()));
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
  setTitle(tracks[0].title || (tracks[0].youtube ? 'PRESS ▶ TO PLAY' : tracks[0].file.split('/').pop()));

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
