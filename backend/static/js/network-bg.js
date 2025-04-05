document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('network-bg');
    const ctx = canvas.getContext('2d');
    let particleArray = [];
    
    // Modified configuration
    const numberOfParticles = 120; // Increased particles
    const particleSize = 1.5; // Changed size
    const connectionDistance = 120; // Changed distance
    const moveSpeed = 0.4; // Changed speed
    
    // Resize canvas to full window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Create particle class with modifications
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.velocityX = (Math.random() - 0.5) * moveSpeed;
            this.velocityY = (Math.random() - 0.5) * moveSpeed;
            // Added size variation
            this.size = Math.random() * particleSize + 0.5;
            // Added color variation
            this.hue = Math.floor(Math.random() * 30) + 200; // Blue-purple range
        }
        
        update() {
            // Move particle
            this.x += this.velocityX;
            this.y += this.velocityY;
            
            // Changed bounce behavior
            if (this.x < 0) {
                this.x = 0;
                this.velocityX *= -1;
            }
            if (this.x > canvas.width) {
                this.x = canvas.width;
                this.velocityX *= -1;
            }
            if (this.y < 0) {
                this.y = 0;
                this.velocityY *= -1;
            }
            if (this.y > canvas.height) {
                this.y = canvas.height;
                this.velocityY *= -1;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            // Changed color to use HSL for variety
            ctx.fillStyle = `hsla(${this.hue}, 80%, 50%, 0.6)`;
            ctx.fill();
        }
    }
    
    // Initialize particles
    function init() {
        particleArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            particleArray.push(new Particle());
        }
    }
    
    // Modified connection drawing
    function connect() {
        for (let i = 0; i < particleArray.length; i++) {
            for (let j = i + 1; j < particleArray.length; j++) {
                const dx = particleArray[i].x - particleArray[j].x;
                const dy = particleArray[i].y - particleArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    // Changed opacity calculation
                    const opacity = Math.pow(1 - distance / connectionDistance, 1.5) * 0.25;
                    
                    // Create gradient line instead of solid line
                    const gradient = ctx.createLinearGradient(
                        particleArray[i].x, 
                        particleArray[i].y, 
                        particleArray[j].x, 
                        particleArray[j].y
                    );
                    
                    gradient.addColorStop(0, `hsla(${particleArray[i].hue}, 80%, 50%, ${opacity})`);
                    gradient.addColorStop(1, `hsla(${particleArray[j].hue}, 80%, 50%, ${opacity})`);
                    
                    ctx.beginPath();
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 0.8; // Changed line width
                    ctx.moveTo(particleArray[i].x, particleArray[i].y);
                    ctx.lineTo(particleArray[j].x, particleArray[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particleArray.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connect();
        requestAnimationFrame(animate);
    }
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize
    resizeCanvas();
    init();
    animate();
});