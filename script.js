document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("background-video");
  const volumeSlider = document.getElementById("volume-slider");

  volumeSlider.addEventListener("input", function () {
    video.volume = volumeSlider.value;
  });
});
