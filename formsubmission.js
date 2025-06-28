// Contact form submission script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Form submission script loaded');
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        console.log('Contact form found');
        contactForm.addEventListener('submit', async function(e) {
            console.log('Form submission started');
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
                console.log('Executing reCAPTCHA...');
                // Execute reCAPTCHA
                const token = await grecaptcha.execute('6LeSoP4qAAAAAHGOMEVZTFeifzZwvvg96pSOjKjK', {action: 'submit'});
                console.log('reCAPTCHA token received');
                
                // Add the token to the form data with the correct parameter name
                formData.append('g-recaptcha-response', token);
                
                console.log('Sending form data to:', this.action);
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    },
                    mode: 'cors'
                });
                
                console.log('Response received:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('Form submission successful:', result);
                
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
    } else {
        console.error('Contact form not found');
    }
});
