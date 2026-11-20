# MARIA PARK × VITTORIO — 고정 눈 배경 버전 (v4)

- 기준: 사용자가 보내준 `mv-main.zip`의 화면 채우기 및 모바일 이동 방식.
- 배경: 사용자가 제공한 눈 포함 원본 `2(1).png` 합성본. PSD의 나누기(Divide) 및 다른 필름/눈 합성 효과가 이미 픽셀로 반영되어 있음.
- 눈 **애니메이션 없음**.
- 이름 링크, 인물 링크 총 4개. `script.js`의 `LINKS`에서 편집.
- 마리아 인물 호버는 아래→위, 비토리오 인물 호버는 위→아래 (원본 클리핑 아트와 Difference).
- 이름은 마리아 왼→오, 비토리오 오→왼 빨간색 와이프.
- 연대기는 복제 이미지가 아닌 HTML 텍스트로 표시되므로 마우스 드래그 선택·복사가 가능.
- 모바일은 화면을 채우고 화면 밖 영역을 손가락으로 이동할 수 있음. 추가 메뉴 없음.

## GitHub Pages
ZIP 압축 해제 뒤 `index.html`, `style.css`, `script.js`, `assets/`를 저장소 최상위에 올려주세요.

## 이미지 효과에 관하여
원본 PSD의 나누기 및 다른 합성 효과는 정적 이미지(단일 장면)에 픽셀로 반영되어 보존됩니다. 웹 브라우저에서 움직이는 효과로 다시 계산하는 것은 아닙니다.


## v7: 배치 방법 교체 (mv-main.zip 동일 계산)
- `scale = Math.max(viewport.width/1920, viewport.height/1080)`
- `top: 50%`, `left: 50%`, `transform: translate(-50%, -50%) translateX(panX) scale(scale)`
- `window.outerHeight`, 브라우저 상단바/주소창 추정 계산 완전 삭제.
- 16:9 이외 화면은 가운데서 일부 잘려도 빈 공간 없이 채웁니다.
- 모바일 세로에서만 좌우 이동 허용.
- 주의: 위 식은 뷰포트 중앙정렬이므로 F11 전후 뷰포트 높이가 달라지면 이미지의 표시 좌표도 바뀝니다.
- `assets/hover-vittorio.png`는 2(5).psd에서 교체한 v6의 최신 파일을 유지합니다.


## v8 화면 고정 수정
- 데스크톱 Chrome/Edge의 최대화 창 및 F11 전체화면에서는 현재 모니터의 screen.width / screen.height를 기준으로 동일한 1920×1080 배율을 적용합니다.
- 일반 최대화 창은 window.outerHeight - window.innerHeight 만큼 장면을 위로 올려, 주소창이 이미지 위를 가리도록 합니다.
- `top: 50%`와 `translate(-50%,-50%)`를 폐기해 브라우저 내부 높이에 따른 자동 중앙 재정렬을 방지했습니다.
- 비최대화 창에서는 브라우저 UI 높이만큼 상단을 이동시키며, 모바일은 기존 cover 및 좌우 드래그 동작을 유지합니다.
- 브라우저 API만으로 모든 브라우저/모니터의 창 프레임 크기와 모니터 좌표를 정확히 알 수 없어, 일반 창을 자유롭게 이동하는 환경에서 절대 좌표까지 보장하지는 않습니다.
- 바뀐 파일: index.html, style.css, script.js. 이미지와 호버 효과는 v7 그대로입니다.


## v9 CSS adjustments
- All title and character red wipe transitions: 1.6 s.
- Maria character hover: mix-blend-mode multiply.
- Vittorio character hover: mix-blend-mode screen.
- Existing name title difference blend, layout, links, fixed snow unchanged.


## v10 — 신문 3·4면 (news.html)
- 메인 화면에서 **비토리오 그림 클릭 → news.html** (같은 탭). `script.js`의 `LINKS.vittorioImage`에서 변경.
- 머리 영역(뉴욕타임즈 제호~헤드라인, y 0–457)은 고정, 그 아래 단(column)만 3면 → 4면으로 스크롤(면 단위 스냅).
- 제목 글자: PSD 레이어의 글자 모양을 그대로 마스크로 사용 → 폰트 100% 동일, 색만 CSS로 변경. 위에 투명 텍스트가 겹쳐 있어 드래그·복사 가능.
- 본문: 실제 텍스트(Courier New, 14px / 행간 11.2px), 단어 단위 줄바꿈 + 양쪽 정렬, 마지막 줄 왼쪽.
- 세로 간격: PSD 좌표 그대로. 가로 간격: 좌우 여백 58px + 6단 균등(약 300.7px) + 단 안쪽 여백 21px (`news.css` 맨 위 `--margin`, `--pad`).
- 호버 색: `news.css`의 `--red`.
- 링크: 제목마다 dpla.tistory.com/번호. 바꾸려면 news.html에서 해당 `<a href="…">` 수정.
- 질감: `assets/news/paper-grain.png`(종이), `ink-specks.png`(잉크 빠짐), news.html 상단 SVG `#ink` 필터(글자 번짐).

