/* ═══════════════════════════════════════════════════════════
   비토리오의 수첩 — 연대기 "Taken in by Silvio Salvatore…"를 누를 때마다 다른 쪽지
   필체: 반흘림 정자체, 강한 필압, 짙은 보랏빛 잉크(#2D2346), Cormorant Garamond Italic
   heavy: 감정이 격할 때(필압↑, 번짐↑)   cat: 마리아에게 쓴 사적인 메모(고양이 낙서)
   ═══════════════════════════════════════════════════════════ */
const NOTES = [
  {d:'Sept. 22', t:"Good morning. It's past eight."},
  {d:'Sept. 22', t:"Signor Giancarlo is waiting in the dining hall. He's already had two cups of coffee."},
  {d:'Sept. 22', t:"If you don't get up, I'll have to carry you down. I'd rather not explain that to him."},
  {d:'Sept. 22', t:"I know. I wasn't serious either."},
  {d:'Sept. 24', t:"The tie was strategic. Rats let their guard down around a man who can't dress himself properly."},
  {d:'Sept. 24', t:"If you need anything, ring the bell. I'll be across the hall."},
  {d:'Oct. 3',   t:"We can stay a little longer if you wish. The garden is quiet today."},
  {d:'Oct. 3',   t:"Yes or No.", cat:true},
  {d:'Oct. 12',  t:"I happen to like jazz very much. Especially when it's played with such honesty."},
  {d:'Oct. 13',  t:"Then I will live as your man. From this moment on, my life is yours. Entirely.", heavy:true},
  {d:'Oct. 14',  t:"If it were me, I wouldn't have let you sell your hair. I would have sold my everything first."},
  {d:'Oct. 15',  t:"Happy Birthday, Masha.", cat:true},
  {d:'Oct. 15',  t:"I stayed up making this, and every second felt like it was already yours."},
  {d:'Nov. 15',  t:"I brought canelé today. The bakery on 72nd Street bakes them on Fridays only."},
  {d:'Nov. 15',  t:"Then I will buy every canelé on 72nd Street every Friday until they run out of sugar.", cat:true},
  {d:'Nov. 22',  t:"Always. I promise you every Friday, every canelé, every cup of flat white."},
  {d:'Nov. 22',  t:"And when I cannot keep my promise, forgive the silence.", heavy:true},
  {d:'Dec. 6',   t:"I'll be back before dawn. Lock your door.", cat:true, cats:2},
  {d:'Dec. 25',  t:"Merry Christmas. The dinner downstairs starts at eight. I came up fifteen minutes early. ...No particular reason."},
  {d:'Dec. 25',  t:"You weren't supposed to figure that out. The cat was supposed to just be a cat. You ruin all my excuses.", cat:true},
  {d:'Dec. 26',  t:"This is my voice. You bought me a voice for Christmas."},
  {d:'Dec. 31',  t:"Yes. That is the one thing in my life that was never a lie.", heavy:true},
  {d:'Dec. 31',  t:"I was supposed to be a knife. I became something else.", heavy:true},
  {d:'Dec. 31',  t:"Hit me, Masha. Or curse me. Please don't just cry like that.", heavy:true},
  {d:'Jan. 1',   t:"Forget Lorenzo. His ledger is my problem, not yours."},
  {d:'Jan. 13',  t:"We need to move. Now. North, then west."},
];
(function(){
  const trig = document.querySelector('.note-trigger');
  const nb = document.getElementById('notebook'), page = document.getElementById('nbPage');
  const dateEl = document.getElementById('nbDate'), textEl = document.getElementById('nbText');
  const scene = document.getElementById('scene');
  if (!trig || !nb) return;
  let bag = [], last = -1;
  function nextIndex(){                     // 전부 한 번씩 나온 뒤에 다시 섞음 (같은 쪽지 연속 X)
    if (!bag.length){ bag = NOTES.map((_, i) => i).sort(() => Math.random() - .5); if (bag[0] === last) bag.push(bag.shift()); }
    return last = bag.shift();
  }
  function write(){
    const n = NOTES[nextIndex()];
    dateEl.textContent = n.d;
    textEl.className = 'nb-text' + (n.heavy ? ' heavy' : '');
    textEl.textContent = n.t;
    if (n.cat){ const c = document.createElement('span'); c.className = 'cat'; c.textContent = Array(n.cats || 1).fill('=^._.^=').join(' '); textEl.append(' ', c); }
  }
  function open(){
    if (nb.hidden || nb.classList.contains('closing')){ clearTimeout(open.t); nb.hidden = false; nb.classList.remove('closing'); scene.classList.add('notebook-open'); write(); return; }
    write(); page.classList.remove('turn'); void page.offsetWidth; page.classList.add('turn');
  }
  function close(){
    if (nb.hidden || nb.classList.contains('closing')) return;
    nb.classList.add('closing'); scene.classList.remove('notebook-open');
    open.t = setTimeout(() => { nb.hidden = true; nb.classList.remove('closing'); }, 300);
  }
  // 연대기 글씨: 닫혀 있으면 열고, 열려 있으면 닫음 (다음 쪽지는 수첩을 눌러서)
  const toggle = () => (nb.hidden || nb.classList.contains('closing')) ? open() : close();
  trig.addEventListener('click', e => { if (String(getSelection()).length) return; e.stopPropagation(); toggle(); });
  trig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); } });
  page.addEventListener('click', e => { if (String(getSelection()).length) return; e.stopPropagation(); open(); });   // 수첩을 눌러도 다음 장
  nb.addEventListener('pointerdown', e => e.stopPropagation());
  document.addEventListener('pointerdown', e => { if (!e.target.closest('.note-trigger')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
