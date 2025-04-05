/**
 * Dynamic Network Background Visualization
 * Creates interactive cybersecurity-themed network animation
 */

document.addEventListener("DOMContentLoaded", () => {
    // Initialize network animation system
    const networkViz = new NetworkVisualization();
    
    // Start animation sequence
    networkViz.start();
    
    // Add CSS for additional visual elements
    addAnimationStyles();
  });
  
  // Create and inject required CSS styles
  function addAnimationStyles() {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @keyframes pulseEffect {
        0% { width: 5px; height: 5px; opacity: 1; }
        100% { width: 100px; height: 100px; opacity: 0; }
      }
      .data-packet, .ripple {
        pointer-events: none;
      }
      .ripple {
        z-index: 10;
        animation: pulseEffect 1s cubic-bezier(0, 0.2, 0.8, 1) forwards;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Network visualization system
  class NetworkVisualization {
    constructor() {
      this.canvas = document.getElementById("network-bg");
      this.ctx = this.canvas.getContext("2d");
      this.nodes = [];
      this.connectionDistance = 150;
      this.mousePosition = { x: null, y: null };
      
      // Set up initial state
      this.setupCanvas();
      this.createNodes();
      this.setupEventListeners();
    }
    
    // Set up canvas dimensions
    setupCanvas() {
      this.resizeCanvas();
      window.addEventListener("resize", () => {
        this.resizeCanvas();
        this.adjustNetworkDensity();
      });
    }
    
    // Adjust canvas to fit window
    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
    
    // Create initial network nodes
    createNodes() {
      const nodeCount = this.calculateIdealNodeCount();
      
      for (let i = 0; i < nodeCount; i++) {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        this.nodes.push(new NetworkNode(x, y));
      }
    }
    
    // Calculate ideal node count based on screen size
    calculateIdealNodeCount() {
      return Math.min(
        Math.floor((window.innerWidth * window.innerHeight) / 15000),
        150
      );
    }
    
    // Setup event listeners for interactivity
    setupEventListeners() {
      this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
      this.canvas.addEventListener("mouseleave", () => {
        this.mousePosition = { x: null, y: null };
      });
    }
    
    // Handle mouse movement events
    handleMouseMove(event) {
      this.mousePosition = { x: event.x, y: event.y };
      
      // Occasionally create ripple effect
      if (Math.random() > 0.92) {
        this.createRippleEffect(event.clientX, event.clientY);
      }
    }
    
    // Create ripple visual effect
    createRippleEffect(x, y) {
      const ripple = document.createElement("div");
      ripple.className = "ripple";
      ripple.style.position = "absolute";
      ripple.style.width = "5px";
      ripple.style.height = "5px";
      ripple.style.borderRadius = "50%";
      ripple.style.border = "1px solid rgba(124, 58, 237, 0.5)";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.transform = "translate(-50%, -50%)";
      
      document.body.appendChild(ripple);
      
      // Clean up element after animation
      setTimeout(() => {
        document.body.removeChild(ripple);
      }, 1000);
    }
    
    // Start animation loop
    start() {
      requestAnimationFrame(this.animate.bind(this));
    }
    
    // Main animation loop
    animate() {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Update and draw nodes
      this.nodes.forEach(node => {
        node.update(this.canvas.width, this.canvas.height);
        node.draw(this.ctx);
      });
      
      // Draw connections between nodes
      this.drawConnections();
      
      // Add data packet effects
      this.createDataPackets();
      
      // Add nodes near mouse
      this.addNodesNearMouse();
      
      // Continue animation loop
      requestAnimationFrame(this.animate.bind(this));
    }
    
    // Draw connections between nearby nodes
    drawConnections() {
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const dx = this.nodes[i].x - this.nodes[j].x;
          const dy = this.nodes[i].y - this.nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < this.connectionDistance) {
            this.drawConnection(this.nodes[i], this.nodes[j], distance);
          }
        }
      }
    }
    
    // Draw a single connection between two nodes
    drawConnection(node1, node2, distance) {
      // Calculate opacity based on distance
      const opacity = 1 - distance / this.connectionDistance;
      
      // Get color from node and adjust opacity
      const lineColor = node1.color.replace(
        /[^,]+(?=\))/,
        opacity.toFixed(2)
      );
      
      // Draw the line
      this.ctx.beginPath();
      this.ctx.moveTo(node1.x, node1.y);
      this.ctx.lineTo(node2.x, node2.y);
      this.ctx.strokeStyle = lineColor;
      this.ctx.lineWidth = opacity * 1.5;
      this.ctx.stroke();
      
      // Add glow effect for prominent connections
      if (opacity > 0.8) {
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = node1.color;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      }
    }
    
    // Create animated data packets
    createDataPackets() {
      if (this.nodes.length < 2 || Math.random() > 0.03) return;
      
      // Select source and target nodes
      const [sourceIndex, targetIndex] = this.selectNodePair();
      const sourceNode = this.nodes[sourceIndex];
      const targetNode = this.nodes[targetIndex];
      
      // Create visual packet element
      this.createPacketElement(sourceNode, targetNode);
    }
    
    // Select a pair of different nodes
    selectNodePair() {
      const sourceIndex = Math.floor(Math.random() * this.nodes.length);
      let targetIndex;
      
      do {
        targetIndex = Math.floor(Math.random() * this.nodes.length);
      } while (targetIndex === sourceIndex);
      
      return [sourceIndex, targetIndex];
    }
    
    // Create visual element for data packet
    createPacketElement(source, target) {
      const packet = document.createElement("div");
      packet.className = "data-packet";
      packet.style.position = "absolute";
      packet.style.width = "4px";
      packet.style.height = "4px";
      packet.style.backgroundColor = Math.random() > 0.8 ? "#ff3a8c" : "#36d7b7";
      packet.style.borderRadius = "50%";
      packet.style.boxShadow = `0 0 10px ${packet.style.backgroundColor}`;
      packet.style.zIndex = "5";
      packet.style.opacity = "0.8";
      packet.style.transition = "all 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      packet.style.left = source.x + "px";
      packet.style.top = source.y + "px";
      
      document.body.appendChild(packet);
      
      // Animate the packet
      setTimeout(() => {
        packet.style.left = target.x + "px";
        packet.style.top = target.y + "px";
        packet.style.opacity = "0";
      }, 50);
      
      // Clean up after animation
      setTimeout(() => {
        document.body.removeChild(packet);
      }, 2000);
    }
    
    // Add nodes near mouse cursor position
    addNodesNearMouse() {
      if (!this.mousePosition.x || Math.random() > 0.9) return;
      
      const radius = 50;
      const angle = Math.random() * Math.PI * 2;
      const x = this.mousePosition.x + radius * Math.cos(angle);
      const y = this.mousePosition.y + radius * Math.sin(angle);
      
      // Add node if within canvas bounds
      if (this.isWithinCanvas(x, y)) {
        this.nodes.push(new NetworkNode(x, y));
        
        // Limit total node count
        if (this.nodes.length > 200) {
          this.nodes.shift();
        }
      }
    }
    
    // Check if coordinates are within canvas
    isWithinCanvas(x, y) {
      return x > 0 && x < this.canvas.width && y > 0 && y < this.canvas.height;
    }
    
    // Adjust network density on resize
    adjustNetworkDensity() {
      // Update connection distance
      this.connectionDistance = Math.max(
        100,
        Math.min(window.innerWidth, window.innerHeight) / 8
      );
      
      // Adjust node count
      const idealNodeCount = this.calculateIdealNodeCount();
      
      if (idealNodeCount > this.nodes.length) {
        // Add nodes
        for (let i = this.nodes.length; i < idealNodeCount; i++) {
          const x = Math.random() * this.canvas.width;
          const y = Math.random() * this.canvas.height;
          this.nodes.push(new NetworkNode(x, y));
        }
      } else if (idealNodeCount < this.nodes.length) {
        // Remove nodes
        this.nodes = this.nodes.slice(0, idealNodeCount);
      }
    }
  }
  
  // Network node class
  class NetworkNode {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = Math.random() * 2 + 1;
      this.velocity = Math.random() * 0.5 + 0.1;
      this.vectorX = Math.random() * 2 - 1;
      this.vectorY = Math.random() * 2 - 1;
      this.color = this.selectColor();
    }
    
    // Select color from palette
    selectColor() {
      const colorOptions = [
        "rgba(124, 58, 237, 0.7)", // purple
        "rgba(54, 215, 183, 0.7)", // teal
        "rgba(255, 58, 140, 0.6)", // pink
      ];
      return colorOptions[Math.floor(Math.random() * colorOptions.length)];
    }
    
    // Update node position
    update(canvasWidth, canvasHeight) {
      // Boundary collision detection
      if (this.x + this.radius > canvasWidth || this.x - this.radius < 0) {
        this.vectorX = -this.vectorX;
      }
      if (this.y + this.radius > canvasHeight || this.y - this.radius < 0) {
        this.vectorY = -this.vectorY;
      }
      
      // Move position based on velocity and direction
      this.x += this.vectorX * this.velocity;
      this.y += this.vectorY * this.velocity;
    }
    
    // Draw node on canvas
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      
      // Apply glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }