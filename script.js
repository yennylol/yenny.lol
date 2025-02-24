document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("background-video");
  const volumeSlider = document.getElementById("volume-slider");

  volumeSlider.addEventListener("input", function () {
    video.volume = parseFloat(volumeSlider.value); // Ensure it's a number
  });

  // Pause the video initially
  video.pause();

  // Wait for user interaction to play
  document.addEventListener("click", () => {
      video.play();
  }, { once: true }); // Ensures it runs only once
});
