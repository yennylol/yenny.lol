document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('snowCanvas');
  const ctx = canvas.getContext('2d');

  // Set canvas dimensions to match window
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Particle array
  let particlesArray = [];
  const numberOfParticles = 150;

  // Create initial particles
  for (let i = 0; i < numberOfParticles; i++) {
    particlesArray.push(new Particle());
  }

  // Particle class
  function Particle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = (Math.random() * 3) + 1;
    this.speedX = (Math.random() * 3) - 1.5;
    this.speedY = (Math.random() * 3) + 1.5;
  }

  Particle.prototype.update = function() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.size > 0.2) this.size -= 0.1;
    if (this.size < 0.2) {
      this.x = Math.random() * canvas.width;
      this.y = 0;
      this.size = (Math.random() * 3) + 1;
      this.speedX = (Math.random() * 3) - 1.5;
      this.speedY = (Math.random() * 3) + 1.5;
    }
    if (this.x < 0 || this.x > canvas.width){
      this.x = Math.random() * canvas.width;
    }
    if (this.y > canvas.height){
      this.y = 0;
      this.x = Math.random() * canvas.width;
    }
  };

  Particle.prototype.draw = function() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  };

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});