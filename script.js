const audio = new Audio();
let audioCtx, analyser, source;
let playlist = [];
let currentIndex = 0;

// DOM
const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const trackName = document.getElementById("trackName");

// Load playlist
fetch("playlist.json")
  .then(res => res.json())
  .then(data => {
    playlist = data;
    loadTrack(0);
  });

function loadTrack(index) {
  if (playlist.length === 0) return;
  currentIndex = index % playlist.length;
  audio.src = playlist[currentIndex].src;
  trackName.textContent = "Track: " + playlist[currentIndex].name;
}

// Init audio context
function setupAudioContext() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  source = audioCtx.createMediaElementSource(audio);
  source.connect(audioCtx.destination);
}

// Play/pause
playBtn.onclick = () => {
  setupAudioContext();
  audioCtx.resume();
  if (audio.paused) {
    audio.play().catch(err => console.error("Playback failed:", err));
    playBtn.textContent = "⏸";
  } else {
    audio.pause();
    playBtn.textContent = "▶️";
  }
};

// Next
nextBtn.onclick = () => {
  const nextIndex = (currentIndex + 1) % playlist.length;
  loadTrack(nextIndex);
  audio.load();  // 🔥 This line is the fix
  audio.play().catch(err => console.error("Playback error:", err));
  playBtn.textContent = "⏸";
};


// Previous
prevBtn.onclick = () => {
  const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(prevIndex);
  audio.load();
  audio.play().catch(err => console.error("Playback error:", err));
  playBtn.textContent = "⏸";
};


// On track end
audio.onended = () => {
  nextBtn.click();
};

// Drag
const player = document.getElementById("playerWindow");
const titleBar = document.getElementById("titleBar");
let offsetX, offsetY, isDragging = false;

titleBar.addEventListener("mousedown", e => {
  isDragging = true;
  offsetX = e.clientX - player.offsetLeft;
  offsetY = e.clientY - player.offsetTop;
});
document.addEventListener("mouseup", () => isDragging = false);
document.addEventListener("mousemove", e => {
  if (isDragging) {
    player.style.left = `${e.clientX - offsetX}px`;
    player.style.top = `${e.clientY - offsetY}px`;
  }
});

// Window controls
document.getElementById("btnMinimize").onclick = () => player.style.display = "none";
document.getElementById("btnClose").onclick = () => {
  audio.pause();
  player.style.display = "none";
};
document.getElementById("btnMaximize").onclick = () => {
  if (player.style.width !== "100vw") {
    player.style.width = "100vw";
    player.style.height = "100vh";
    player.style.top = "0";
    player.style.left = "0";
  } else {
    player.style.width = "320px";
    player.style.height = "auto";
    player.style.top = "100px";
    player.style.left = "100px";
  }
};
