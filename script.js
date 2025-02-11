document.addEventListener('DOMContentLoaded', async () => {
  // Set the profile picture
  const avatarDiv = document.querySelector('.avatar');
  avatarDiv.innerHTML = `<img src="/scarface.jpg" alt="Profile Picture" style="width: 200px; height: 200px; border-radius: 50%;">`;

  await populateProjects();

  // Shuffle background videos
  const videos = ["/che - Pizza Time.mp4", "/prettifun - Light (Official Video).mp4"];
  let currentVideoIndex = 0;
  const backgroundVideo = document.querySelector('.background-video');

  function setNextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
    backgroundVideo.src = videos[currentVideoIndex];
    backgroundVideo.load();
  }

  backgroundVideo.addEventListener('ended', setNextVideo);
});
    const weatherToggleButton = document.getElementById("weatherToggleButton");
    const weatherPanel = document.getElementById("weatherPanel");
    const snowCanvas = document.getElementById("snowCanvas");
    const rainCanvas = document.getElementById("rainCanvas");
    const snowButton = document.getElementById("snowButton");
    const rainButton = document.getElementById("rainButton");
    const noWeatherButton = document.getElementById("noWeatherButton");
  
    let panelOpen = false;
  
    // Toggle weather panel visibility
    weatherToggleButton.addEventListener("click", function () {
      panelOpen = !panelOpen;
      weatherPanel.style.display = panelOpen ? "block" : "none";
    });
  
    // Snow Button
    snowButton.addEventListener("click", function () {
      snowCanvas.style.display = "block";
      rainCanvas.style.display = "none";
    });
  
    // Rain Button
    rainButton.addEventListener("click", function () {
      snowCanvas.style.display = "none";
      rainCanvas.style.display = "block";
    });
  
    // No Weather Button
    noWeatherButton.addEventListener("click", function () {
      snowCanvas.style.display = "none";
      rainCanvas.style.display = "none";
    });
  });
  
