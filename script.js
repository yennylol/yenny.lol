document.addEventListener("DOMContentLoaded", () => {
  const audio = new Audio();
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const playBtn = document.getElementById("play");
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  const trackName = document.getElementById("trackName");
  const videoPlayer = document.getElementById("videoPlayer");
  const muteVideoBtn = document.getElementById("muteVideoBtn");
  const taskbarButtons = document.querySelectorAll(".taskbar-btn");
  const volumeSlider = document.getElementById("volumeSlider");
  const taskbarTime = document.getElementById("taskbar-time");

  let audioCtx, analyser, source;
  let playlist = [];
  let currentIndex = 0;
  let currentClip = Math.floor(Math.random() * 28) + 1;

    // --- Internet Explorer Fake Browser ---
  const browserWindow = document.getElementById("browserWindow");
  const browserFrame = document.getElementById("browserFrame");
  const urlInput = document.getElementById("urlInput");
  const goBtn = document.getElementById("goBtn");
  const backBtn = document.getElementById("backBtn");
  const forwardBtn = document.getElementById("forwardBtn");
  const browserCloseBtn = document.getElementById("browserCloseBtn");

  let historyStack = [];
  let currentHistoryIndex = -1;

  function navigateTo(url) {
    if (!url.startsWith("http")) url = "https://" + url;
    browserFrame.src = url;
    historyStack = historyStack.slice(0, currentHistoryIndex + 1);
    historyStack.push(url);
    currentHistoryIndex++;
    urlInput.value = url;
  }

  goBtn.onclick = () => navigateTo(urlInput.value);
  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") goBtn.click();
  });

  backBtn.onclick = () => {
    if (currentHistoryIndex > 0) {
      currentHistoryIndex--;
      browserFrame.src = historyStack[currentHistoryIndex];
      urlInput.value = historyStack[currentHistoryIndex];
    }
  };

  forwardBtn.onclick = () => {
    if (currentHistoryIndex < historyStack.length - 1) {
      currentHistoryIndex++;
      browserFrame.src = historyStack[currentHistoryIndex];
      urlInput.value = historyStack[currentHistoryIndex];
    }
  };

  browserCloseBtn.onclick = () => browserWindow.style.display = "none";

  makeDraggable(browserWindow, document.getElementById("browserTitleBar"));


  function updateTime() {
    const now = new Date();
    taskbarTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  updateTime();
  setInterval(updateTime, 1000);

  volumeSlider.value = audio.volume;
  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });

  taskbarButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const win = document.getElementById(btn.dataset.window);
      if (!win) return;
      win.style.display = win.style.display === "none" ? "block" : "none";
      win.style.zIndex = 100;
    });
  });

  fetch("playlist.json")
    .then(res => res.json())
    .then(data => {
      playlist = shuffleArray(data);
      loadTrack(0);
    });

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function setupAudioContext() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    source = audioCtx.createMediaElementSource(audio);
    source.connect(audioCtx.destination);
  }

  function loadTrack(index) {
    if (!playlist.length) return;
    currentIndex = ((index % playlist.length) + playlist.length) % playlist.length;
    audio.src = playlist[currentIndex].src;
    trackName.textContent = "Track: " + playlist[currentIndex].name;
  }

  playBtn.onclick = () => {
    setupAudioContext();
    audioCtx.resume();
    if (audio.paused) {
      audio.play().catch(console.error);
      playBtn.textContent = "⏸";
    } else {
      audio.pause();
      playBtn.textContent = "▶️";
    }
  };

  nextBtn.onclick = () => {
    loadTrack(currentIndex + 1);
    audio.play().catch(console.error);
    playBtn.textContent = "⏸";
  };

  prevBtn.onclick = () => {
    loadTrack(currentIndex - 1);
    audio.play().catch(console.error);
    playBtn.textContent = "⏸";
  };

  audio.onended = () => nextBtn.click();

  function initVisualizer() {
    setupAudioContext();
    analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function renderFrame() {
      requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 25}, ${(250 * i) / bufferLength}, 50)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }

    renderFrame();
  }

  audio.addEventListener("play", () => {
    if (!analyser) initVisualizer();
  });

  function makeDraggable(windowEl, titleBarEl) {
    let isDragging = false, offsetX, offsetY;
    titleBarEl.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - windowEl.offsetLeft;
      offsetY = e.clientY - windowEl.offsetTop;
    });
    document.addEventListener("mouseup", () => isDragging = false);
    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        windowEl.style.left = `${e.clientX - offsetX}px`;
        windowEl.style.top = `${e.clientY - offsetY}px`;
      }
    });
  }

  function setupWindowControls(win, minBtn, maxBtn, closeBtn, defaultSize) {
    if (minBtn) minBtn.onclick = () => win.style.display = "none";
    if (closeBtn) closeBtn.onclick = () => win.style.display = "none";
    if (maxBtn) {
      maxBtn.onclick = () => {
        const isMax = win.style.width === "100vw";
        if (!isMax) {
          win.style.width = "100vw";
          win.style.height = "100vh";
          win.style.top = "0";
          win.style.left = "0";
          win.style.right = "0";
          win.style.transform = "none";
        } else {
          Object.assign(win.style, defaultSize);
        }
      };
    }
  }

  makeDraggable(document.getElementById("playerWindow"), document.getElementById("titleBar"));
  makeDraggable(document.getElementById("profileWindow"), document.getElementById("profileTitleBar"));
  makeDraggable(document.getElementById("videoWindow"), document.getElementById("videoTitleBar"));

  setupWindowControls(
    document.getElementById("playerWindow"),
    document.getElementById("btnMinimize"),
    document.getElementById("btnMaximize"),
    document.getElementById("btnClose"),
    { width: "320px", height: "auto", top: "0", left: "unset", right: "0", transform: "none" }
  );

  setupWindowControls(
    document.getElementById("profileWindow"),
    document.getElementById("profileMinimize"),
    document.getElementById("profileMaximize"),
    document.getElementById("profileClose"),
    { width: "400px", height: "auto", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
  );

  setupWindowControls(
    document.getElementById("videoWindow"),
    null,
    null,
    document.getElementById("videoCloseBtn"),
    { width: "360px", height: "auto", top: "0", left: "0", transform: "none" }
  );
  setupWindowControls(
  document.getElementById("browserWindow"),
  document.getElementById("browserMinimize"),
  document.getElementById("browserMaximize"),
  document.getElementById("browserCloseBtn"),
  {
    width: "480px",
    height: "auto",
    top: "unset",
    bottom: "40px",
    left: "0",
    transform: "none",
  }
);


  // Video Player Logic
  function loadClip(index) {
    currentClip = ((index - 1 + 28) % 28) + 1;
    videoPlayer.src = `video/clip (${currentClip}).mp4`;
    videoPlayer.load();
    videoPlayer.play().catch(console.warn);
  }

  loadClip(currentClip);

  document.getElementById("nextClip").onclick = () => loadClip(currentClip + 1);
  document.getElementById("prevClip").onclick = () => loadClip(currentClip - 1);

  muteVideoBtn.onclick = () => {
    videoPlayer.muted = !videoPlayer.muted;
    muteVideoBtn.textContent = videoPlayer.muted ? "🔇" : "🔊";
  };

  // Overlay to trigger audio
  const overlay = document.getElementById("overlay");
  overlay.addEventListener("click", () => {
    playBtn.click();
    overlay.classList.add("hidden");
    setTimeout(() => overlay.remove(), 800);
  });
});
