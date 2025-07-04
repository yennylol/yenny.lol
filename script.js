document.addEventListener("DOMContentLoaded", () => {
  // --- Audio Player Setup ---
  const audio = new Audio();
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const playBtn = document.getElementById("play");
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  const trackName = document.getElementById("trackName");
  let audioCtx, analyser, source;
  let playlist = [];
  let currentIndex = 0;
  

  // TASKBAR FUNCTIONALITY

  const taskbarButtons = document.querySelectorAll(".taskbar-btn");
  const volumeSlider = document.getElementById("volumeSlider");
  const taskbarTime = document.getElementById("taskbar-time");

  // Update time every second
  function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    taskbarTime.textContent = `${hours}:${minutes}`;
  }
  updateTime();
  setInterval(updateTime, 1000);

  // Volume slider controls the audio volume
  volumeSlider.value = audio.volume; // initialize slider to current audio volume
  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });

  // Toggle windows open/close when clicking taskbar icons
  taskbarButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const winId = btn.getAttribute("data-window");
      const win = document.getElementById(winId);
      if (!win) return;
      if (
        win.style.display === "none" ||
        getComputedStyle(win).display === "none"
      ) {
        win.style.display = "block";
        win.style.zIndex = 100; // bring to front
      } else {
        win.style.display = "none";
      }
    });
  });

  // Fetch playlist JSON
  fetch("playlist.json")
    .then((res) => res.json())
    .then((data) => {
      playlist = data;
      loadTrack(0);
    });

  function setupAudioContext() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    source = audioCtx.createMediaElementSource(audio);
    source.connect(audioCtx.destination);
  }

  // Load track with safe index wrapping
  function loadTrack(index) {
    if (playlist.length === 0) return;
    currentIndex =
      ((index % playlist.length) + playlist.length) % playlist.length;
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
    audio.load();
    audio.play().catch(console.error);
    playBtn.textContent = "⏸";
  };

  prevBtn.onclick = () => {
    loadTrack(currentIndex - 1);
    audio.load();
    audio.play().catch(console.error);
    playBtn.textContent = "⏸";
  };

  audio.onended = () => nextBtn.click();

  // Visualizer setup
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
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 25}, ${
          (250 * i) / bufferLength
        }, 50)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }

    renderFrame();
  }

  audio.addEventListener("play", () => {
    if (!analyser) initVisualizer();
  });

  // --- Draggable Windows ---
  function makeDraggable(windowEl, titleBarEl) {
    let isDragging = false,
      offsetX,
      offsetY;

    titleBarEl.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - windowEl.offsetLeft;
      offsetY = e.clientY - windowEl.offsetTop;
    });

    document.addEventListener("mouseup", () => (isDragging = false));

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        windowEl.style.left = `${e.clientX - offsetX}px`;
        windowEl.style.top = `${e.clientY - offsetY}px`;
      }
    });
  }

  makeDraggable(
    document.getElementById("playerWindow"),
    document.getElementById("titleBar")
  );
  makeDraggable(
    document.getElementById("profileWindow"),
    document.getElementById("profileTitleBar")
  );
  makeDraggable(
    document.getElementById("videoWindow"),
    document.getElementById("videoTitleBar")
  );

  // --- Window Controls ---
  function setupWindowControls(
    windowEl,
    btnMin,
    btnMax,
    btnClose,
    defaultSize = {
      width: "320px",
      height: "auto",
      top: "100px",
      left: "100px",
      right: "unset",
      transform: "none",
    }
  ) {
    if (btnMin) btnMin.onclick = () => (windowEl.style.display = "none");
    if (btnClose) btnClose.onclick = () => (windowEl.style.display = "none");

    if (btnMax) {
      btnMax.onclick = () => {
        const isMaximized = windowEl.style.width === "100vw";
        if (!isMaximized) {
          windowEl.style.width = "100vw";
          windowEl.style.height = "100vh";
          windowEl.style.top = "0";
          windowEl.style.left = "0";
          windowEl.style.right = "0";
          windowEl.style.transform = "none";
        } else {
          windowEl.style.width = defaultSize.width;
          windowEl.style.height = defaultSize.height;
          windowEl.style.top = defaultSize.top;
          if (defaultSize.left !== undefined) {
            windowEl.style.left = defaultSize.left;
            windowEl.style.right = "unset";
          }
          if (defaultSize.right !== undefined) {
            windowEl.style.right = defaultSize.right;
            windowEl.style.left = "unset";
          }
          windowEl.style.transform = defaultSize.transform || "none";
        }
      };
    }
  }

  setupWindowControls(
    document.getElementById("playerWindow"),
    document.getElementById("btnMinimize"),
    document.getElementById("btnMaximize"),
    document.getElementById("btnClose"),
    {
      width: "320px",
      height: "auto",
      top: "0",
      left: "unset",
      right: "0",
      transform: "none",
    }
  );

  setupWindowControls(
    document.getElementById("profileWindow"),
    document.getElementById("profileMinimize"),
    document.getElementById("profileMaximize"),
    document.getElementById("profileClose"),
    {
      width: "400px",
      height: "auto",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    }
  );

  setupWindowControls(
    document.getElementById("videoWindow"),
    null,
    null,
    document.getElementById("videoCloseBtn"),
    { width: "360px", height: "auto", top: "0", left: "0", transform: "none" }
  );

  // --- Video Player ---
  const videoPlayer = document.getElementById("videoPlayer");
  const totalClips = 28;
  let currentClip = Math.floor(Math.random() * totalClips) + 1;

  function loadClip(index) {
    currentClip = ((index - 1 + totalClips) % totalClips) + 1;
    videoPlayer.src = `video/clip (${currentClip}).mp4`;
    videoPlayer.load();
    videoPlayer
      .play()
      .catch((e) => console.warn("Autoplay blocked:", e.message));
  }

  videoPlayer.muted = true;
  videoPlayer.autoplay = true;
  videoPlayer.playsInline = true;

  loadClip(currentClip);

  document.getElementById("nextClip").onclick = () => loadClip(currentClip + 1);
  document.getElementById("prevClip").onclick = () => loadClip(currentClip - 1);
});

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const playBtn = document.getElementById("play");

  overlay.addEventListener("click", () => {
    if (playBtn) playBtn.click();

    overlay.classList.add("hidden");

    setTimeout(() => {
      overlay.remove();
    }, 800);
  });
});