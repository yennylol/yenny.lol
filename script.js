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
    console.log('API Response:', data); // Log the entire response

    // Ensure that the API has the expected structure
    if (data && data.data && data.data.discord_user && data.data.activities) {
      const user = data.data.discord_user;
      const activities = data.data.activities;
      const discordStatus = data.data.discord_status;

      // Set the user's avatar and name
      document.getElementById('discord-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
      document.getElementById('discord-name').textContent = user.username;

      // Initialize activity info
      let activityText = 'No activity';
      let detailsText = '';
      let activityImage = '';
      let albumArt = '';

      // Loop through all activities
      for (let activity of activities) {
        console.log('Activity:', activity); // Log each activity

        if (activity.type === 2 && activity.name === 'Spotify') {
          // Spotify activity
          activityText = `Listening to ${activity.song} by ${activity.artist}`;
          detailsText = `Album: "${activity.album}" - ${activity.details}`;
          albumArt = activity.spotify.album_art_url; // Album art URL from Spotify
          activityImage = activity.assets.large_image; // Activity image from Spotify
        } else if (activity.type === 0 && activity.name === 'CurseForge') {
          // CurseForge activity
          activityText = `Playing: ${activity.state} on CurseForge`;
          detailsText = `Details: ${activity.details}`;
          activityImage = activity.assets.large_image; // Game/Modpack image
        } else if (activity.type === 4) {
          // Custom status
          activityText = activity.state;
        }
      }

      // Update the activity and details sections
      document.getElementById('discord-activity').textContent = activityText;
      document.getElementById('discord-details').textContent = detailsText;

      // Update the activity image (if exists)
      if (activityImage) {
        document.getElementById('activity-image').src = activityImage;
        document.getElementById('activity-image').style.display = 'block';
      } else {
        document.getElementById('activity-image').style.display = 'none';
      }

      // Update the Spotify album art (if exists)
      if (albumArt) {
        document.getElementById('spotify-album-art').src = albumArt;
        document.getElementById('spotify-album-art').style.display = 'block';
      } else {
        document.getElementById('spotify-album-art').style.display = 'none';
      }

      // Optional: Set Discord status (for example, change widget border color based on status)
      if (discordStatus === 'dnd') {
        document.querySelector('.lanyard-widget').style.borderColor = '#ff0000'; // Red for DND
      }
    } else {
      console.error('Invalid API response:', data);
      document.getElementById('discord-activity').textContent = 'Error loading activity.';
    }
  })
  .catch(error => {
    console.error('Error fetching Discord activity:', error);
    document.getElementById('discord-activity').textContent = 'Error loading activity.';
  });

