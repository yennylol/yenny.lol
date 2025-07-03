// --- AUDIO SETUP ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 128;

const audio = new Audio();
const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);

const playlist = [
  { name: "Track 1", src: "audio/track1.mp3" },
  { name: "Track 2", src: "audio/track2.mp3" }
];

let currentIndex = 0;
let isLoop = false;
let isShuffle = false;

const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const loopBtn = document.getElementById("loop");
const shuffleBtn = document.getElementById("shuffle");
const trackName = document.getElementById("trackName");

function loadTrack(index) {
  currentIndex = index;
  audio.src = playlist[index].src;
  trackName.textContent = "Track: " + playlist[index].name;
  audio.play();
  audioCtx.resume();
  playBtn.textContent = "⏸";
}

function nextTrack() {
  if (isShuffle) {
    loadTrack(Math.floor(Math.random() * playlist.length));
  } else {
    loadTrack((currentIndex + 1) % playlist.length);
  }
}

audio.onended = () => {
  if (isLoop) {
    loadTrack(currentIndex);
  } else {
    nextTrack();
  }
};

playBtn.onclick = () => {
  if (audio.paused) {
    audio.play(); audioCtx.resume();
    playBtn.textContent = "⏸";
  } else {
    audio.pause();
    playBtn.textContent = "▶️";
  }
};

nextBtn.onclick = nextTrack;
prevBtn.onclick = () => {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentIndex);
};

loopBtn.onclick = () => {
  isLoop = !isLoop;
  loopBtn.style.background = isLoop ? "#8f8" : "";
};

shuffleBtn.onclick = () => {
  isShuffle = !isShuffle;
  shuffleBtn.style.background = isShuffle ? "#8f8" : "";
};

loadTrack(currentIndex);

// --- VISUALIZER ---
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
const dataArray = new Uint8Array(analyser.frequencyBinCount);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

function draw() {
  requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const barWidth = canvas.width / dataArray.length;
  for (let i = 0; i < dataArray.length; i++) {
    const h = dataArray[i] * 2;
    ctx.fillStyle = `rgb(${h},${100 + i*2},${255 - i*2})`;
    ctx.fillRect(i * barWidth, canvas.height - h, barWidth - 2, h);
  }
}

draw();

// --- DRAGGABLE WINDOW ---
const player = document.getElementById("playerWindow");
const titleBar = document.getElementById("titleBar");
let offsetX = 0, offsetY = 0, isDragging = false;

titleBar.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - player.offsetLeft;
  offsetY = e.clientY - player.offsetTop;
});

document.addEventListener("mouseup", () => isDragging = false);
document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    player.style.left = (e.clientX - offsetX) + "px";
    player.style.top = (e.clientY - offsetY) + "px";
  }
});
