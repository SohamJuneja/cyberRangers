// Add fade-in animation to cards - changed timing and animation style
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(25px)'; // Added initial transform
        setTimeout(() => {
            card.classList.add('fade-in');
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)'; // Added transform reset
            card.style.transition = 'opacity 0.7s ease-out, transform 0.6s ease-out'; // Added transition
        }, index * 150); // Changed timing
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Initialize tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Add active class to current nav item
const currentLocation = location.pathname;
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    if (link.getAttribute('href') === currentLocation) {
        link.classList.add('active');
    }
});

// Show/hide loading spinner
function showLoading() {
    document.querySelector('.loading-spinner').style.display = 'block';
}

function hideLoading() {
    document.querySelector('.loading-spinner').style.display = 'none';
}

// Socket.IO Connection for Real-time Updates
if (typeof io !== 'undefined') {
    const socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('update_data', (data) => {
        // Update any real-time elements
        if (typeof updateDashboard === 'function') {
            updateDashboard(data);
        }
    });
}

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    }
}

// Apply saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.add(`${savedTheme}-theme`);

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Add form validation to all forms
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        if (!validateForm(this.id)) {
            e.preventDefault();
            showAlert('Please fill in all required fields', 'danger');
        }
    });
});

// Modified alert function with different animation and style
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible slide-in`; // Added slide-in class
    
    // Changed icon usage and structure
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'danger') icon = 'exclamation-triangle';
    if (type === 'warning') icon = 'exclamation-circle';
    
    alertDiv.innerHTML = `
        <div class="alert-icon"><i class="fas fa-${icon}"></i></div>
        <div class="alert-content">${message}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const alertContainer = document.querySelector('.alert-container') || document.querySelector('main');
    alertContainer.insertBefore(alertDiv, alertContainer.firstChild);
    
    // Add CSS for slide-in if not exists
    if (!document.getElementById('alert-animations')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'alert-animations';
        styleSheet.textContent = `
            .slide-in { 
                animation: slideInDown 0.5s forwards;
                opacity: 0;
                transform: translateY(-20px);
            }
            @keyframes slideInDown {
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    // Changed timeout and added fade-out animation
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-20px)';
        alertDiv.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        setTimeout(() => alertDiv.remove(), 500);
    }, 4500); // Changed timeout
}

// Responsive navigation
const navbarToggler = document.querySelector('.navbar-toggler');
if (navbarToggler) {
    navbarToggler.addEventListener('click', function() {
        this.classList.toggle('collapsed');
    });
}

// Add scroll to top button
const scrollButton = document.createElement('button');
// scrollButton.className = 'scroll-to-top';
// scrollButton.innerHTML = '↑';
document.body.appendChild(scrollButton);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        scrollButton.style.display = 'block';
    } else {
        scrollButton.style.display = 'none';
    }
});

scrollButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});