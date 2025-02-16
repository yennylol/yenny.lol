document.addEventListener('DOMContentLoaded', () => {
  const weatherToggleButton = document.getElementById("weatherToggleButton");
  const weatherPanel = document.getElementById("weatherPanel");
  const snowCanvas = document.getElementById("snowCanvas");
  const rainCanvas = document.getElementById("rainCanvas");
  let currentWeather = "snow"; // Default weather is snow

  // Initialize snow effect
  initSnow();
});

function initSnow() {
  const canvas = document.getElementById('snowCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particlesArray = [];
  const numberOfParticles = 150;

  // Particle class
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = Math.random() * 1.5 - 0.75; // Gentle drift
      this.speedY = Math.random() * 3 + 1; // Falling speed
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Reset snowflake if it goes out of bounds
      if (this.y > canvas.height) {
        this.reset();
        this.y = 0; // Restart from the top
      }
      if (this.x < 0 || this.x > canvas.width) {
        this.x = Math.random() * canvas.width; // Reset horizontally
      }
    }

    draw() {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Create initial particles
  function initParticles() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(particle => {
      particle.update();
      particle.draw();
    });
    requestAnimationFrame(animate);
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles(); // Reinitialize particles
  });

  // Start animation
  initParticles();
  animate();
}
// Store your refresh token securely (this should ideally be in your backend for security purposes)
const refreshToken = "AQDS88uNfvPvipHTrigrfFz5Jbn2r3bf2tS0qiJ9dts9_cB06jCvMaodAiGZoHdDsEVVC_mXE8wdxpEqEXQzCNgnub0BkkvuQRw4P2RSUDD85E6RhVzpjD6GWyWRqH5BbjM"; // Replace with your actual refresh token

let accessToken = "BQBK_3GjoNQPa1W9IAITixvpwKpgUcP8BJy6WtI40YC62ltEbOO0I0wblAQBBpzOOkZb6zLq8bvnff26zNuTdeDplepYkPYtCc7d0vnjpqd7QLwXQJJWkNKBmYJOsU3bn5QeHkTIGTvygraDWhUEf05397UGv5m22mKHXSA6nh-_jDIcUV4ipxvs2e1kOhyxhqhwsl7wt-KgOj6LoBgje3kGraSFdWctqBdwKRJuMDADfg"; // Replace with your initial access token

// Function to refresh the access token using the refresh token
function refreshAccessToken() {
  fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: '2cec9231015f4eb1b1df1966ce451a2e', // Replace with your Spotify client ID
      client_secret: '7fb5298ed7064edc889b658184d8f3dc' // Replace with your Spotify client secret
    })
  })
  .then(response => response.json())
  .then(data => {
    accessToken = data.access_token;
    console.log('Access token refreshed:', accessToken);
    fetchCurrentlyPlaying(); // Retry fetching the track after refreshing the token
  })
  .catch(error => {
    console.error('Error refreshing the access token:', error);
  });
}

// Function to fetch currently playing track
function fetchCurrentlyPlaying() {
  fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.is_playing) {
      const trackName = data.item.name;
      const albumCover = data.item.album.images[0].url;
      updateSpotifyPlayer(trackName, albumCover);
    } else {
      updateSpotifyPlayer("Not Playing", "");
    }
  })
  .catch(error => {
    console.error('Error fetching the current track:', error);
    if (error.message === "Unauthorized") {
      refreshAccessToken(); // Refresh the access token if it's expired
    }
  });
}

// Function to update the Spotify player UI
function updateSpotifyPlayer(trackName, albumCover) {
  const spotifyPlayerContainer = document.getElementById('spotifyPlayer');
  const trackNameElement = document.getElementById('trackName');
  const albumCoverElement = document.getElementById('albumCover');

  trackNameElement.textContent = trackName;
  albumCoverElement.src = albumCover;
}

// Fetch currently playing track on page load
document.addEventListener('DOMContentLoaded', fetchCurrentlyPlaying);
