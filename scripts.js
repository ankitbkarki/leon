// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');
    let isMenuOpen = false;

    // Toggle menu function
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            mobileMenu.classList.remove('hidden');
            // Force a reflow to ensure the transition works
            mobileMenu.offsetHeight;
            mobileMenu.style.opacity = '1';
            document.body.style.overflow = 'hidden';
            menuBtn.classList.add('hidden');
            closeBtn.classList.remove('hidden');
        } else {
            mobileMenu.style.opacity = '0';
            menuBtn.classList.remove('hidden');
            closeBtn.classList.add('hidden');
            // Wait for transition to complete before hiding
            setTimeout(() => {
                if (!isMenuOpen) { // Only hide if still closed
                    mobileMenu.classList.add('hidden');
                    document.body.style.overflow = '';
                }
            }, 300);
        }
    }

    // Event listeners
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking on links
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            isMenuOpen = false;
            mobileMenu.style.opacity = '0';
            menuBtn.classList.remove('hidden');
            closeBtn.classList.add('hidden');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300);
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            isMenuOpen = false;
            mobileMenu.style.opacity = '0';
            menuBtn.classList.remove('hidden');
            closeBtn.classList.add('hidden');
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300);
        }
    });

    // Prevent clicks inside the menu from closing it
    mobileMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

// Counter animation script
document.addEventListener('DOMContentLoaded', function() {
    function animateCounter(id, target) {
        let count = 0;
        const speed = Math.ceil(target / 100);
        const updateCount = () => {
            if (count < target) {
                count += speed;
                document.getElementById(id).innerText = count;
                setTimeout(updateCount, 20);
            } else {
                document.getElementById(id).innerText = target;
            }
        };
        updateCount();
    }

    // Start animation when section is in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter("counter1", 120);
                animateCounter("counter2", 200);
                animateCounter("counter3", 350);
                animateCounter("counter4", 500);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(document.getElementById('about'));
});

// Cookie consent script
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('cookiesAccepted')) {
        document.getElementById('cookie-consent').classList.remove('hidden');
    }

    document.getElementById('accept-cookies').addEventListener('click', function() {
        localStorage.setItem('cookiesAccepted', 'true');
        document.getElementById('cookie-consent').classList.add('hidden');
    });
});

// Contact form submission script
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Reset error messages
            document.querySelectorAll('.text-red-500').forEach(el => el.classList.add('hidden'));
            document.getElementById('form-message').classList.add('hidden');
            
            // Get form data
            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            const submitText = submitButton.querySelector('.submit-text');
            const loadingText = submitButton.querySelector('.loading-text');
            
            // Show loading state
            submitText.classList.add('hidden');
            loadingText.classList.remove('hidden');
            submitButton.disabled = true;
            
            try {
                // Execute reCAPTCHA
                const token = await grecaptcha.execute('6LeSoP4qAAAAAHGOMEVZTFeifzZwvvg96pSOjKjK', {action: 'submit'});
                
                // Add the token to the form data with the correct parameter name
                formData.append('g-recaptcha-response', token);
                
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    },
                    mode: 'cors'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                // Show success message
                const messageDiv = document.getElementById('form-message');
                messageDiv.textContent = result.message || 'Thank you for your message! We will get back to you soon.';
                messageDiv.classList.remove('hidden', 'bg-red-100', 'text-red-700');
                messageDiv.classList.add('bg-green-100', 'text-green-700');
                
                // Reset form
                this.reset();
                
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Show error message
                const messageDiv = document.getElementById('form-message');
                messageDiv.textContent = 'Sorry, there was an error sending your message. Please try again.';
                messageDiv.classList.remove('hidden', 'bg-green-100', 'text-green-700');
                messageDiv.classList.add('bg-red-100', 'text-red-700');
                
            } finally {
                // Reset button state
                submitText.classList.remove('hidden');
                loadingText.classList.add('hidden');
                submitButton.disabled = false;
            }
        });
    }
});

// Toggle Answer JavaScript
function toggleAnswer(id) {
    const answer = document.getElementById(id);
    const icon = document.getElementById(`icon${id.slice(-1)}`);
    if (answer.style.maxHeight) {
        answer.style.maxHeight = null;
        icon.style.transform = "rotate(0deg)";
    } else {
        answer.style.maxHeight = answer.scrollHeight + "px";
        icon.style.transform = "rotate(180deg)";
    }
} 