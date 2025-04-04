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