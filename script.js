document.addEventListener('DOMContentLoaded', () => {
  // Audio Handling
  const audio = document.getElementById('background-audio');
  const audioSources = [
    '/jaydes - find me.mp3',
    '/spotifydown.com - Southside - OsamaSon.mp3', // Add more audio file paths here
  ];

  function shuffleAudio() {
    const randomIndex = Math.floor(Math.random() * audioSources.length);
    audio.src = audioSources[randomIndex];
    audio.load();
    audio.play();
  }

  shuffleAudio();

  // Mute Button Functionality
  window.toggleMute = function() {
    const muteButton = document.querySelector('.mute-button');
    const isMuted = audio.muted;
    audio.muted = !isMuted;

    if (isMuted) {
      muteButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!-- Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
              <path d="M288 32c-19.6 0-39.2 7.2-54.7 21.7L10.7 273.7c-16.5 16.5-16.5 43.3 0 59.8l43.3 43.3c7.5 7.5 17.5 11.7 28.3 11.7H512c10.8 0 20.8-4.2 28.3-11.7l43.3-43.3c16.5-16.5 16.5-43.3 0-59.8L342.7 53.7C327.2 39.2 307.6 32 288 32zM179.8 234.2L288 126l108.2 108.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L288 182.7l-85.6 85.6c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.8-4.7-12.4 0-17z"/>
          </svg>
      `;
    } else {
      muteButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!-- Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
              <path d="M192 96c0-53 43-96 96-96c53 0 96 43 96 96V256H192V96zm64 256V416H224V352c-26.5 0-48 21.5-48 48v64H64V352H16c-8.8 0-16 7.2-16 16V464c0 8.8 7.2 16 16 16H80c8.8 0 16-7.2 16-16V368c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v96h96V352H256zM549.7 66.7c-8.8-7.2-21.4-6.3-29.3 2.4L448 128H384c-35.3 0-64 28.7-64 64V384c0 17.7 7.1 34.1 19.2 45.3l85.1 70.9c4.1 3.4 9.5 5.3 14.8 5.3c5.3 0 10.7-1.9 14.8-5.3c12.3-10.2 19.6-24.4 19.6-40V112c0-15.6-7.3-29.8-19.6-40c-8-6.5-20.5-7.5-29.3-2.7zM598.3 393.4c6.7 5.5 7.7 15.3 2.2 21.9L543 448H421.3L613.5 255.8c7.7-9.4 7.7-22.9 0-32.3l-16.1-19.6c-5.5-6.7-15.3-7.7-21.9-2.2L352 164.7V192c0 17.7 7.1 34.1 19.2 45.3l59.9 49.9c-8.9 10.7-14.1 24.2-14.1 39.4V384h64c11.5 0 22.3-4.5 30.6-11.9l78.2 65.2c6.7 5.5 7.7 15.3 2.2 21.9z"/>
          </svg>
      `;
    }
  };

  // Initial mute button state
  window.toggleMute();

  // View Counter
  let viewCount = localStorage.getItem('viewCount') || 0;
  viewCount++;
  localStorage.setItem('viewCount', viewCount);
  document.getElementById('view-count').textContent = viewCount;

  // Rainbow Text Animation
  const rainbowText = document.querySelector('.rainbow-text');
  rainbowText.style.backgroundImage = "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)";
  rainbowText.style.webkitBackgroundClip = "text";
  rainbowText.style.webkitTextFillColor = "transparent";
  rainbowText.style.backgroundSize = "400% 400%";

  // Set title
  document.title = "websim";
});