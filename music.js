/* ═══════════════════════════════════════════════════════════
   V. — 음악 페이지 동작
   · 첫 화면: 앨범 커버만 → 클릭하면 커버가 사라지고 LP가 왼쪽에 크게, 1번 곡 재생
   · LP 클릭 / 스페이스바 = 재생·정지, 재생 바로 이동·볼륨
   · PC: 곡 제목에 마우스를 올리면 곡 목록 / 모바일: 곡 이름 줄을 옆으로 넘기거나 눌러서 목록
   · 곡 목록·문구: music-tracks.js
   ═══════════════════════════════════════════════════════════ */
const PLAYLIST = 'https://youtube.com/playlist?list=PLPOv65CdoMiw&si=R1mKH4y3lfv6whMW';

const $ = id => document.getElementById(id);
const html = document.documentElement, stage = $('stage'), col = $('col'), body = $('body'), pop = $('pop'), swipe = $('swipe');
const pad = n => String(n).padStart(2, '0');
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const isM = () => html.classList.contains('m');

/* ── 화면 맞춤 ── */
const mq = matchMedia('(max-width: 899px), (orientation: portrait)');
function fit(){
  if (mq.matches){ html.classList.add('m'); stage.style.removeProperty('--z'); }
  else { html.classList.remove('m'); stage.style.setProperty('--z', Math.min(innerWidth / 1920, innerHeight / 1000)); }
}
fit(); addEventListener('resize', fit, {passive:true}); mq.addEventListener && mq.addEventListener('change', fit);

/* ── 목록 만들기 ── */
const rows = TRACKS.map((t, i) => {
  const r = document.createElement('a'); r.className = 'r'; r.tabIndex = 0;
  r.innerHTML = `<b>No. ${pad(i + 1)}</b>${esc(t.t)}<i>${esc(t.a)}</i>`;
  r.addEventListener('click', () => { closeList(); choose(i); });
  r.addEventListener('keydown', e => { if (e.key === 'Enter'){ closeList(); choose(i); } });
  pop.appendChild(r); return r;
});
const sws = TRACKS.map((t, i) => {
  const d = document.createElement('div'); d.className = 'sw';
  d.innerHTML = `<div class="no">No. ${pad(i + 1)}</div><div class="t">${esc(t.t)}</div><div class="a">${esc(t.a)}</div>`;
  d.addEventListener('click', () => { if (i === cur) toggleList(); else { swipeTo(i); choose(i); } });
  swipe.appendChild(d); return d;
});

/* ── 곡 표시 ── */
let cur = 0;
function renderWords(i){
  const t = TRACKS[i]; let h = t.sub ? `<p class="w-sub">${esc(t.sub)}</p>` : '';
  for (const L of t.lines){
    const ko = s => s ? `<div class="ko">${esc(s)}</div>` : '';
    if (L[0] === 'v') h += `<div class="w-v"><div class="en">${esc(L[1])}</div>${ko(L[2])}</div>`;
    else if (L[0] === 'o') h += `<div class="w-o"><div class="en">‘${esc(L[1])}’</div>${ko(L[2])}</div>`;
    else if (L[0] === 's') h += `<div class="w-s"><div class="en">“${esc(L[2])}”</div>${ko(L[3])}</div>`;
    else if (L[0] === 'p') h += `<p class="w-p">${esc(L[1])}</p>`;
    else if (L[0] === 'n') h += `<div class="w-n">${esc(L[1])}</div>`;
  }
  body.innerHTML = h; body.scrollTop = 0;
  body.classList.remove('swap'); void body.offsetWidth; body.classList.add('swap');
}
function showTrack(i){
  cur = i;
  $('nNo').textContent = 'No. ' + pad(i + 1); $('nT').textContent = TRACKS[i].t; $('nA').textContent = TRACKS[i].a;
  rows.forEach((r, k) => r.classList.toggle('on', k === i));
  sws.forEach((d, k) => d.classList.toggle('on', k === i));
  renderWords(i);
  if (isM() && scrollY > 0) scrollTo({top: 0, behavior: 'smooth'});
}
showTrack(0);