### 음악 넣기 (news.js 맨 위)
```js
tracks: [
  { youtube: 'https://www.youtube.com/watch?v=영상ID', title: '' },   // title 비우면 영상 제목 자동
  // { file: 'assets/music/song.mp3', title: '곡 이름' },              // 직접 올린 음원
],
```
- 여러 곡 → ⏭ 버튼 생김, 순서대로 재생. `startOnFirstClick: true` → 페이지 첫 클릭 때 자동 재생.
- 유튜브는 GitHub Pages(https)에서 확인하세요. 파일을 더블클릭해 연 `file://` 상태에서는 유튜브가 재생을 막습니다.
- "퍼가기 허용 안 함" 영상(일부 공식 뮤직비디오 등)은 재생되지 않습니다 → 다른 업로드본이나 mp3 사용.

## v11
- 제호 "The New York Times." 로 수정.
- 화면 맞춤: 1920×1080 디자인의 맨 위 87px(주소창 자리)는 보이지 않는 것이 기본. 창이 더 낮으면 위쪽부터 잘리고 아래쪽은 항상 끝까지 보임 (`news.js`의 `ADDRESS_BAR`, `fit()`).
- 호버 빨간색은 링크가 걸린 제목/본문에만 적용.
- 음악: 3r4GNv9b4KQ 연결.

## v12
- news.html: 창 높이에 맞춰 세로 간격을 자동으로 줄여 머리 영역 + 모든 단이 한 화면에 들어감 (작업 표시줄에 안 가림, 면 안쪽 스크롤 없음, 3↔4면 스크롤만).
  간격을 30%까지 줄여도 모자라면 페이지 전체를 축소 (`news.js`의 `MIN_GAP`).
- 3면은 새 PSD(82946968-3.psd) 기준. "We're in America, my man."의 y 잘림 수정.
- index.html: 비토리오 이름·연대기를 화면 아래 가려지는 높이(작업 표시줄)만큼 자동으로 올림. 원래 자리의 이름은 `title-clean-vittorio`로 지우고 `title-white-vittorio.png`를 올린 위치에 표시.

## v13
- 반응형 세로 배치: 주소창·작업 표시줄을 뺀 실제 창 높이에 맞춤. 위·아래 여백(18px, `news.js`의 `PAD`)은 고정, 남는 높이는 단마다 개체 사이 간격으로 나눠서 모든 단이 같은 줄에서 끝남.
- 광고: `news-ads.js`. 맨 아래 `PLACEMENT`에서 면·단·위치·우선순위 설정. 창이 낮으면 우선순위 숫자가 큰 광고부터 자동으로 숨김.
- 재생 바: 처음부터 곡 제목(Solitude) 표시.

## v14
- 링크: 마리아 이름 → 티스토리 VITTORIO 카테고리, 비토리오 이름 → caveduck, 마리아 그림 → 유튜브 재생목록.
- 비토리오 그림 클릭 → "윤전기" 전환: 미리 불러 둔 신문이 아래에서 위로 올라온 뒤 news.html로 이동 (`script.js` 맨 아래, `style.css`의 `.press-sheet`). 속도는 `.press-sheet`의 `1.1s`.

## v15
- 신문 제호 "The New York Times." 클릭 → 메인으로 (신문이 아래로 내려가며 메인이 드러남).
- 비토리오 수첩: 연대기 "Taken in by Silvio Salvatore…"에 마우스를 올리면 빨갛게(difference). 누르면 열리고 한 번 더 누르면 닫힘. 열 때마다 다른 쪽지, 수첩을 누르면 다음 장, 바깥/Esc로도 닫힘. 쪽지 내용·날짜는 `notebook.js` 맨 위 `NOTES`.
- 눈: `snow.js`. PSD 구성 그대로 (배경 + 눈) ÷ 노이즈를 WebGL로 실시간 합성 → 커서 근처 눈송이가 비켜났다 돌아옴. 세기는 `PUSH_RADIUS`, `PUSH_POWER`, `RETURN`.
  새 파일: assets/scene-base.png(눈 없는 배경), scene-noise.png(나누기 노이즈), scene-mask.png(노이즈 마스크). WebGL이 안 되면 scene-static.png(정지 화면) 표시.
- 메인 배경을 PSD(2.psd)에서 다시 합성. 비토리오 이름은 원래 자리에서 빠지고 올린 위치에만 표시 → title-clean-vittorio.png 삭제.

## v17
- 3면 PSD(ce51f169-3.psd) 반영: "We will be very old, we will be very merry." 아랫부분 잘림 수정.
- 음악 교체 (aCi59-y6dNg). 제목은 유튜브에서 자동으로 받아 옴 → 직접 정하려면 news.js의 title: '' 에 입력.

## v18
- 4면 PSD(d3abf335-4.psd) 반영: "I won't let you die. Even if you hate me forever." 잘림 수정.
- 모바일/세로 화면 (폭 900px 미만 또는 세로 방향):
  · news.html: 한 단씩 세로로 쌓이는 신문. 제호·LATE CITY EDITION → 재생 바(위에 고정) → 헤드라인(단어 묶음으로 줄바꿈) → PAGE 3 → PAGE 4 → FIN. 광고는 모두 표시. 제호 누르면 바로 메인으로.
  · index.html: 처음에 마리아 쪽에서 가운데로 천천히 이동 + "← drag →" 안내. (기존처럼 좌우로 끌어서 보기)
  · 헤드라인 모바일용 조각: assets/news/headline-m1~8.png
