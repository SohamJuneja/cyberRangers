/**
 * Documentation page functionality
 * Manages navigation, animation, and interactive elements
 */

// Highlight active section in navigation
function setupNavigationHighlighting() {
    const sections = document.querySelectorAll(".doc-section");
    const navLinks = document.querySelectorAll(".doc-nav .nav-link");
  
    function highlightNavigation() {
      let current = "";
  
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 150) {
          current = section.getAttribute("id");
        }
      });
  
      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href").substring(1) === current) {
          link.classList.add("active");
        }
      });
    }
  
    window.addEventListener("scroll", highlightNavigation);
    highlightNavigation(); // Run immediately to highlight correct section
  }
  
  // Smooth scroll for navigation links
  function setupSmoothScrolling() {
    document.querySelectorAll(".doc-nav a").forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);
  
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: "smooth",
        });
      });
    });
  }
  
  // Copy code functionality
  function copyCode(button) {
    const codeBlock = button.closest(".code-block").querySelector("code");
    const textToCopy = codeBlock.textContent;
  
    navigator.clipboard.writeText(textToCopy).then(() => {
      // Visual feedback - changed icons and colors
      const originalIcon = button.innerHTML;
      button.innerHTML = '<i class="fas fa-clipboard-check"></i>'; // Changed icon
      button.style.background = "rgba(75, 192, 140, 0.3)"; // Changed color
  
      // Changed animation approach with transition
      button.style.transition = "transform 0.3s ease";
      button.style.transform = "scale(1.1)";
      
      setTimeout(() => {
        button.style.transform = "scale(1)";
        button.innerHTML = originalIcon;
        button.style.background = "rgba(200, 200, 200, 0.15)"; // Changed color
      }, 1800); // Changed timeout
    });
  }
  
  // Changed animation behavior for scroll animations
  function setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.2, // Changed threshold
      rootMargin: "0px 0px -80px 0px", // Changed margin
    };
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Changed animation style
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateX(0)"; // Changed from Y to X
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
  
    document.querySelectorAll(".fade-in").forEach((el) => {
      // Changed initial state
      el.style.opacity = "0";
      el.style.transform = "translateX(-30px)"; // Changed from Y to X
      el.style.transition = "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"; // Changed timing function
      observer.observe(el);
    });
  }
  
  // Handle accordion for non-Bootstrap installations
  function setupAccordions() {
    document.querySelectorAll(".cyber-accordion-button").forEach((button) => {
      button.addEventListener("click", function () {
        // If Bootstrap is not handling this
        if (!this.dataset.bsToggle) {
          this.classList.toggle("collapsed");
          const target = document.querySelector(
            this.dataset.target || this.getAttribute("data-target")
          );
          if (target) {
            target.classList.toggle("show");
          }
        }
      });
    });
  }
  
  // Initialize tooltips if Bootstrap is available
  function initTooltips() {
    if (typeof bootstrap !== "undefined") {
      const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }
  
  // Initialize all functionality when DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    setupNavigationHighlighting();
    setupSmoothScrolling();
    setupScrollAnimations();
    setupAccordions();
    initTooltips();
  
    // Make copyCode function available globally
    window.copyCode = copyCode;
  });