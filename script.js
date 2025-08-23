// Params: ?name=&from=&date=&videos=url1,url2 (supports mp4 or YouTube links)
const qs = new URL(location.href).searchParams;
const get = (k, d=null)=> qs.get(k) ?? d;

const friendName = document.getElementById('friendName');
const fromName   = document.getElementById('fromName');
friendName.textContent = get('name', 'Shivani');
fromName.textContent   = get('from', 'Manas');

// Unwrap animation
const wrapper = document.querySelector('.wrapper');
const btn = document.querySelector('.openBtn');
btn.addEventListener('click', ()=>{
  wrapper.classList.add('unwrapped');
  setTimeout(()=>{
    document.getElementById('reveal').scrollIntoView({behavior:'smooth', block:'center'});
  }, 650);
});

// Countdown
const ctn = document.getElementById('countdown');
const dEl = document.getElementById('d'), hEl = document.getElementById('h'),
      mEl = document.getElementById('m'), sEl = document.getElementById('s');
const date = get('date');
if(date){
  ctn.classList.remove('hide');
  const target = new Date(date + 'T00:00:00');
  const tick = ()=>{
    const now = new Date();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff/86400000); diff -= d*86400000;
    const h = Math.floor(diff/3600000); diff -= h*3600000;
    const m = Math.floor(diff/60000);   diff -= m*60000;
    const s = Math.floor(diff/1000);
    dEl.textContent=String(d).padStart(2,'0');
    hEl.textContent=String(h).padStart(2,'0');
    mEl.textContent=String(m).padStart(2,'0');
    sEl.textContent=String(s).padStart(2,'0');
  };
  tick(); setInterval(tick, 1000);
}

// Chocolate grid reveal
document.getElementById('grid').addEventListener('click', (e)=>{
  if(!e.target.classList.contains('tile')) return;
  const msg = e.target.getAttribute('data-msg');
  e.target.classList.add('revealed');
  e.target.textContent = msg;
});

// Videos
const player = document.getElementById('player');
const playlist = document.getElementById('playlist');

function parseVideos(){
  const raw = get('videos');
  if(!raw){
    // default bundle (local assets)
    return [
      {title:'Birthday Message', url:'assets/video1.mp4', type:'mp4'},
      {title:'Memory Reel', url:'assets/video2.mp4', type:'mp4'}
    ];
  }
  return raw.split(',').map((u, i)=>{
    u = u.trim();
    const youTube = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([\\w-]+)/i.exec(u);
    if(youTube) return {title:'Video '+(i+1), url:'https://www.youtube.com/embed/'+youTube[1], type:'yt'};
    return {title:'Video '+(i+1), url:u, type: u.endsWith('.mp4') ? 'mp4' : 'url'};
  });
}

const videos = parseVideos();
function loadVideo(v){
  if(v.type === 'yt'){
    // swap to iframe for youtube
    const ifr = document.createElement('iframe');
    ifr.width = '100%';
    ifr.height = '360';
    ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    ifr.allowFullscreen = true;
    ifr.src = v.url + '?rel=0';
    player.replaceWith(ifr);
  }else{
    // ensure we have a video element (if previously swapped)
    if(!(player instanceof HTMLVideoElement)){
      const newPlayer = document.createElement('video');
      newPlayer.id = 'player'; newPlayer.controls = true; newPlayer.playsInline = true;
      player.parentNode.replaceChild(newPlayer, player);
    }
    const el = document.getElementById('player');
    el.src = v.url; el.play().catch(()=>{});
  }
}

if (playlist) {
  videos.forEach((v, i)=>{
    const b = document.createElement('button');
    b.textContent = v.title;
    b.addEventListener('click', ()=> loadVideo(v));
    playlist.appendChild(b);
    if(i===0) loadVideo(v);
  });
} else {
  // If a custom ?videos= is provided but no #playlist exists,
  // still ensure the first video loads.
  if (videos.length && get('videos')) {
    loadVideo(videos[0]);
  }
}

// Share
document.getElementById('shareBtn')?.addEventListener('click', async ()=>{
  const shareUrl = location.href;
  try{
    if(navigator.share){ await navigator.share({title: document.title, text:'Open your sweet surprise 🍫', url: shareUrl}); }
    else { await navigator.clipboard.writeText(shareUrl); alert('Link copied ✅'); }
  }catch(e){}
});

// Memory Unlock feature (accept minor variations like spaces/case)
const memoryBtn = document.getElementById("memoryBtn");
const memoryInput = document.getElementById("memoryInput");
const memorySecret = document.getElementById("memorySecret");

function normalize(s){
  return (s || "").toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
}

function tryUnlock(){
  if (!memoryInput || !memorySecret) return;
  const answerRaw = memoryInput.value;
  const expected = normalize("pastry corner"); // customize here
  if (normalize(answerRaw) === expected) {
    memorySecret.classList.remove("hide");
  } else {
    alert("Nope, try again 😉");
  }
}

if (memoryBtn) {
  memoryBtn.addEventListener("click", tryUnlock);
}
if (memoryInput) {
  memoryInput.addEventListener("keydown", (e)=>{
    if (e.key === "Enter") tryUnlock();
  });
}