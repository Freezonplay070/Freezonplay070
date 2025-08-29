// solevoyqRadio v3 — categories on homepage + global player
const $ = s => document.querySelector(s);
const sectionsEl = $("#sections");
const searchEl = $("#search");
const audio = $("#audio");
const btnPrev = $("#btnPrev");
const btnPlay = $("#btnPlay");
const btnNext = $("#btnNext");
const btnRepeat = $("#btnRepeat");
const btnShuffle = $("#btnShuffle");
const btnLike = $("#btnLike");
const seek = $("#seek");
const tCur = $("#tCur");
const tAll = $("#tAll");
const vol = $("#vol");
const pTitle = $("#pTitle");
const pArtist = $("#pArtist");
const pCover = $("#pCover");
const bars = $("#bars");

let CFG = null;
let current = { playlistId: null, index: -1, order: [], repeat: 'off', shuffle: false };
let likes = new Set(JSON.parse(localStorage.getItem('likes') || '[]'));

async function boot(){
  const res = await fetch('config/playlists.json?ts=' + Date.now());
  CFG = await res.json();
  document.title = CFG.site?.name || 'solevoyqRadio';
  renderSections(CFG.playlists || []);
  vol.value = 0.8; audio.volume = 0.8;
}
function renderSections(pls){
  sectionsEl.innerHTML = '';
  pls.forEach(pl => {
    const wrap = document.createElement('section');
    const head = document.createElement('div');
    head.className = 'section-header';
    const title = document.createElement('div');
    title.className = 'section-title';
    title.textContent = pl.title;
    const playAll = document.createElement('button');
    playAll.className = 'playall';
    playAll.textContent = 'Play All';
    playAll.onclick = () => startPlaylist(pl.id, 0);
    head.appendChild(title); head.appendChild(playAll);
    wrap.appendChild(head);
    const grid = document.createElement('div');
    grid.className = 'tracks';
    (pl.tracks || []).forEach((tr, i) => {
      const card = document.createElement('div');
      card.className = 'track'; card.dataset.pid = pl.id; card.dataset.idx = i;
      const cover = document.createElement('div'); cover.className = 'cover';
      const img = document.createElement('img'); img.src = tr.cover || pl.cover; img.alt = tr.title;
      img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover';
      cover.appendChild(img);
      const meta = document.createElement('div'); meta.className = 'meta';
      const t1 = document.createElement('div'); t1.className = 't1'; t1.textContent = tr.title;
      const t2 = document.createElement('div'); t2.className = 't2'; t2.textContent = tr.artist;
      meta.appendChild(t1); meta.appendChild(t2);
      const actions = document.createElement('div'); actions.className = 'actions';
      const playBtn = document.createElement('button'); playBtn.className = 'icon-btn'; playBtn.textContent = '▶️';
      playBtn.onclick = (e) => { e.stopPropagation(); startPlaylist(pl.id, i); };
      const likeBtn = document.createElement('button'); likeBtn.className = 'icon-btn'; likeBtn.textContent = '❤️';
      likeBtn.onclick = (e) => { e.stopPropagation(); toggleLike(tr.id, likeBtn); };
      updateLikeBtn(tr.id, likeBtn);
      actions.appendChild(playBtn); actions.appendChild(likeBtn);
      card.appendChild(cover); card.appendChild(meta); card.appendChild(actions);
      card.onclick = () => startPlaylist(pl.id, i);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    sectionsEl.appendChild(wrap);
  });
}
function startPlaylist(playlistId, index){
  const pl = CFG.playlists.find(p => p.id === playlistId);
  if (!pl) return;
  current.playlistId = playlistId;
  current.index = index;
  current.order = [...Array(pl.tracks.length).keys()];
  if (current.shuffle) shuffle(current.order);
  playCurrent();
  // highlight current card
  highlightCurrentCard();
}
function getCurrentTrack(){
  const pl = CFG.playlists.find(p => p.id === current.playlistId);
  if (!pl) return null;
  const idx = current.order[current.index] ?? 0;
  return { tr: pl.tracks[idx], pl };
}
function playCurrent(){
  const cur = getCurrentTrack();
  if (!cur) return;
  audio.src = cur.tr.src;
  pTitle.textContent = cur.tr.title;
  pArtist.textContent = cur.tr.artist + ' • ' + (cur.pl.title || '');
  pCover.src = cur.tr.cover || cur.pl.cover;
  bars.classList.remove('hidden');
  audio.play().then(()=>{ btnPlay.textContent = '⏸'; }).catch(()=>{});
  updateLikeBtn(cur.tr.id, btnLike);
  highlightCurrentCard();
}
function next(){
  const pl = CFG.playlists.find(p => p.id === current.playlistId);
  if (!pl) return;
  if (current.repeat === 'one') return playCurrent();
  current.index = (current.index + 1) % pl.tracks.length;
  playCurrent();
}
function prev(){
  const pl = CFG.playlists.find(p => p.id === current.playlistId);
  if (!pl) return;
  if (audio.currentTime > 3){ audio.currentTime = 0; return; }
  current.index = (current.index - 1 + pl.tracks.length) % pl.tracks.length;
  playCurrent();
}
function togglePlay(){ if (audio.paused){ audio.play(); btnPlay.textContent='⏸'; } else { audio.pause(); btnPlay.textContent='▶️'; } }
function toggleShuffle(){
  current.shuffle = !current.shuffle;
  btnShuffle.classList.toggle('active', current.shuffle);
  const pl = CFG.playlists.find(p => p.id === current.playlistId);
  if (!pl) return;
  const curTrackIndex = current.order[current.index];
  current.order = [...Array(pl.tracks.length).keys()];
  if (current.shuffle) shuffle(current.order);
  current.index = current.order.indexOf(curTrackIndex);
}
function cycleRepeat(){
  const states = ['off','all','one'];
  const i = states.indexOf(current.repeat);
  current.repeat = states[(i+1)%states.length];
  btnRepeat.textContent = current.repeat==='one'?'🔁·1': (current.repeat==='all'?'🔁':'⟳');
  btnRepeat.classList.toggle('active', current.repeat!=='off');
}
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } }
function fmt(t){ if(!isFinite(t)) return '0:00'; t = Math.max(0, Math.floor(t)); const m = Math.floor(t/60), s = String(t%60).padStart(2,'0'); return `${m}:${s}`; }

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  seek.value = Math.floor((audio.currentTime / audio.duration)*100);
  tCur.textContent = fmt(audio.currentTime);
  tAll.textContent = fmt(audio.duration);
});
audio.addEventListener('ended', () => {
  if (current.repeat === 'one') { audio.currentTime = 0; audio.play(); return; }
  next();
});
seek.addEventListener('input', () => {
  if (!audio.duration) return;
  const p = Number(seek.value)/100;
  audio.currentTime = p * audio.duration;
});
vol.addEventListener('input', () => audio.volume = Number(vol.value));