/* ── 곡 목록 열고 닫기 ── */
function placePop(){ const n = $('now'); col.style.setProperty('--pop-top', (n.offsetTop + n.offsetHeight + 22) + 'px'); }
const openList = () => {
  placePop(); col.classList.add('list'); swipe.classList.add('list');
  const r = rows[cur]; pop.scrollTop = r.offsetTop - pop.clientHeight / 2 + r.offsetHeight / 2;   // 목록 안에서만 스크롤
};
/* 화면 전체가 밀려 올라가는 것 방지 */
stage.addEventListener('scroll', () => { if (!isM()){ stage.scrollTop = 0; stage.scrollLeft = 0; } });
function closeList(){ col.classList.remove('list'); swipe.classList.remove('list'); }
function toggleList(){ col.classList.contains('list') ? closeList() : openList(); }
$('now').addEventListener('mouseenter', () => { if (!isM()) openList(); });
col.addEventListener('mouseleave', () => { if (!isM()) closeList(); });
$('now').addEventListener('click', toggleList);
$('now').addEventListener('keydown', e => { if (e.key === 'Enter') toggleList(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeList(); });

/* ── 모바일: 옆으로 넘기기 ── */
let swT = 0, swLock = false;
function swipeTo(i, smooth = true){ const d = sws[i]; swLock = true; swipe.scrollTo({left: d.offsetLeft - (swipe.clientWidth - d.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto'}); setTimeout(() => swLock = false, 600); }
swipe.addEventListener('scroll', () => {
  if (swLock) return; clearTimeout(swT);
  swT = setTimeout(() => {
    const mid = swipe.scrollLeft + swipe.clientWidth / 2; let best = 0, bd = 1e9;
    sws.forEach((d, k) => { const dd = Math.abs(d.offsetLeft + d.offsetWidth / 2 - mid); if (dd < bd){ bd = dd; best = k; } });
    if (best !== cur){ closeList(); choose(best); }
  }, 160);
}, {passive:true});

/* ═════════ 유튜브 ═════════ */
const listId = (PLAYLIST.match(/[?&]list=([\w-]+)/) || [])[1];
const ytIdOf = u => { const m = (u || '').match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/); return m ? m[1] : null; };
let player = null, ready = false, queued = null, vid = TRACKS.map(t => ytIdOf(t.youtube)), loaded = -1, playing = false;
function boot(){
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('yt', {
      width: 200, height: 200,
      playerVars: {listType: 'playlist', list: listId, playsinline: 1, controls: 0, disablekb: 1, rel: 0, autoplay: 0},
      events: {
        onReady: () => { player.setVolume(vol * 100 / 7); player.cuePlaylist({listType: 'playlist', list: listId}); waitList(0); },
        onStateChange: e => {
          const S = YT.PlayerState;
          if (e.data === S.PLAYING) setPlaying(true);
          else if (e.data === S.PAUSED) setPlaying(false);
          else if (e.data === S.ENDED){ setPlaying(false); next(); }
        },
        onError: () => { setPlaying(false); next(); }
      }
    });
  };
  const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
}
function waitList(n){
  const l = player.getPlaylist && player.getPlaylist();
  if (l && l.length){ assign(l); ready = true; if (queued){ const q = queued; queued = null; q(); } return; }
  if (n < 60) setTimeout(() => waitList(n + 1), 250);
}
/* 재생목록 영상 ↔ 곡: 기본은 순서대로, 영상 제목을 받아오면 제목이 맞는 것끼리 */
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !['the','in','of','no','op','a','to','you'].includes(w));
function assign(list){
  TRACKS.forEach((t, i) => { if (!vid[i]) vid[i] = list[i] || null; });
  const free = TRACKS.map(t => !ytIdOf(t.youtube));
  Promise.all(list.map(id => fetch('https://noembed.com/embed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id))
    .then(r => r.json()).then(j => [id, j.title || '']).catch(() => [id, ''])))
  .then(pairs => {
    const used = new Set(), nx = vid.slice();
    TRACKS.forEach((t, i) => {
      if (!free[i]) return; const want = norm(t.t); let best = null, score = 0;
      for (const [id, title] of pairs){ if (used.has(id) || !title) continue;
        const got = norm(title), hit = want.filter(w => got.includes(w)).length / (want.length || 1);
        if (hit > score){ score = hit; best = id; } }
      if (best && score >= .6){ nx[i] = best; used.add(best); }
    });
    if (used.size >= Math.min(8, TRACKS.length / 2)) vid = nx;
  });
}
const whenReady = fn => ready ? fn() : (queued = fn);

/* ── 재생 ── */
function setPlaying(p){ playing = p; stage.classList.toggle('playing', p); col.classList.toggle('paused', !p); cancelAnimationFrame(raf); if (p) loop(); }
function play(i){
  whenReady(() => {
    const id = vid[i]; if (!id) return next();
    if (loaded !== i){ loaded = i; player.loadVideoById(id); } else player.playVideo();
  });
}
function choose(i){ showTrack(i); swipeTo(i); play(i); }
const next = () => choose((cur + 1) % TRACKS.length);
function toggle(){ if (!player || loaded < 0) return play(cur); playing ? player.pauseVideo() : player.playVideo(); }
col.classList.add('paused');

/* 시작 */
/* 시작: 커버 안에서 LP가 꺼내지고 → 커버는 왼쪽으로 빠지며 LP가 제자리로 */
let starting = false;
function start(){
  if (!stage.classList.contains('intro') || starting) return;
  starting = true; stage.classList.add('pull');
  play(cur);
  setTimeout(() => {
    stage.classList.remove('intro', 'pull'); stage.classList.add('open');
    setTimeout(() => { fit(); swipeTo(cur, false); }, 50);
  }, 850);
}
$('sleeve').addEventListener('click', start);
// 재생 중 LP를 다시 누르면 → 메인으로
function goHome(){
  if (stage.classList.contains('leaving')) return;
  if (player && player.pauseVideo) player.pauseVideo();
  stage.classList.add('leaving');
  setTimeout(() => { location.href = 'index.html'; }, 900);
}
$('lp').addEventListener('click', () => stage.classList.contains('intro') ? start() : goHome());
for (const el of [$('sleeve'), $('lp')]) el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); el.click(); } });
document.addEventListener('keydown', e => { if (e.key === ' ' && !e.target.closest('button,a,[role=slider],.lp,.sleeve,.now')){ e.preventDefault(); stage.classList.contains('intro') ? start() : toggle(); } });
$('bPlay').addEventListener('click', toggle);
$('bNext').addEventListener('click', next);
$('bPrev').addEventListener('click', () => { if (player && player.getCurrentTime && player.getCurrentTime() > 4) player.seekTo(0, true); else choose((cur - 1 + TRACKS.length) % TRACKS.length); });

