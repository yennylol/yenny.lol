document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("background-video");
  const volumeSlider = document.getElementById("volume-slider");

  volumeSlider.addEventListener("input", function () {
    video.volume = volumeSlider.value;
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector("video");

  // Pause the video initially
  video.pause();

  // Wait for user interaction to play
  document.addEventListener("click", () => {
      video.play();
  }, { once: true }); // Ensures it runs only once
});
