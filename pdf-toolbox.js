// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Tool navigation
document.querySelectorAll('.tool-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-gradient-to-r', 'from-blue-500', 'to-indigo-500', 'text-white');
            btn.classList.add('bg-gray-800/50', 'text-gray-300');
        });
        button.classList.remove('bg-gray-800/50', 'text-gray-300');
        button.classList.add('active', 'bg-gradient-to-r', 'from-blue-500', 'to-indigo-500', 'text-white');

        // Show selected tool content
        const tool = button.dataset.tool;
        document.querySelectorAll('.tool-content').forEach(content => {
            content.classList.add('hidden');
            content.classList.remove('active');
        });
        document.getElementById(`${tool}-tool`).classList.remove('hidden');
        document.getElementById(`${tool}-tool`).classList.add('active');
    });
});

// Mobile menu
document.getElementById('menu-btn').addEventListener('click', () => {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
    menu.classList.toggle('opacity-0');
    setTimeout(() => {
        if (!menu.classList.contains('hidden')) {
            menu.classList.remove('opacity-0');
        }
    }, 10);
});

// PDF Merge Tool
const mergeFiles = [];
document.getElementById('merge-files').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    mergeFiles.length = 0;
    mergeFiles.push(...files);
    
    const container = document.getElementById('merge-files-container');
    container.innerHTML = '';
    
    files.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3 bg-gray-900/50 rounded-lg';
        div.innerHTML = `
            <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                <span class="text-gray-300">${file.name}</span>
            </div>
            <div class="flex items-center space-x-2">
                <button class="move-up text-gray-400 hover:text-white" ${index === 0 ? 'disabled' : ''}>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                </button>
                <button class="move-down text-gray-400 hover:text-white" ${index === files.length - 1 ? 'disabled' : ''}>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
            </div>
        `;
        container.appendChild(div);
    });
    
    document.getElementById('merge-file-list').classList.remove('hidden');
});

document.getElementById('merge-button').addEventListener('click', async () => {
    if (mergeFiles.length === 0) return;
    
    const mergedPdf = await PDFLib.PDFDocument.create();
    
    for (const file of mergeFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
    }
    
    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'merged.pdf');
});

// PDF Split Tool
document.getElementById('split-button').addEventListener('click', async () => {
    const file = document.getElementById('split-file').files[0];
    if (!file) return;
    
    const pages = document.getElementById('split-pages').value;
    if (!pages) return;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const pageIndices = parsePageRange(pages, pdfDoc.getPageCount());
    
    const newPdf = await PDFLib.PDFDocument.create();
    const pagesToCopy = await newPdf.copyPages(pdfDoc, pageIndices);
    pagesToCopy.forEach(page => newPdf.addPage(page));
    
    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'split.pdf');
});

// PDF to Images Tool
document.getElementById('convert-to-images-button').addEventListener('click', async () => {
    const file = document.getElementById('pdf-to-images-file').files[0];
    if (!file) return;
    
    const format = document.getElementById('image-format').value;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const zip = new JSZip();
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        const imageData = canvas.toDataURL(`image/${format}`);
        const base64Data = imageData.replace(`data:image/${format};base64,`, '');
        zip.file(`page-${i}.${format}`, base64Data, { base64: true });
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'pdf-pages.zip');
});

// Images to PDF Tool
document.getElementById('convert-to-pdf-button').addEventListener('click', async () => {
    const files = document.getElementById('images-to-pdf-files').files;
    if (files.length === 0) return;
    
    const pageSize = document.getElementById('page-size').value;
    const { width, height } = getPageDimensions(pageSize);
    
    const pdf = new jspdf.jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: pageSize
    });
    
    for (let i = 0; i < files.length; i++) {
        if (i > 0) pdf.addPage();
        
        const file = files[i];
        const img = await createImageBitmap(file);
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        const ratio = Math.min(width / imgWidth, height / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        
        const x = (width - finalWidth) / 2;
        const y = (height - finalHeight) / 2;
        
        const canvas = document.createElement('canvas');
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        pdf.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', x, y, finalWidth, finalHeight);
    }
    
    pdf.save('images.pdf');
});

// Redact PDF Tool
let redactMode = 'rect';
let isDrawing = false;
let startX, startY;
const redactCanvas = document.getElementById('redact-canvas');
const redactCtx = redactCanvas.getContext('2d');

document.getElementById('redact-rect').addEventListener('click', () => {
    redactMode = 'rect';
    document.getElementById('redact-rect').classList.add('bg-blue-600');
    document.getElementById('redact-text').classList.remove('bg-blue-600');
});

document.getElementById('redact-text').addEventListener('click', () => {
    redactMode = 'text';
    document.getElementById('redact-text').classList.add('bg-blue-600');
    document.getElementById('redact-rect').classList.remove('bg-blue-600');
});

redactCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = redactCanvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
});

redactCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const rect = redactCanvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    redactCtx.clearRect(0, 0, redactCanvas.width, redactCanvas.height);
    redactCtx.fillStyle = document.getElementById('redact-color').value;
    
    if (redactMode === 'rect') {
        redactCtx.fillRect(startX, startY, currentX - startX, currentY - startY);
    }
});

redactCanvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

