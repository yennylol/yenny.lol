const video = document.querySelector("video"); // Select your background video
const volumeSlider = document.getElementById("volume-slider");

volumeSlider.addEventListener("input", () => {
    video.volume = volumeSlider.value;
});
