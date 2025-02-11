const rainCanvas = document.getElementById("rainCanvas");
const ctx = rainCanvas.getContext("2d");

rainCanvas.width = window.innerWidth;
rainCanvas.height = window.innerHeight;

const raindrops = [];

class Raindrop {
  constructor() {
    this.x = Math.random() * rainCanvas.width;
    this.y = Math.random() * rainCanvas.height;
    this.length = Math.random() * 20 + 10;
    this.speed = Math.random() * 4 + 2;
  }

  fall() {
    this.y += this.speed;
    if (this.y > rainCanvas.height) {
      this.y = -this.length;
      this.x = Math.random() * rainCanvas.width;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + this.length);
    ctx.strokeStyle = "rgba(173, 216, 230, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

for (let i = 0; i < 100; i++) {
  raindrops.push(new Raindrop());
}

function animateRain() {
  ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
  raindrops.forEach((drop) => {
    drop.fall();
    drop.draw();
  });
  requestAnimationFrame(animateRain);
}

window.addEventListener("resize", () => {
  rainCanvas.width = window.innerWidth;
  rainCanvas.height = window.innerHeight;
});

animateRain();
