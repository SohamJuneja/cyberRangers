// Handle visual animations and interaction effects
document.addEventListener("DOMContentLoaded", function () {
    // Animation functionality for numeric counters
    animateCounters();
    
    // Apply 3D tilt effect to glass card elements
    setupCardTiltEffects();
  });
  
  // Function to handle counter animations
  function animateCounters() {
    const counterElements = document.querySelectorAll(".counter");
    const animationDuration = 200;
  
    counterElements.forEach((counterElement) => {
      // Extract original value and format
      const originalText = counterElement.innerText;
      const numericValue = parseFloat(originalText.replace(/[^\d.]/g, ""));
      const displayFormat = originalText;
      
      // Store original data as attributes
      counterElement.setAttribute("data-target", numericValue);
      counterElement.setAttribute("data-format", displayFormat);
      counterElement.innerText = "0";
      
      // Create intersection observer for viewport detection
      observeElementVisibility(counterElement, () => {
        startCounterAnimation(counterElement, numericValue, animationDuration);
      });
    });
  }
  
  // Start animation when element is in viewport
  function observeElementVisibility(element, callback) {
    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          visibilityObserver.unobserve(entry.target);
        }
      });
    });
    
    visibilityObserver.observe(element);
  }
  
  // Animate counter from zero to target value
  function startCounterAnimation(element, targetValue, duration) {
    const incrementStep = function() {
      const currentValue = parseFloat(element.innerText.replace(/[^\d.]/g, ""));
      const increment = targetValue / duration;
      
      if (currentValue < targetValue) {
        element.innerText = Math.ceil(currentValue + increment);
        setTimeout(incrementStep, 1);
      } else {
        // Apply formatting when animation completes
        const formatTemplate = element.getAttribute("data-format");
        element.innerText = formatTemplate.replace("{value}", targetValue);
      }
    };
    
    incrementStep();
  }
  
  // Setup 3D effect for glass cards
  function setupCardTiltEffects() {
    const glassCardElements = document.querySelectorAll(".glass-card");
    
    glassCardElements.forEach((card) => {
      // Apply 3D tilt effect on mouse movement
      card.addEventListener("mousemove", applyTiltEffect);
      
      // Reset card position when mouse leaves
      card.addEventListener("mouseleave", resetCardPosition);
    });
  }
  
  // Calculate and apply 3D tilt based on mouse position
  function applyTiltEffect(event) {
    const card = event.currentTarget;
    const cardBounds = card.getBoundingClientRect();
    
    // Get mouse position relative to card center
    const mouseX = event.clientX - cardBounds.left;
    const mouseY = event.clientY - cardBounds.top;
    const centerX = cardBounds.width / 2;
    const centerY = cardBounds.height / 2;
    
    // Calculate rotation angles (inverse relationship)
    const tiltY = (mouseX - centerX) / -20;
    const tiltX = (centerY - mouseY) / -20;
    
    // Apply transform with perspective
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
  }
  
  // Reset card to neutral position
  function resetCardPosition(event) {
    event.currentTarget.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  }