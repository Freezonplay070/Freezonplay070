/* RadioFree — простий фронтенд-плеєр з плейлистами та (опційно) лайв-стрімом */
const $ = s => document.querySelector(s);
const listEl = $("#list");
const player = $("#player");
const nowTitle = $("#nowTitle");
const nowPlaylist = $("#nowPlaylist");
const playBtn = $("#playBtn");
const prevBtn = $("#prevBtn");
const nextBtn = $("#nextBtn");
const shuffleBtn = $("#shuffleBtn");
const seek = $("#seek");
const vol = $("#vol");

let CONFIG = null;
let currentPlaylist = null;
let currentIndex = 0;
let shuffled = false;
let order = [];
let seekDragging = false;

async function loadConfig(){
  const res = await fetch('config/playlists.json?ts=' + Date.now());
  CONFIG = await res.json();
  if (CONFIG?.site?.name) {
    document.title = CONFIG.site.name + " — безкоштовний сайт-радіо";
    document.querySelector('.brand .name').textContent = CONFIG.site.name;
    document.documentElement.style.setProperty('--brand', CONFIG.site.brandColor || '#0ecb68');
    document.documentElement.style.setProperty('--accent', CONFIG.site.accentColor || '#ff7a17');
  }
  renderPlaylists(CONFIG.playlists || []);
}

function renderPlaylists(arr){
  listEl.innerHTML = '';
  arr.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    const cover = document.createElement('div');
    cover.className = 'cover';
    cover.style.background = p.color || '#0ecb68';
    if (p.cover) {
      const img = document.createElement('img');
      img.src = p.cover;
      img.alt = p.title;
      img.className = 'cover';
      img.onerror = () => { img.remove(); };
      card.appendChild(img);
    } else {
      card.appendChild(cover);
    }
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = p.title;
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const btnPlay = document.createElement('button');
    btnPlay.className = 'btn primary';
    btnPlay.textContent = '▶️ Слухати';
    btnPlay.onclick = () => startPlaylist(p);
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.style.background = p.color || 'var(--brand)';
    badge.textContent = p.type === 'stream' ? 'LIVE' : 'PLAYLIST';
    actions.appendChild(btnPlay);
    actions.appendChild(badge);
    card.appendChild(title);
    card.appendChild(actions);
    listEl.appendChild(card);
  });
}

function startPlaylist(p){
  currentPlaylist = p;
  currentIndex = 0;
  order = [...Array(getTrackCount()).keys()];
  if (shuffled) shuffle(order);
  playCurrent();
}

function getTrackCount(){
  if (!currentPlaylist) return 0;
  if (currentPlaylist.type === 'stream') return 1;
  return currentPlaylist.tracks?.length || 0;
}

function getCurrentTrack(){
  if (!currentPlaylist) return null;
  if (currentPlaylist.type === 'stream'){
    return { title: currentPlaylist.title, artist: 'Live', src: currentPlaylist.streamUrl };
  }
  const idx = order[currentIndex] ?? 0;
  return currentPlaylist.tracks[idx];
}

function playCurrent(){
  const tr = getCurrentTrack();
  if (!tr) return;

  if (currentPlaylist.type === 'stream'){
    player.src = tr.src;
  } else {
    player.src = tr.src;
  }
  nowTitle.textContent = `${tr.title}${tr.artist ? " — " + tr.artist : ""}`;
  nowPlaylist.textContent = currentPlaylist.title;
  player.play().catch(() => {
    // Автовідтворення заблоковано — користувач натисне ▶️
  });
}

function next(){
  if (!currentPlaylist) return;
  if (currentPlaylist.type === 'stream'){ player.currentTime = 0; player.play(); return; }
  currentIndex = (currentIndex + 1) % getTrackCount();
  playCurrent();
}
function prev(){
  if (!currentPlaylist) return;
  if (currentPlaylist.type === 'stream'){ player.currentTime = 0; player.play(); return; }
  currentIndex = (currentIndex - 1 + getTrackCount()) % getTrackCount();
  playCurrent();
}
function togglePlay(){
  if (player.paused) player.play(); else player.pause();
}
function toggleShuffle(){
  shuffled = !shuffled;
  shuffleBtn.style.opacity = shuffled ? '1' : '.6';
  if (!currentPlaylist) return;
  order = [...Array(getTrackCount()).keys()];
  if (shuffled) shuffle(order);
}
function shuffle(a){
  for (let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
}

player.addEventListener('ended', next);
player.addEventListener('timeupdate', () => {
  if (seekDragging) return;
  if (!player.duration) return;
  seek.value = Math.floor((player.currentTime / player.duration) * 100) || 0;
});
seek.addEventListener('input', () => {
  seekDragging = true;
});
seek.addEventListener('change', () => {
  if (player.duration){
    const p = Number(seek.value)/100;
    player.currentTime = p * player.duration;
  }
  seekDragging = false;
});
vol.addEventListener('input', () => { player.volume = Number(vol.value); });

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', next);
prevBtn.addEventListener('click', prev);
shuffleBtn.addEventListener('click', toggleShuffle);

loadConfig();
