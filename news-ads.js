/* ═══════════════════════════════════════════════════════════
   1940년 신문 광고 (꾸미기용 개체)
   - PLACEMENT: [면, 단(0부터), 들어갈 위치(0=맨 위, 99=맨 아래), 광고 이름, 우선순위]
   - 창 높이가 모자라면 우선순위 숫자가 큰 광고부터 자동으로 숨김
   ═══════════════════════════════════════════════════════════ */
const SVG = {
radio:`<svg viewBox="0 0 70 84" width="54" height="64" stroke-width="1.6">
  <path d="M6 80V36Q6 4 35 4Q64 4 64 36V80Z"/><path d="M11 76V37Q11 10 35 10Q59 10 59 37V76Z"/>
  <g class="hatch">${Array.from({length:9},(_,i)=>`<line x1="${17+i*4.5}" y1="${i<1||i>7?30:18}" x2="${17+i*4.5}" y2="50"/>`).join('')}</g>
  <path d="M15 50H55"/><circle cx="35" cy="62" r="7"/><path d="M35 57v5l3 2"/><circle cx="20" cy="66" r="3.5"/><circle cx="50" cy="66" r="3.5"/>
  <path d="M2 80h66"/></svg>`,
note:`<svg viewBox="0 0 80 60" width="70" height="52" stroke-width="1.5">
  <path d="M8 10h34v44H8z"/><path d="M12 10v44" /><g class="hatch">${[18,23,28,33,38,43].map(y=>`<line x1="16" y1="${y}" x2="38" y2="${y}"/>`).join('')}</g>
  <path d="M42 12l4 2v40l-4-2"/>
  <path d="M74 6l-20 46-4 3 1-5 20-46z"/><path d="M67 13l4 2M58 34l3 1.5"/><path d="M51 50l-1 4"/></svg>`,
canele:`<svg viewBox="0 0 90 60" width="80" height="54" stroke-width="1.4">
  <path d="M8 54h36l3-28c0-11-42-11-42 0z"/><path d="M5 26q21-10 42 0"/>
  <g class="hatch"><line x1="13" y1="54" x2="10" y2="28"/><line x1="20" y1="54" x2="18" y2="29"/><line x1="26" y1="54" x2="26" y2="29"/><line x1="32" y1="54" x2="34" y2="29"/><line x1="39" y1="54" x2="42" y2="28"/>
  <line x1="11" y1="40" x2="16" y2="40"/><line x1="11" y1="46" x2="16" y2="46"/><line x1="11" y1="50" x2="17" y2="50"/></g>
  <path d="M56 30h24l-3 22H59z"/><path d="M80 34q8 0 6 8t-8 6"/><path d="M52 54h32"/><path d="M62 24q-3-5 0-9M70 24q-3-5 0-9"/></svg>`,
book:`<svg viewBox="0 0 90 50" width="78" height="44" stroke-width="1.4">
  <path d="M45 12Q30 4 6 8v36q24-4 39 4q15-8 39-4V8Q60 4 45 12z"/><path d="M45 12v36"/>
  <g class="hatch">${[16,21,26,31,36].map(y=>`<line x1="12" y1="${y}" x2="39" y2="${y-2}"/><line x1="51" y1="${y-2}" x2="78" y2="${y}"/>`).join('')}</g>
  <path d="M60 2l4 10 4-10"/></svg>`,
car:`<svg viewBox="0 0 220 80" width="230" height="84" stroke-width="1.6">
  <path d="M8 58q0-10 14-14l22-6q18-22 44-24h40q22 2 40 22l24 6q16 4 18 16v4H8z"/>
  <path d="M56 38q14-18 34-20h18v20z"/><path d="M114 18h16q16 2 28 20h-44z"/>
  <circle cx="50" cy="62" r="12"/><circle cx="50" cy="62" r="5"/><circle cx="166" cy="62" r="12"/><circle cx="166" cy="62" r="5"/>
  <g class="hatch">${Array.from({length:14},(_,i)=>`<line x1="${70+i*7}" y1="44" x2="${66+i*7}" y2="56"/>`).join('')}</g>
  <path d="M196 50h14M4 74h212"/><path d="M28 74l6-4M184 74l6-4" /></svg>`,
cat:`<svg viewBox="0 0 70 70" width="56" height="56" stroke-width="1.5">
  <path d="M20 64q-6-20 4-30l-4-16 10 9q5-2 10 0l10-9-4 16q10 10 4 30z"/>
  <circle cx="29" cy="34" r="1.6"/><circle cx="41" cy="34" r="1.6"/><path d="M35 39l-2 2h4zM35 41v2M24 40h-8M24 43h-7M46 40h8M46 43h7"/>
  <path d="M50 62q14-2 12-14"/><g class="hatch"><line x1="26" y1="50" x2="30" y2="60"/><line x1="33" y1="49" x2="35" y2="61"/><line x1="40" y1="50" x2="39" y2="61"/></g></svg>`,
violin:`<svg viewBox="0 0 40 110" width="26" height="72" stroke-width="1.4">
  <path d="M20 40q-12 0-12 12q0 6 5 9q-7 4-7 14q0 18 14 18t14-18q0-10-7-14q5-3 5-9q0-12-12-12z"/>
  <path d="M20 40V8M17 4q3-4 6 0v6h-6z"/><path d="M15 62q-2 3 0 6M25 62q2 3 0 6"/><path d="M14 80h12"/><path d="M36 20L6 100"/></svg>`
};
const AD = {
radio:`<div class="ad" aria-hidden="true"><div class="dbl-in" style="display:flex;gap:8px;align-items:center;padding:6px 8px">
  ${SVG.radio}
  <div style="flex:1">
    <div class="rev f-nar tiny c" style="letter-spacing:.2em">WJZ · Tonight · 11:30 P.M.</div>
    <div class="f-anton c" style="font-size:25px;line-height:1;margin-top:3px">Duke Ellington</div>
    <div class="f-nar tiny c">and his famous orchestra</div>
    <div class="f-scr c" style="font-size:19px;line-height:1.1">“Sophisticated Lady”</div>
  </div></div></div>`,
note:`<div class="ad" aria-hidden="true"><div class="dbl-in" style="display:flex;gap:6px;align-items:center;padding:5px 8px">
  <div style="flex:1">
    <div class="f-black" style="font-size:17px;line-height:1">SAY IT<br>IN INK!</div>
    <div class="f-ser" style="font-size:10.5px;line-height:1.15;margin-top:2px"><i>Pocket Notebooks for the man of few words.</i></div>
    <div class="f-nar tiny" style="margin-top:2px">Yes · No · 10¢ at all stationers</div>
  </div>${SVG.note}</div></div>`,
help:`<div class="ad" aria-hidden="true"><div class="rev f-anton c" style="font-size:15px;letter-spacing:.06em;padding:3px">Help Wanted — Male</div>
  <div class="classified" style="padding:5px 8px 4px">
   <p><b>BODYGUARD</b>, experienced. Large, quiet, never late. Must write a fair hand; need not speak. Need not tie a necktie properly. Upper East Side. <i>Apply in writing only.</i></p>
  </div></div>`,
magi:`<div class="ad" aria-hidden="true"><div class="dbl-in" style="display:flex;align-items:center;gap:8px;padding:4px 8px">
  ${SVG.book.replace('width="78" height="44"','width="62" height="35"')}
  <div class="c" style="flex:1"><div class="f-nar tiny" style="font-size:8px">New at Your Bookseller</div>
   <div class="f-scr" style="font-size:21px;line-height:1">The Gift of the Magi</div>
   <div class="f-anton" style="font-size:11px;letter-spacing:.12em">by O. Henry · <span class="rev" style="padding:0 4px">25¢</span></div></div>
 </div></div>`,
canele:`<div class="ad" aria-hidden="true"><div class="dbl-in" style="padding:5px 9px 6px">
  <div class="f-nar tiny c">Fresh every Friday · West 72nd St.</div>
  <div style="display:flex;align-items:center;gap:6px">${SVG.canele}
   <div class="f-black" style="font-size:27px;line-height:.9;letter-spacing:-.01em">CANE<br>LÉS</div></div>
  <div class="list" style="margin-top:3px"><span>Canelé, each</span><span>5¢</span><span>Flat White</span><span>10¢</span><span>Half Dozen, boxed</span><span>25¢</span></div>
  <div class="f-ser c" style="font-size:10px;margin-top:2px"><i>Fridays only — until the sugar runs out.</i></div>
 </div></div>`,
pers:`<div class="ad" aria-hidden="true"><div class="rev f-anton c" style="font-size:14px;letter-spacing:.08em;padding:2px">Personals</div>
  <div class="classified" style="padding:5px 8px 4px">
   <p><b>M.</b> — Every Friday, every canelé, every cup of flat white. <i>Always.</i> — V.</p>
  </div></div>`,
// page 4
car:`<div class="ad" aria-hidden="true"><div class="dbl-in" style="display:flex;align-items:center;gap:6px;padding:2px 6px">
   ${SVG.car.replace('width="230" height="84"','width="74" height="27"')}
   <div style="flex:1;line-height:1"><div class="f-black" style="font-size:15px">MERCURY 8 <span class="f-scr" style="font-size:13px;font-weight:400">for 1941</span></div>
   <div class="f-nar tiny" style="font-size:8px;letter-spacing:.1em">Chains fitted free · Lorenzo Motors, Queens</div></div>
 </div></div>`,
cat:`<div class="ad" aria-hidden="true"><div class="dbl-in" style="display:flex;gap:6px;align-items:center;padding:5px 8px">${SVG.cat}
  <div style="flex:1"><div class="f-anton" style="font-size:19px;line-height:1">Lost: Walnut Cat</div>
  <div class="f-ser" style="font-size:10.5px;line-height:1.15"><i>Small, hand-carved, answers to nothing. Last seen beside a wooden violin.</i></div>
  <div class="f-nar tiny" style="margin-top:2px">Reward · Inquire across the hall</div></div></div></div>`,
lessons:`<div class="ad" aria-hidden="true"><div class="dbl-in" style="display:flex;gap:8px;align-items:center;padding:5px 8px">${SVG.violin}
  <div style="flex:1" class="c"><div class="f-nar tiny">Vermont · Village Church</div>
  <div class="f-black" style="font-size:18px;line-height:1">VIOLIN<br>LESSONS</div>
  <div class="f-ser" style="font-size:10.5px;line-height:1.15"><i>for children. Saturdays.<br>Pay what you can.</i></div></div></div></div>`
};
const PLACEMENT = [
  [3, 1, 0,  'radio',   1],  // 3면 2단 맨 위
  [3, 0, 99, 'help',    1],  // 3면 1단 맨 아래
  [3, 3, 99, 'magi',    1],  // 3면 4단 맨 아래
  [3, 5, 7,  'pers',    1],  // 3면 6단 가운데
  [3, 2, 99, 'note',    2],  // 창이 길 때만
  [3, 4, 5,  'canele',  2],  // 창이 길 때만
  [4, 3, 99, 'car',     1],  // 4면 4단 맨 아래
  [4, 1, 5,  'cat',     2],  // 창이 길 때만
  [4, 0, 99, 'lessons', 2],  // 창이 길 때만
];
for (const [pg, ci, idx, name, pr] of PLACEMENT){
  const col = document.querySelectorAll(`#page-${pg} > .col`)[ci];
  if (!col || !AD[name]) continue;
  const t = document.createElement('div'); t.innerHTML = AD[name].trim();
  const el = t.firstChild; el.dataset.pr = pr; el.style.setProperty('--mt', '12px');
  const k = col.children; idx >= k.length ? col.appendChild(el) : col.insertBefore(el, k[idx]);
}
