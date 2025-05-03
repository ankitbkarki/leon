// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium shadow-lg transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Loading state management
function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
        `;
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text');
    }
}

// File upload handler
function handleFileUpload(input, previewElement) {
    return new Promise((resolve, reject) => {
        const file = input.files[0];
        if (!file) {
            reject(new Error('No file selected'));
            return;
        }

        if (!file.type.startsWith('image/')) {
            reject(new Error('Please select an image file'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Update the upload area preview
                const uploadArea = input.closest('.border-dashed');
                const uploadPreview = uploadArea.querySelector('.flex.flex-col.items-center');
                uploadPreview.innerHTML = `
                    <div class="relative w-full h-32 mb-2">
                        <img src="${e.target.result}" alt="Preview" class="w-full h-full object-contain">
                    </div>
                    <p class="text-gray-400">${file.name}</p>
                    <p class="text-gray-400 text-sm">Click or drag to change</p>
                `;

                // Update the main preview section
                previewElement.innerHTML = '';
                const previewImg = img.cloneNode();
                previewImg.style.maxWidth = '100%';
                previewImg.style.height = 'auto';
                previewElement.appendChild(previewImg);
                resolve({ file, img });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Initialize upload areas and inputs
function initializeUploadArea(inputId) {
    const input = document.getElementById(inputId);
    const uploadArea = input.closest('.border-dashed');
    
    // Make the upload area clickable
    uploadArea.addEventListener('click', () => {
        input.click();
    });

    // Handle drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-blue-500', 'bg-blue-500/10');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-blue-500', 'bg-blue-500/10');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-500', 'bg-blue-500/10');
        
        if (e.dataTransfer.files.length) {
            input.files = e.dataTransfer.files;
            input.dispatchEvent(new Event('change'));
        }
    });

    // Add hover effect
    uploadArea.classList.add('cursor-pointer', 'hover:border-blue-500', 'hover:bg-blue-500/10', 'transition-colors', 'duration-300');

    // Reset the upload area to default state
    function resetUploadArea() {
        const uploadPreview = uploadArea.querySelector('.flex.flex-col.items-center');
        uploadPreview.innerHTML = `
            <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p class="text-gray-400">Drag & drop or click to upload</p>
        `;
    }

    // Add reset functionality
    input.addEventListener('click', (e) => {
        // If there's already a file, clicking should allow picking a new one
        if (input.files.length) {
            e.stopPropagation();
        }
    });
}

// Initialize range inputs
document.addEventListener('DOMContentLoaded', () => {
    // Save original button text
    document.querySelectorAll('button').forEach(button => {
        button.setAttribute('data-original-text', button.innerHTML);
    });

    // Initialize range inputs
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        const valueDisplay = document.getElementById(`${input.id}-value`);
        if (valueDisplay) {
            valueDisplay.textContent = `${input.value}%`;
            input.addEventListener('input', () => {
                valueDisplay.textContent = `${input.value}%`;
            });
        }
    });

    // Initialize file inputs and upload areas
    const fileInputIds = ['resize-input', 'compress-input', 'convert-input', 'metadata-input'];
    fileInputIds.forEach(inputId => {
        initializeUploadArea(inputId);
        
        const input = document.getElementById(inputId);
        input.addEventListener('change', async () => {
            try {
                const previewElement = document.getElementById('original-preview');
                await handleFileUpload(input, previewElement);
                document.getElementById('preview-section').classList.remove('hidden');
                showNotification('Image uploaded successfully');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    });
});

// Image Resizer
document.getElementById('resize-button').addEventListener('click', async () => {
    const button = document.getElementById('resize-button');
    setLoadingState(button, true);

    try {
        const input = document.getElementById('resize-input');
        const width = parseInt(document.getElementById('resize-width').value);
        const height = parseInt(document.getElementById('resize-height').value);
        const scale = parseInt(document.getElementById('resize-scale').value) / 100;

        if (!input.files[0]) {
            throw new Error('Please select an image');
        }

        const { img } = await handleFileUpload(input, document.getElementById('original-preview'));

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions
        let newWidth = width || img.width * scale;
        let newHeight = height || img.height * scale;

        // Maintain aspect ratio if only one dimension is specified
        if (width && !height) {
            newHeight = (img.height * width) / img.width;
        } else if (height && !width) {
            newWidth = (img.width * height) / img.height;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and resize image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Show preview
        const resultPreview = document.getElementById('result-preview');
        resultPreview.innerHTML = '';
        const resultImg = new Image();
        resultImg.src = canvas.toDataURL('image/jpeg', 0.9);
        resultPreview.appendChild(resultImg);

        // Create download link
        const link = document.createElement('a');
        link.download = `resized-${input.files[0].name}`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();

        showNotification('Image resized successfully');
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        setLoadingState(button, false);
    }
});

// Image Compressor
document.getElementById('compress-button').addEventListener('click', async () => {
    const button = document.getElementById('compress-button');
    setLoadingState(button, true);

    try {
        const input = document.getElementById('compress-input');
        const quality = parseInt(document.getElementById('compress-quality').value) / 100;
        const format = document.getElementById('compress-format').value;

        if (!input.files[0]) {
            throw new Error('Please select an image');
        }

        const { img } = await handleFileUpload(input, document.getElementById('original-preview'));

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Show preview
        const resultPreview = document.getElementById('result-preview');
        resultPreview.innerHTML = '';
        const resultImg = new Image();
        resultImg.src = canvas.toDataURL(`image/${format}`, quality);
        resultPreview.appendChild(resultImg);

        // Create download link
        const link = document.createElement('a');
        link.download = `compressed-${input.files[0].name.split('.')[0]}.${format}`;
        link.href = canvas.toDataURL(`image/${format}`, quality);
        link.click();

        showNotification('Image compressed successfully');
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        setLoadingState(button, false);
    }
});

// Format Converter
document.getElementById('convert-button').addEventListener('click', async () => {
    const button = document.getElementById('convert-button');
    setLoadingState(button, true);

    try {
        const input = document.getElementById('convert-input');
        const format = document.getElementById('convert-format').value;

        if (!input.files[0]) {
            throw new Error('Please select an image');
        }

        const { img } = await handleFileUpload(input, document.getElementById('original-preview'));

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Show preview
        const resultPreview = document.getElementById('result-preview');
        resultPreview.innerHTML = '';
        const resultImg = new Image();
        resultImg.src = canvas.toDataURL(`image/${format}`);
        resultPreview.appendChild(resultImg);

        // Create download link
        const link = document.createElement('a');
        link.download = `${input.files[0].name.split('.')[0]}.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();

        showNotification('Image converted successfully');
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        setLoadingState(button, false);
    }
});

// Metadata Remover
document.getElementById('metadata-button').addEventListener('click', async () => {
    const button = document.getElementById('metadata-button');
    setLoadingState(button, true);

    try {
        const input = document.getElementById('metadata-input');

        if (!input.files[0]) {
            throw new Error('Please select an image');
        }

        const { img } = await handleFileUpload(input, document.getElementById('original-preview'));

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Show preview
        const resultPreview = document.getElementById('result-preview');
        resultPreview.innerHTML = '';
        const resultImg = new Image();
        resultImg.src = canvas.toDataURL('image/jpeg');
        resultPreview.appendChild(resultImg);

        // Create download link
        const link = document.createElement('a');
        link.download = `clean-${input.files[0].name}`;
        link.href = canvas.toDataURL('image/jpeg');
        link.click();

        showNotification('Metadata removed successfully');
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        setLoadingState(button, false);
    }
}); 