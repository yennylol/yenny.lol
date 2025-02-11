const rainEffect = {
    canvas: document.getElementById("rainCanvas"),
    ctx: this.canvas.getContext("2d"),
    
    setup() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    
    raindrops: [],
  
    Raindrop: class Raindrop {
      constructor() {
        this.x = Math.random() * rainEffect.canvas.width;
        this.y = Math.random() * rainEffect.canvas.height;
        this.length = Math.random() * 20 + 10;
        this.speed = Math.random() * 4 + 2;
      }
  
      fall() {
        this.y += this.speed;
        if (this.y > rainEffect.canvas.height) {
          this.y = -this.length;
          this.x = Math.random() * rainEffect.canvas.width;
        }
      }
  
      draw() {
        rainEffect.ctx.beginPath();
        rainEffect.ctx.moveTo(this.x, this.y);
        rainEffect.ctx.lineTo(this.x, this.y + this.length);
        rainEffect.ctx.strokeStyle = "rgba(173, 216, 230, 0.8)";
        rainEffect.ctx.lineWidth = 2;
        rainEffect.ctx.stroke();
      }
    },
    
    animateRain() {
      rainEffect.ctx.clearRect(0, 0, rainEffect.canvas.width, rainEffect.canvas.height);
      rainEffect.raindrops.forEach((drop) => {
        drop.fall();
        drop.draw();
      });
      requestAnimationFrame(rainEffect.animateRain);
    },
    
    resizeCanvas() {
      rainEffect.canvas.width = window.innerWidth;
      rainEffect.canvas.height = window.innerHeight;
    }
  };
  
  rainEffect.setup();
  for (let i = 0; i < 100; i++) {
    rainEffect.raindrops.push(new rainEffect.Raindrop());
  }
  
  window.addEventListener("resize", rainEffect.resizeCanvas);
  rainEffect.animateRain();
  