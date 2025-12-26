// Upload and OCR Processing for BMW Chilly Management

let selectedFile = null;
let extractedData = [];

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    const currentUser = checkAuth();
    if (!currentUser) return;

    updateUserInfo(currentUser);
    initializeUploadZone();
});

// Initialize upload zone with drag & drop
function initializeUploadZone() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');

    // Click to browse
    browseBtn.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('click', (e) => {
        if (e.target !== browseBtn) fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag & drop events
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect({ target: { files: files } });
        }
    });

    // Remove file button
    document.getElementById('removeFileBtn').addEventListener('click', removeFile);

    // Process button
    document.getElementById('processBtn').addEventListener('click', processFile);

    // Save data button
    document.getElementById('saveDataBtn').addEventListener('click', saveExtractedData);

    // Add row button
    document.getElementById('addRowBtn').addEventListener('click', addNewRow);
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit');
        return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PDF, JPG, or PNG file.');
        return;
    }

    selectedFile = file;
    showFilePreview(file);
}

// Show file preview
function showFilePreview(file) {
    const uploadZone = document.getElementById('uploadZone');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');

    uploadZone.style.display = 'none';
    filePreview.style.display = 'block';

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
}

// Remove selected file
function removeFile() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadZone').style.display = 'block';
    document.getElementById('filePreview').style.display = 'none';
    document.getElementById('extractedDataCard').style.display = 'none';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Process file with OCR
async function processFile() {
    if (!selectedFile) return;

    // Show processing card
    document.getElementById('processingCard').style.display = 'block';
    document.getElementById('extractedDataCard').style.display = 'none';

    try {
        let imageUrl;

        // If PDF, convert first page to image
        if (selectedFile.type === 'application/pdf') {
            updateProcessingText('Converting PDF to image...');
            imageUrl = await convertPDFToImage(selectedFile);
        } else {
            imageUrl = URL.createObjectURL(selectedFile);
        }

        // Perform OCR
        updateProcessingText('Extracting text with OCR...');
        const text = await performOCR(imageUrl);

        // Parse extracted text
        updateProcessingText('Parsing trade data...');
        await delay(500);
        extractedData = parseTradeData(text);

        // Show extracted data
        updateProcessingText('Complete!');
        await delay(500);

        document.getElementById('processingCard').style.display = 'none';
        showExtractedData(extractedData);

    } catch (error) {
        console.error('OCR Error:', error);
        alert('Error processing file. Please try again or enter data manually.');
        document.getElementById('processingCard').style.display = 'none';
    }
}

// Convert PDF to image (simplified - first page only)
async function convertPDFToImage(file) {
    // For demo purposes, we'll use a placeholder
    // In production, use pdf.js library
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Create a canvas placeholder for PDF (demo)
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 1000;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.fillText('PDF Preview - Demo Mode', 50, 50);
            resolve(canvas.toDataURL());
        };
        reader.readAsDataURL(file);
    });
}

// Perform OCR using Tesseract.js
async function performOCR(imageUrl) {
    return new Promise((resolve, reject) => {
        Tesseract.recognize(imageUrl, 'eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    const progress = Math.round(m.progress * 100);
                    document.getElementById('progressFill').style.width = progress + '%';
                }
            }
        }).then(({ data: { text } }) => {
            resolve(text);
        }).catch(reject);
    });
}

// Parse trade data from OCR text
function parseTradeData(text) {
    // Demo parsing logic - in production, use more sophisticated parsing
    const lines = text.split('\n').filter(line => line.trim());
    const data = [];

    // For demo, create sample parsed data
    // In production, implement actual parsing logic based on APMC format
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i];
        data.push({
            id: Date.now() + i,
            lotCode: `LOT${String(i + 1).padStart(3, '0')}`,
            commissionAgent: extractAgentName(line) || 'Agent ' + (i + 1),
            commodity: 'Dry Red Chilly',
            noOfBags: Math.floor(Math.random() * 50) + 10,
            tradePrice: Math.floor(Math.random() * 5000) + 10000
        });
    }

    // If no data extracted, provide template
    if (data.length === 0) {
        data.push({
            id: Date.now(),
            lotCode: 'LOT001',
            commissionAgent: '',
            commodity: 'Dry Red Chilly',
            noOfBags: 0,
            tradePrice: 0
        });
    }

    return data;
}

// Extract agent name from text (simplified)
function extractAgentName(text) {
    const words = text.split(/\s+/);
    if (words.length >= 2) {
        return words.slice(0, 2).join(' ');
    }
    return null;
}

// Update processing text
function updateProcessingText(text) {
    document.getElementById('processingText').textContent = text;
}

// Delay helper
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Show extracted data in editable table
function showExtractedData(data) {
    const tableBody = document.getElementById('extractedTableBody');
    const card = document.getElementById('extractedDataCard');

    tableBody.innerHTML = data.map((item, index) => `
        <tr data-id="${item.id}">
            <td>${index + 1}</td>
            <td><input type="text" value="${item.lotCode}" data-field="lotCode"></td>
            <td><input type="text" value="${item.commissionAgent}" data-field="commissionAgent"></td>
            <td><input type="text" value="${item.commodity}" data-field="commodity"></td>
            <td><input type="number" value="${item.noOfBags}" data-field="noOfBags"></td>
            <td><input type="number" value="${item.tradePrice}" data-field="tradePrice"></td>
            <td>
                <button class="btn-delete" onclick="deleteRow(${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    card.style.display = 'block';

    // Add input event listeners
    const inputs = tableBody.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', updateExtractedData);
    });
}

// Update extracted data from inputs
function updateExtractedData(e) {
    const row = e.target.closest('tr');
    const id = parseInt(row.dataset.id);
    const field = e.target.dataset.field;
    const value = e.target.value;

    const item = extractedData.find(item => item.id === id);
    if (item) {
        item[field] = field === 'noOfBags' || field === 'tradePrice' ? parseFloat(value) : value;
    }
}

// Delete row
function deleteRow(id) {
    if (!confirm('Delete this row?')) return;

    extractedData = extractedData.filter(item => item.id !== id);
    showExtractedData(extractedData);
}

// Add new row
function addNewRow() {
    const newRow = {
        id: Date.now(),
        lotCode: '',
        commissionAgent: '',
        commodity: 'Dry Red Chilly',
        noOfBags: 0,
        tradePrice: 0
    };

    extractedData.push(newRow);
    showExtractedData(extractedData);
}

// Save extracted data to trade data
function saveExtractedData() {
    if (extractedData.length === 0) {
        alert('No data to save');
        return;
    }

    // Get existing trade data
    const existingData = JSON.parse(localStorage.getItem('tradeData')) || [];

    // Add new data
    const updatedData = [...existingData, ...extractedData.map(item => ({
        ...item,
        quality: '',
        totalWeight: 0,
        deliveryStatus: 'Pending',
        weights: [],
        billImage: null
    }))];

    // Save to localStorage
    localStorage.setItem('tradeData', JSON.stringify(updatedData));

    alert('Data saved successfully!');

    // Redirect to trade data page
    setTimeout(() => {
        window.location.href = 'trade-data.html';
    }, 500);
}

// Update user info (from auth.js)
function updateUserInfo(user) {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) userName.textContent = user.fullName;
    if (userRole) userRole.textContent = user.role === 'admin' ? 'Administrator' : 'Staff Member';
    if (userAvatar) userAvatar.textContent = user.fullName.charAt(0).toUpperCase();
}