document.getElementById('redact-button').addEventListener('click', async () => {
    const file = document.getElementById('redact-file').files[0];
    if (!file) return;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    
    // Apply redactions to each page
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        
        // Scale canvas coordinates to PDF coordinates
        const scaleX = width / redactCanvas.width;
        const scaleY = height / redactCanvas.height;
        
        // Get redaction data from canvas
        const imageData = redactCtx.getImageData(0, 0, redactCanvas.width, redactCanvas.height);
        const pixels = imageData.data;
        
        // Create redaction rectangles
        for (let y = 0; y < redactCanvas.height; y++) {
            for (let x = 0; x < redactCanvas.width; x++) {
                const index = (y * redactCanvas.width + x) * 4;
                if (pixels[index + 3] > 0) { // If pixel is not transparent
                    page.drawRectangle({
                        x: x * scaleX,
                        y: height - (y * scaleY),
                        width: scaleX,
                        height: scaleY,
                        color: PDFLib.rgb(0, 0, 0),
                        opacity: 1
                    });
                }
            }
        }
    }
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'redacted.pdf');
});

// Add Signature Tool
let isDrawingSignature = false;
let signaturePoints = [];
const signatureCanvas = document.getElementById('signature-canvas');
const signatureCtx = signatureCanvas.getContext('2d');

document.getElementById('draw-signature').addEventListener('click', () => {
    signatureCanvas.style.cursor = 'crosshair';
    document.getElementById('signature-text').disabled = true;
});

document.getElementById('add-text').addEventListener('click', () => {
    signatureCanvas.style.cursor = 'default';
    document.getElementById('signature-text').disabled = false;
});

signatureCanvas.addEventListener('mousedown', (e) => {
    if (signatureCanvas.style.cursor !== 'crosshair') return;
    
    isDrawingSignature = true;
    const rect = signatureCanvas.getBoundingClientRect();
    signaturePoints = [[e.clientX - rect.left, e.clientY - rect.top]];
});

signatureCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawingSignature) return;
    
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    signaturePoints.push([x, y]);
    
    signatureCtx.beginPath();
    signatureCtx.moveTo(signaturePoints[signaturePoints.length - 2][0], signaturePoints[signaturePoints.length - 2][1]);
    signatureCtx.lineTo(x, y);
    signatureCtx.strokeStyle = '#000000';
    signatureCtx.lineWidth = 2;
    signatureCtx.stroke();
});

signatureCanvas.addEventListener('mouseup', () => {
    isDrawingSignature = false;
});

document.getElementById('save-signature-button').addEventListener('click', async () => {
    const file = document.getElementById('signature-file').files[0];
    if (!file) return;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const page = pdfDoc.getPage(0);
    
    if (signatureCanvas.style.cursor === 'crosshair') {
        // Add signature
        const signatureImage = await pdfDoc.embedPng(signatureCanvas.toDataURL());
        page.drawImage(signatureImage, {
            x: 50,
            y: 50,
            width: 200,
            height: 100
        });
    } else {
        // Add text
        const text = document.getElementById('signature-text').value;
        page.drawText(text, {
            x: 50,
            y: 50,
            size: 20
        });
    }
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'signed.pdf');
});

// Compress PDF Tool
document.getElementById('compress-button').addEventListener('click', async () => {
    const file = document.getElementById('compress-file').files[0];
    if (!file) return;
    
    const compressionLevel = document.getElementById('compression-level').value;
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    
    // Apply compression based on level
    const quality = {
        low: 1.0,
        medium: 0.7,
        high: 0.5
    }[compressionLevel];
    
    // Compress images
    const pages = pdfDoc.getPages();
    for (const page of pages) {
        const images = await page.getImages();
        for (const image of images) {
            const imageBytes = await image.embed();
            const compressedImage = await imageBytes.compress(quality);
            await image.setImage(compressedImage);
        }
    }
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, 'compressed.pdf');
});

// PDF Viewer Tool
let currentPdf = null;
let currentPage = 1;

document.getElementById('viewer-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const arrayBuffer = await file.arrayBuffer();
    currentPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    currentPage = 1;
    
    document.getElementById('pdf-viewer-container').classList.remove('hidden');
    updatePageInfo();
    renderPage();
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updatePageInfo();
        renderPage();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < currentPdf.numPages) {
        currentPage++;
        updatePageInfo();
        renderPage();
    }
});

let zoomLevel = 1.0;
document.getElementById('zoom-in').addEventListener('click', () => {
    zoomLevel *= 1.2;
    renderPage();
});

document.getElementById('zoom-out').addEventListener('click', () => {
    zoomLevel /= 1.2;
    renderPage();
});

async function renderPage() {
    const page = await currentPdf.getPage(currentPage);
    const viewport = page.getViewport({ scale: zoomLevel });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;
    
    const viewer = document.getElementById('pdf-viewer');
    viewer.innerHTML = '';
    viewer.appendChild(canvas);
}

function updatePageInfo() {
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${currentPdf.numPages}`;
}

// Helper Functions
function parsePageRange(range, maxPages) {
    const pages = new Set();
    const parts = range.split(',');
    
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) {
                if (i > 0 && i <= maxPages) pages.add(i - 1);
            }
        } else {
            const page = Number(part);
            if (page > 0 && page <= maxPages) pages.add(page - 1);
        }
    }
    
    return Array.from(pages);
}

function getPageDimensions(size) {
    const dimensions = {
        a4: { width: 210, height: 297 },
        letter: { width: 216, height: 279 },
        legal: { width: 216, height: 356 }
    };
    return dimensions[size] || dimensions.a4;
}

// Drag and drop functionality
document.querySelectorAll('input[type="file"]').forEach(input => {
    const dropZone = input.previousElementSibling;
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-blue-500');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-blue-500');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-blue-500');
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
    });
}); 