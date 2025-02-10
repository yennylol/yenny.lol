document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('snowCanvas');
  const ctx = canvas.getContext('2d');

  // Set canvas dimensions to match window
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
});