btnPrev.addEventListener('click', prev);
btnPlay.addEventListener('click', togglePlay);
btnNext.addEventListener('click', next);
btnShuffle.addEventListener('click', toggleShuffle);
btnRepeat.addEventListener('click', cycleRepeat);

function toggleLike(id, el){
  if (likes.has(id)) likes.delete(id); else likes.add(id);
  localStorage.setItem('likes', JSON.stringify([...likes]));
  updateLikeBtn(id, el);
  if (btnLike) updateLikeBtn(id, btnLike);
}
function updateLikeBtn(id, el){
  if (!el) return;
  const on = likes.has(id);
  el.classList.toggle('active', on);
}
function highlightCurrentCard(){
  // clear previous
  document.querySelectorAll('.track.curr').forEach(e => e.classList.remove('curr'));
  const cur = getCurrentTrack();
  if (!cur) return;
  const sel = `.track[data-pid="${current.playlistId}"][data-idx="${current.order[current.index]}"]`;
  const el = document.querySelector(sel);
  if (el) el.classList.add('curr');
}

searchEl?.addEventListener('input', () => {
  const q = searchEl.value.trim().toLowerCase();
  document.querySelectorAll('.track').forEach(el => {
    const title = el.querySelector('.t1')?.textContent.toLowerCase() || '';
    const artist = el.querySelector('.t2')?.textContent.toLowerCase() || '';
    el.style.display = (title.includes(q) || artist.includes(q)) ? '' : 'none';
  });
});

boot();
