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
const userId = '1221362871649304626';

fetch(`https://api.lanyard.rest/v1/users/${userId}`)
  .then(response => response.json())
  .then(data => {
    const activity = data.data;
    const activityText = activity?.activities[0]?.name || 'No activity';
    document.getElementById('discord-activity').textContent = `Currently playing: ${activityText}`;
  })
  .catch(error => {
    console.error('Error fetching Discord activity:', error);
    document.getElementById('discord-activity').textContent = 'Error loading activity.';
  });
