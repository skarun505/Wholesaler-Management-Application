// Trade Data Management JavaScript

let tradeData = [];
let filteredData = [];
let currentEditId = null;

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    const currentUser = checkAuth();
    if (!currentUser) return;

    updateUserInfo(currentUser);
    loadTradeData();
    initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    // Search and filters
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('qualityFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);

    // Modal controls
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('editForm').addEventListener('submit', saveEdit);

    // Weight entry options
    const weightOptions = document.querySelectorAll('input[name="weightOption"]');
    weightOptions.forEach(option => {
        option.addEventListener('change', toggleWeightEntry);
    });

    // Generate bag inputs
    document.getElementById('generateBagInputs').addEventListener('click', generateBagInputs);

    // Bill image preview
    document.getElementById('billImage').addEventListener('change', previewBillImage);

    // Download report
    document.getElementById('downloadReportBtn').addEventListener('click', downloadQualityReport);

    // Close modal on outside click
    document.getElementById('editModal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
}

// Load trade data from localStorage
function loadTradeData() {
    tradeData = JSON.parse(localStorage.getItem('tradeData')) || [];
    filteredData = [...tradeData];
    renderTradeData();
}

// Render trade data table
function renderTradeData() {
    const tableBody = document.getElementById('tradeDataTable');
    const recordCount = document.getElementById('recordCount');

    recordCount.textContent = `${filteredData.length} record${filteredData.length !== 1 ? 's' : ''}`;

    if (filteredData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" class="empty-state">No data found. Try adjusting filters.</td></tr>';
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const canDelete = currentUser.role === 'admin';

    tableBody.innerHTML = filteredData.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.lotCode || 'N/A'}</td>
            <td>${item.commissionAgent || 'N/A'}</td>
            <td>${item.commodity || 'N/A'}</td>
            <td>${item.noOfBags || 0}</td>
            <td>₹${item.tradePrice || 0}</td>
            <td>${item.quality || '-'}</td>
            <td>${item.totalWeight ? item.totalWeight.toFixed(2) : '-'}</td>
            <td>
                <span class="status ${item.deliveryStatus === 'Delivered' ? 'status-delivered' : 'status-pending'}">
                    ${item.deliveryStatus || 'Pending'}
                </span>
            </td>
            <td>
                <button class="btn-sm btn-edit" onclick="openEditModal(${item.id})">Edit</button>
                ${canDelete ? `<button class="btn-sm btn-delete" onclick="deleteRecord(${item.id})">Delete</button>` : ''}
            </td>
        </tr>
    `).join('');
}

// Apply filters
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const qualityFilter = document.getElementById('qualityFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredData = tradeData.filter(item => {
        const matchSearch = !search ||
            (item.lotCode && item.lotCode.toLowerCase().includes(search)) ||
            (item.commissionAgent && item.commissionAgent.toLowerCase().includes(search)) ||
            (item.commodity && item.commodity.toLowerCase().includes(search));

        const matchQuality = !qualityFilter || item.quality === qualityFilter;
        const matchStatus = !statusFilter || item.deliveryStatus === statusFilter;

        return matchSearch && matchQuality && matchStatus;
    });

    renderTradeData();
}

// Open edit modal
function openEditModal(id) {
    const item = tradeData.find(i => i.id === id);
    if (!item) return;

    currentEditId = id;

    // Populate form
    document.getElementById('editId').value = item.id;
    document.getElementById('editLotCode').value = item.lotCode || '';
    document.getElementById('editAgent').value = item.commissionAgent || '';
    document.getElementById('editCommodity').value = item.commodity || '';
    document.getElementById('editBags').value = item.noOfBags || 0;
    document.getElementById('editTradePrice').value = item.tradePrice || 0;
    document.getElementById('editQuality').value = item.quality || '';
    document.getElementById('editDeliveryStatus').value = item.deliveryStatus || 'Pending';

    // Set weight entry
    if (item.weights && item.weights.length > 0) {
        document.querySelector('input[value="bagwise"]').checked = true;
        toggleWeightEntry();
        document.getElementById('numWeightBags').value = item.weights.length;
        generateBagInputs();
        item.weights.forEach((weight, index) => {
            const input = document.getElementById(`bagWeight${index}`);
            if (input) input.value = weight;
        });
    } else if (item.totalWeight) {
        document.querySelector('input[value="total"]').checked = true;
        toggleWeightEntry();
        document.getElementById('totalWeight').value = item.totalWeight;
    }

    updateCalculatedWeight();

    // Show bill image if exists
    if (item.billImage) {
        const billPreview = document.getElementById('billPreview');
        billPreview.innerHTML = `
            <span class="bill-preview-label">Current Bill Image:</span>
            <img src="${item.billImage}" alt="Bill Image">
        `;
    }

    // Check permissions
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isStaff = currentUser.role === 'staff';

    if (isStaff) {
        // Staff can only edit specific fields
        document.getElementById('editBags').disabled = false;
        document.getElementById('editTradePrice').disabled = false;
        document.getElementById('editQuality').disabled = false;
        document.getElementById('editDeliveryStatus').disabled = false;
    }

    // Show modal
    document.getElementById('editModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editForm').reset();
    document.getElementById('bagWeightsContainer').innerHTML = '';
    document.getElementById('billPreview').innerHTML = '';
    document.getElementById('calculatedWeight').textContent = '0';
    currentEditId = null;
}

// Toggle weight entry method
function toggleWeightEntry() {
    const selectedOption = document.querySelector('input[name="weightOption"]:checked').value;

    if (selectedOption === 'bagwise') {
        document.getElementById('bagwiseEntry').style.display = 'block';
        document.getElementById('totalWeightEntry').style.display = 'none';
        document.getElementById('totalWeight').value = '';
    } else {
        document.getElementById('bagwiseEntry').style.display = 'none';
        document.getElementById('totalWeightEntry').style.display = 'block';
        document.getElementById('bagWeightsContainer').innerHTML = '';
    }

    updateCalculatedWeight();
}

// Generate bag weight inputs
function generateBagInputs() {
    const numBags = parseInt(document.getElementById('numWeightBags').value);
    const container = document.getElementById('bagWeightsContainer');

    if (!numBags || numBags < 1) {
        alert('Please enter a valid number of bags');
        return;
    }

    container.innerHTML = '';

    for (let i = 0; i < numBags; i++) {
        const div = document.createElement('div');
        div.className = 'bag-weight-input';
        div.innerHTML = `
            <label>Bag ${i + 1} (kg)</label>
            <input type="number" step="0.01" id="bagWeight${i}" oninput="updateCalculatedWeight()">
        `;
        container.appendChild(div);
    }
}

// Update calculated weight
function updateCalculatedWeight() {
    let totalWeight = 0;
    const selectedOption = document.querySelector('input[name="weightOption"]:checked').value;

    if (selectedOption === 'bagwise') {
        const inputs = document.querySelectorAll('#bagWeightsContainer input');
        inputs.forEach(input => {
            const value = parseFloat(input.value);
            if (!isNaN(value)) totalWeight += value;
        });
    } else {
        totalWeight = parseFloat(document.getElementById('totalWeight').value) || 0;
    }

    document.getElementById('calculatedWeight').textContent = totalWeight.toFixed(2);
}

// Preview bill image
function previewBillImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const billPreview = document.getElementById('billPreview');
        billPreview.innerHTML = `
            <span class="bill-preview-label">New Bill Image:</span>
            <img src="${event.target.result}" alt="Bill Image">
        `;
    };
    reader.readAsDataURL(file);
}

// Save edited data
function saveEdit(e) {
    e.preventDefault();

    const id = currentEditId;
    const item = tradeData.find(i => i.id === id);
    if (!item) return;

    // Update allowed fields
    item.noOfBags = parseInt(document.getElementById('editBags').value);
    item.tradePrice = parseFloat(document.getElementById('editTradePrice').value);
    item.quality = document.getElementById('editQuality').value;
    item.deliveryStatus = document.getElementById('editDeliveryStatus').value;

    // Update weights
    const selectedOption = document.querySelector('input[name="weightOption"]:checked').value;

    if (selectedOption === 'bagwise') {
        const inputs = document.querySelectorAll('#bagWeightsContainer input');
        item.weights = Array.from(inputs).map(input => parseFloat(input.value) || 0);
        item.totalWeight = item.weights.reduce((sum, w) => sum + w, 0);
    } else {
        item.totalWeight = parseFloat(document.getElementById('totalWeight').value) || 0;
        item.weights = [];
    }

    // Update bill image if new one uploaded
    const billFile = document.getElementById('billImage').files[0];
    if (billFile) {
        const reader = new FileReader();
        reader.onload = function (event) {
            item.billImage = event.target.result;
            saveToLocalStorage();
        };
        reader.readAsDataURL(billFile);
    } else {
        saveToLocalStorage();
    }

    function saveToLocalStorage() {
        localStorage.setItem('tradeData', JSON.stringify(tradeData));
        closeModal();
        loadTradeData();
        alert('Record updated successfully!');
    }
}

// Delete record (admin only)
function deleteRecord(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    tradeData = tradeData.filter(item => item.id !== id);
    localStorage.setItem('tradeData', JSON.stringify(tradeData));
    loadTradeData();
}

// Download quality report
function downloadQualityReport() {
    if (tradeData.length === 0) {
        alert('No data available for report');
        return;
    }

    // Group by quality
    const qualityGroups = {};
    tradeData.forEach(item => {
        const quality = item.quality || 'Unspecified';
        if (!qualityGroups[quality]) {
            qualityGroups[quality] = {
                rows: [],
                totalBags: 0,
                totalWeight: 0
            };
        }
        qualityGroups[quality].rows.push(item);
        qualityGroups[quality].totalBags += item.noOfBags || 0;
        qualityGroups[quality].totalWeight += item.totalWeight || 0;
    });

    // Generate CSV
    let csv = 'Quality Report\n\n';

    Object.keys(qualityGroups).forEach(quality => {
        const group = qualityGroups[quality];
        csv += `\nQuality: ${quality}\n`;
        csv += `Total Bags: ${group.totalBags}\n`;
        csv += `Total Weight: ${group.totalWeight.toFixed(2)} kg\n\n`;
        csv += 'Lot Code,Commission Agent,Commodity,Bags,Weight (kg),Trade Price\n';

        group.rows.forEach(row => {
            csv += `${row.lotCode},${row.commissionAgent},${row.commodity},${row.noOfBags},${row.totalWeight || 0},${row.tradePrice}\n`;
        });
        csv += '\n';
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quality_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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

// Add total weight input listener
document.addEventListener('DOMContentLoaded', function () {
    const totalWeightInput = document.getElementById('totalWeight');
    if (totalWeightInput) {
        totalWeightInput.addEventListener('input', updateCalculatedWeight);
    }
});
