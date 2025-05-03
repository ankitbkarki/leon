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
                previewElement.innerHTML = '';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                previewElement.appendChild(img);
                
                // Update original info
                const originalInfo = document.getElementById('original-info');
                originalInfo.textContent = `${img.width}x${img.height}px • ${(file.size / 1024).toFixed(1)}KB`;
                
                resolve({ file, img });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Track selected operations
const selectedOperations = new Set();

// Initialize the interface
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

    // Handle operation selection
    document.querySelectorAll('.operation-card').forEach(card => {
        card.addEventListener('click', () => {
            const operation = card.dataset.operation;
            
            if (card.classList.contains('selected')) {
                card.classList.remove('selected');
                selectedOperations.delete(operation);
            } else {
                card.classList.add('selected');
                selectedOperations.add(operation);
            }

            // Show/hide sections based on selections
            const hasSelections = selectedOperations.size > 0;
            document.getElementById('upload-section').classList.toggle('hidden', !hasSelections);
            document.getElementById('settings-section').classList.toggle('hidden', !hasSelections);

            // Show/hide specific option sections
            document.getElementById('resize-options').classList.toggle('hidden', !selectedOperations.has('resize'));
            document.getElementById('compress-options').classList.toggle('hidden', !selectedOperations.has('compress'));
            document.getElementById('format-options').classList.toggle('hidden', !selectedOperations.has('format'));
        });
    });

    // Initialize file upload
    const uploadArea = document.querySelector('.border-dashed');
    const fileInput = document.getElementById('unified-input');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const originalPreview = document.getElementById('original-preview');
    const changeImageBtn = document.getElementById('change-image');

    function handleUploadClick() {
        fileInput.click();
    }

    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea || e.target === uploadPlaceholder || uploadPlaceholder.contains(e.target)) {
            handleUploadClick();
        }
    });
    
    changeImageBtn.addEventListener('click', handleUploadClick);

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
            fileInput.files = e.dataTransfer.files;
            fileInput.dispatchEvent(new Event('change'));
        }
    });

    // Handle file selection
    fileInput.addEventListener('change', async () => {
        try {
            const file = fileInput.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Hide placeholder, show preview
                    uploadPlaceholder.classList.add('hidden');
                    originalPreview.classList.remove('hidden');
                    
                    // Update preview
                    const previewImg = originalPreview.querySelector('img') || document.createElement('img');
                    previewImg.src = e.target.result;
                    previewImg.style.maxWidth = '100%';
                    previewImg.style.height = 'auto';
                    previewImg.style.maxHeight = '300px';
                    if (!previewImg.parentElement) {
                        originalPreview.insertBefore(previewImg, originalPreview.firstChild);
                    }

                    // Update info
                    const originalInfo = document.getElementById('original-info');
                    originalInfo.textContent = `${img.width}x${img.height}px • ${(file.size / 1024).toFixed(1)}KB`;
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            showNotification('Image uploaded successfully');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // Handle process button
    document.getElementById('process-button').addEventListener('click', async () => {
        const button = document.getElementById('process-button');
        setLoadingState(button, true);

        try {
            if (!fileInput.files[0]) {
                throw new Error('Please select an image');
            }

            if (selectedOperations.size === 0) {
                throw new Error('Please select at least one operation');
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const img = new Image();
                img.onload = async () => {
                    try {
                        const { canvas, format } = await processImage(img);
                        
                        // Create download link
                        const link = document.createElement('a');
                        const operations = Array.from(selectedOperations);
                        
                        const filename = operations.length > 0 
                            ? `${operations.join('-')}-${fileInput.files[0].name.split('.')[0]}.${format}`
                            : `converted-${fileInput.files[0].name.split('.')[0]}.${format}`;

                        link.download = filename;
                        link.href = canvas.toDataURL(`image/${format}`);
                        link.click();

                        showNotification('Image processed successfully');
                    } catch (error) {
                        showNotification(error.message, 'error');
                    } finally {
                        setLoadingState(button, false);
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(fileInput.files[0]);
        } catch (error) {
            showNotification(error.message, 'error');
            setLoadingState(button, false);
        }
    });
});

// Process image with selected operations
async function processImage(originalImage) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let currentImage = originalImage;

    // Apply resize if enabled
    if (selectedOperations.has('resize')) {
        const width = parseInt(document.getElementById('resize-width').value);
        const height = parseInt(document.getElementById('resize-height').value);
        const scale = parseInt(document.getElementById('resize-scale').value) / 100;

        let newWidth = width || currentImage.width * scale;
        let newHeight = height || currentImage.height * scale;

        if (width && !height) {
            newHeight = (currentImage.height * width) / currentImage.width;
        } else if (height && !width) {
            newWidth = (currentImage.width * height) / currentImage.height;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(currentImage, 0, 0, newWidth, newHeight);
        
        const resizedImage = new Image();
        await new Promise(resolve => {
            resizedImage.onload = resolve;
            resizedImage.src = canvas.toDataURL('image/png');
        });
        currentImage = resizedImage;
    }

    // Apply compression and format conversion
    const quality = selectedOperations.has('compress')
        ? parseInt(document.getElementById('compress-quality').value) / 100
        : 1;
    
    const format = selectedOperations.has('format')
        ? document.getElementById('output-format').value
        : 'png';

    // Final render
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    ctx.drawImage(currentImage, 0, 0);

    return { canvas, format };
} 