/* ── 진행 바 ── */
let raf = 0;
const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + pad(s % 60); };
function paint(){
  if (!player || !player.getDuration) return;
  const d = player.getDuration() || 0, t = player.getCurrentTime() || 0, k = d ? Math.min(1, t / d) : 0;
  $('fill').style.width = (k * 100) + '%'; $('tick').style.left = (k * 100) + '%';
  $('tm').textContent = fmt(t) + ' / ' + fmt(d); $('track').setAttribute('aria-valuenow', Math.round(k * 100));
}
function loop(){ paint(); raf = requestAnimationFrame(loop); }
function seekAt(x){
  if (!player || !player.getDuration || loaded < 0) return;
  const r = $('track').getBoundingClientRect(), f = Math.min(1, Math.max(0, (x - r.left) / r.width));
  player.seekTo(f * player.getDuration(), true); paint();
}
$('track').addEventListener('pointerdown', e => {
  seekAt(e.clientX); $('track').setPointerCapture(e.pointerId);
  const mv = ev => seekAt(ev.clientX); $('track').addEventListener('pointermove', mv);
  $('track').addEventListener('pointerup', () => $('track').removeEventListener('pointermove', mv), {once: true});
});
$('track').addEventListener('keydown', e => {
  if (!player || loaded < 0) return;
  if (e.key === 'ArrowRight'){ player.seekTo(player.getCurrentTime() + 5, true); e.preventDefault(); }
  if (e.key === 'ArrowLeft'){ player.seekTo(Math.max(0, player.getCurrentTime() - 5), true); e.preventDefault(); }
});

/* ── 볼륨 막대 (7칸) ── */
let vol = 5;
const bars = [4, 6, 8, 10, 12, 14, 16].map(h => { const s = document.createElement('span'); s.style.height = h + 'px'; $('vol').appendChild(s); return s; });
function setVol(v){ vol = Math.max(0, Math.min(7, v)); bars.forEach((b, k) => b.classList.toggle('on', k < vol)); $('vol').setAttribute('aria-valuenow', vol); if (player && player.setVolume) player.setVolume(vol * 100 / 7); }
setVol(vol);
bars.forEach((b, k) => b.addEventListener('click', () => setVol(vol === k + 1 ? k : k + 1)));
$('vol').addEventListener('wheel', e => { e.preventDefault(); setVol(vol - Math.sign(e.deltaY)); }, {passive: false});
$('vol').addEventListener('keydown', e => { if (e.key === 'ArrowUp' || e.key === 'ArrowRight') setVol(vol + 1); if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') setVol(vol - 1); });

boot();
