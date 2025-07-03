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
const profileTitleBar = document.getElementById("profileTitleBar");
let pOffsetX, pOffsetY, pDragging = false;

profileTitleBar.addEventListener("mousedown", e => {
  pDragging = true;
  const rect = profileWindow.getBoundingClientRect();
  pOffsetX = e.clientX - rect.left;
  pOffsetY = e.clientY - rect.top;
});

document.addEventListener("mouseup", () => pDragging = false);

document.addEventListener("mousemove", e => {
  if (pDragging) {
    profileWindow.style.top = `${e.clientY - pOffsetY}px`;
    profileWindow.style.left = `${e.clientX - pOffsetX}px`;
    profileWindow.style.transform = "none";
    profileWindow.style.position = "fixed";
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

// Visualizer Setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;


window.addEventListener("resize", () => {
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
});

function initVisualizer() {
  if (!audioCtx) setupAudioContext(); // reuse existing context

  analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 256;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const barWidth = (WIDTH / bufferLength) * 2.5;

  function renderFrame() {
    requestAnimationFrame(renderFrame);
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      const r = barHeight + 25 * (i / bufferLength);
      const g = 250 * (i / bufferLength);
      const b = 50;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }

  renderFrame();
}

// Start visualizer on first play
audio.addEventListener("play", () => {
  if (!analyser) initVisualizer();
});

const profileWindow = document.getElementById("profileWindow");
const profileMinimize = document.getElementById("profileMinimize");
const profileMaximize = document.getElementById("profileMaximize");
const profileClose = document.getElementById("profileClose");

profileMinimize.onclick = () => profileWindow.style.display = "none";
profileClose.onclick = () => profileWindow.style.display = "none";

profileMaximize.onclick = () => {
  if (profileWindow.style.width !== "100vw") {
    profileWindow.style.width = "100vw";
    profileWindow.style.height = "100vh";
    profileWindow.style.top = "0";
    profileWindow.style.left = "0";
    profileWindow.style.transform = "none";
  } else {
    profileWindow.style.width = "400px";
    profileWindow.style.height = "auto";
    profileWindow.style.top = "50%";
    profileWindow.style.left = "50%";
    profileWindow.style.transform = "translate(-50%, -50%)";
  }
};
