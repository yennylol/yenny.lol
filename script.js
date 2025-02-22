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
const userId = '1221362871649304626'; // Replace with your Discord ID

fetch(`https://api.lanyard.rest/v1/users/${userId}`)
  .then(response => response.json())
  .then(data => {
    console.log(data);  // Add this line to inspect the response

    const user = data.data.discord_user;
    const activity = data.data.activities[0];
    const discordStatus = data.data.discord_status;

    // Set the user's avatar and name
    document.getElementById('discord-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    document.getElementById('discord-name').textContent = user.username;

    // Check if there's an activity
    let activityText = 'No activity';
    let activityImage = '';

    if (activity) {
      if (activity.type === 2 && activity.name === 'Spotify') {
        // Spotify activity
        activityText = `${activity.song} by ${activity.artist} from the album "${activity.album}"`;
        activityImage = activity.spotify.album_art_url;
      } else if (activity.type === 4) {
        // Custom status
        activityText = activity.state;
      }
      document.getElementById('discord-activity').textContent = activityText;
      document.getElementById('activity-image').src = activityImage;
      document.getElementById('activity-image').style.display = activityImage ? 'block' : 'none';
    } else {
      document.getElementById('discord-activity').textContent = 'No activity';
    }

    // Set Discord status (Optional, could display like 'Do Not Disturb')
    if (discordStatus === 'dnd') {
      document.querySelector('.lanyard-widget').style.borderColor = '#ff0000'; // Red for DND
    }
  })
  .catch(error => {
    console.error('Error fetching Discord activity:', error);
    document.getElementById('discord-activity').textContent = 'Error loading activity.';
  });

