// Mobile Menu Toggle
document.querySelector('.nav-toggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    const navLinks = document.querySelector('.nav-links');
    const navToggle = document.querySelector('.nav-toggle');
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form Submission Handling
document.getElementById('contact-form').addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevent the form from submitting normally

    // Create a FormData object from the form fields
    const formData = new FormData(this);

    // Show a loading message while the request is being sent
    const responseMessageDiv = document.getElementById('form-response');
    responseMessageDiv.classList.remove('hidden');
    document.getElementById('response-message').textContent = 'Sending...';

    try {
        // Send the form data to your Cloudflare Worker
        await fetch(this.action, {
            method: 'POST',
            body: formData
        });

        // Display success message
        document.getElementById('response-message').textContent = 'Thank you for your message! We will get back to you soon.';
        
        // Reset the form after submission
        this.reset();
        
        // Reset Turnstile
        if (window.turnstile) {
            window.turnstile.reset();
        }
    } catch (error) {
        // Display success message even if there was an error
        document.getElementById('response-message').textContent = 'Thank you for your message! We will get back to you soon.';
        
        // Reset the form after submission
        this.reset();
        
        // Reset Turnstile
        if (window.turnstile) {
            window.turnstile.reset();
        }
    }
});

// Newsletter Form Submission
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    
    // Show loading state
    const submitBtn = this.querySelector('.subscribe-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    
    // Simulate newsletter subscription (replace with actual API endpoint)
    setTimeout(() => {
        // Reset form
        this.reset();
        
        // Show success message
        alert('Thank you for subscribing to our newsletter!');
        
        // Reset button
        submitBtn.innerHTML = originalText;
    }, 1500);
});

// Scroll reveal animation
const scrollReveal = () => {
    const elements = document.querySelectorAll('.service-card, .about-content, .contact-content');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Initial check for elements in view
scrollReveal();

// Check for elements in view on scroll
window.addEventListener('scroll', scrollReveal);

// Counter Animation
function animateCounter(counter) {
    const target = parseInt(counter.getAttribute('data-target'));
    let count = 0;
    const speed = 2000 / target; // 2 seconds duration

    function updateCount() {
        if (count < target) {
            count++;
            counter.innerText = count;
            setTimeout(updateCount, speed);
        } else {
            counter.innerText = target;
        }
    }
    updateCount();
}

// Intersection Observer for counter animation
const observerOptions = {
    threshold: 0.5
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(counter => animateCounter(counter));
            counterObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe the about stats section
const aboutStats = document.querySelector('.about-stats');
if (aboutStats) {
    counterObserver.observe(aboutStats);
}

// Testimonial Navigation
const testimonialCards = document.querySelectorAll('.testimonial-card');
const navDots = document.querySelectorAll('.nav-dot');
let currentTestimonial = 0;

function updateTestimonialDisplay() {
    // Remove active class from all cards and dots
    testimonialCards.forEach(card => {
        card.classList.remove('active');
    });
    
    navDots.forEach(dot => {
        dot.classList.remove('active');
    });

    // Add active class to current card and dot
    testimonialCards[currentTestimonial].classList.add('active');
    navDots[currentTestimonial].classList.add('active');
}

// Add click event listeners to navigation dots
navDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentTestimonial = index;
        updateTestimonialDisplay();
    });
});

// Auto-advance testimonials
setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
    updateTestimonialDisplay();
}, 5000);

// Initialize first testimonial
updateTestimonialDisplay();

// FAQ Toggle
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        // Set initial height for smooth animation
        if (item.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
        
        question.addEventListener('click', () => {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = '0';
                }
            });
            
            // Toggle current FAQ item
            item.classList.toggle('active');
            
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
        });
    });
});

// Cookie Consent Banner
document.addEventListener('DOMContentLoaded', function() {
    const cookieBanner = document.getElementById('cookieBanner');
    
    // Check if user has already made a choice
    if (!localStorage.getItem('cookieConsent')) {
        // Show banner after a short delay
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 2000);
    }
});

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookieBanner').classList.remove('show');
    // Add your cookie acceptance logic here
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    document.getElementById('cookieBanner').classList.remove('show');
    // Add your cookie decline logic here
} 