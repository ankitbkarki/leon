// Counter Animation Script
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

// Start animation on page load
window.onload = function() {
    animateCounter("counter1", 120);
    animateCounter("counter2", 200);
    animateCounter("counter3", 350);
    animateCounter("counter4", 500);
};

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

// Mobile Menu Script
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuLinks = document.querySelectorAll('#mobile-menu a'); // Select all menu links

// Toggle menu on button click
menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Hide menu when a link is clicked
menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden'); // Ensure menu hides when a link is clicked
    });
});

// Cookie Consent Script
if (!localStorage.getItem('cookiesAccepted')) {
    document.getElementById('cookie-consent').style.display = 'flex';
}

document.getElementById('accept-cookies').addEventListener('click', function() {
    localStorage.setItem('cookiesAccepted', 'true');
    document.getElementById('cookie-consent').style.display = 'none';
}); 