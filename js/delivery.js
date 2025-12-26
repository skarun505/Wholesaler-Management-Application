// Delivery & Billing JavaScript

let deliveries = [];

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    const currentUser = checkAuth();
    if (!currentUser) return;

    updateUserInfo(currentUser);
    loadDeliveries();
    loadQualities();
    initializeEventListeners();

    // Set today's date as default
    document.getElementById('deliveryDate').valueAsDate = new Date();
});

// Initialize event listeners
function initializeEventListeners() {
    // Form submission
    document.getElementById('deliveryForm').addEventListener('submit', saveDelivery);

    // Bag count validation
    document.getElementById('bagCount').addEventListener('input', validateBagCount);

    // Modal controls
    document.getElementById('closePrintModal').addEventListener('click', closePrintModal);
    document.getElementById('cancelPrintBtn').addEventListener('click', closePrintModal);
    document.getElementById('confirmPrintBtn').addEventListener('click', printBill);

    // Select all checkbox
    document.getElementById('selectAll').addEventListener('change', toggleSelectAll);

    // Print button
    document.getElementById('printBillBtn').addEventListener('click', showPrintPreview);

    // Close modal on outside click
    document.getElementById('printModal').addEventListener('click', function (e) {
        if (e.target === this) closePrintModal();
    });
}

// Load available qualities from trade data
function loadQualities() {
    const tradeData = JSON.parse(localStorage.getItem('tradeData')) || [];
    const qualities = [...new Set(tradeData.map(item => item.quality).filter(q => q))];

    const qualitySelect = document.getElementById('qualityName');

    if (qualities.length === 0) {
        qualitySelect.innerHTML = '<option value="">No qualities available - Add trade data first</option>';
        qualitySelect.disabled = true;
    } else {
        qualitySelect.innerHTML = '<option value="">Select Quality</option>' +
            qualities.map(q => `<option value="${q}">${q}</option>`).join('');
    }
}

// Validate bag count (max 60 per vehicle)
function validateBagCount() {
    const bagCount = parseInt(document.getElementById('bagCount').value);
    const warning = document.getElementById('bagWarning');

    if (bagCount > 60) {
        warning.style.display = 'flex';
        document.getElementById('bagCountHelper').textContent = 'Exceeds maximum capacity!';
        document.getElementById('bagCountHelper').style.color = 'var(--danger)';
    } else {
        warning.style.display = 'none';
        document.getElementById('bagCountHelper').textContent = 'Max 60 bags per vehicle';
        document.getElementById('bagCountHelper').style.color = 'var(--text-muted)';
    }
}

// Save delivery entry
function saveDelivery(e) {
    e.preventDefault();

    const bagCount = parseInt(document.getElementById('bagCount').value);

    if (bagCount > 60) {
        if (!confirm('Bag count exceeds 60 bags (vehicle capacity). Do you want to continue?')) {
            return;
        }
    }

    const delivery = {
        id: Date.now(),
        date: document.getElementById('deliveryDate').value,
        shopName: document.getElementById('shopName').value,
        quality: document.getElementById('qualityName').value,
        bagCount: bagCount,
        vehicleNumber: document.getElementById('vehicleNumber').value || 'N/A',
        driverName: document.getElementById('driverName').value || 'N/A',
        notes: document.getElementById('notes').value || '',
        createdAt: new Date().toISOString()
    };

    deliveries.push(delivery);
    localStorage.setItem('deliveries', JSON.stringify(deliveries));

    alert('Delivery entry saved successfully!');
    document.getElementById('deliveryForm').reset();
    document.getElementById('deliveryDate').valueAsDate = new Date();
    loadDeliveries();
}

// Reset form
function resetForm() {
    document.getElementById('deliveryForm').reset();
    document.getElementById('deliveryDate').valueAsDate = new Date();
    document.getElementById('bagWarning').style.display = 'none';
}

// Load deliveries from localStorage
function loadDeliveries() {
    deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];
    renderDeliveries();
}

// Render deliveries table
function renderDeliveries() {
    const tableBody = document.getElementById('deliveriesTable');

    if (deliveries.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No deliveries recorded yet.</td></tr>';
        return;
    }

    // Show most recent first
    const sortedDeliveries = [...deliveries].reverse();

    tableBody.innerHTML = sortedDeliveries.map(delivery => `
        <tr>
            <td>
                <input type="checkbox" class="delivery-checkbox" data-id="${delivery.id}">
            </td>
            <td>${formatDate(delivery.date)}</td>
            <td>${delivery.shopName}</td>
            <td>${delivery.quality}</td>
            <td>${delivery.bagCount} bags</td>
            <td>${delivery.vehicleNumber}</td>
            <td>
                <button class="btn-sm btn-edit" onclick="viewDelivery(${delivery.id})">View</button>
                <button class="btn-sm btn-delete" onclick="deleteDelivery(${delivery.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Toggle select all checkboxes
function toggleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.delivery-checkbox');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// View delivery details
function viewDelivery(id) {
    const delivery = deliveries.find(d => d.id === id);
    if (!delivery) return;

    generateBillContent([delivery]);
    document.getElementById('printModal').classList.add('active');
}

// Show print preview for selected deliveries
function showPrintPreview() {
    const selectedCheckboxes = document.querySelectorAll('.delivery-checkbox:checked');

    if (selectedCheckboxes.length === 0) {
        alert('Please select at least one delivery to print');
        return;
    }

    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.dataset.id));
    const selectedDeliveries = deliveries.filter(d => selectedIds.includes(d.id));

    generateBillContent(selectedDeliveries);
    document.getElementById('printModal').classList.add('active');
}

// Generate bill content
function generateBillContent(deliveryList) {
    const billContent = document.getElementById('billContent');

    const billsHtml = deliveryList.map(delivery => `
        <div class="bill-page" style="page-break-after: always; margin-bottom: 40px;">
            <div class="bill-header">
                <h1>🌶️ BMW Dry Chilly Management</h1>
                <p>APMC Delivery Bill</p>
            </div>
            
            <div class="bill-info">
                <div class="bill-info-item">
                    <span class="bill-info-label">Bill No:</span>
                    <span class="bill-info-value">#${delivery.id}</span>
                </div>
                <div class="bill-info-item">
                    <span class="bill-info-label">Date:</span>
                    <span class="bill-info-value">${formatDate(delivery.date)}</span>
                </div>
                <div class="bill-info-item">
                    <span class="bill-info-label">Shop Name:</span>
                    <span class="bill-info-value">${delivery.shopName}</span>
                </div>
                <div class="bill-info-item">
                    <span class="bill-info-label">Vehicle No:</span>
                    <span class="bill-info-value">${delivery.vehicleNumber}</span>
                </div>
            </div>
            
            <table class="bill-table">
                <thead>
                    <tr>
                        <th>Sr No</th>
                        <th>Quality</th>
                        <th>Bag Count</th>
                        <th>Driver Name</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>${delivery.quality}</td>
                        <td>${delivery.bagCount} bags</td>
                        <td>${delivery.driverName}</td>
                    </tr>
                </tbody>
            </table>
            
            ${delivery.notes ? `
                <div style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                    <strong style="color: #333;">Notes:</strong>
                    <p style="color: #666; margin-top: 5px;">${delivery.notes}</p>
                </div>
            ` : ''}
            
            <div class="bill-footer">
                <div class="bill-signature">
                    <p>Authorized Signature</p>
                </div>
                <div class="bill-signature">
                    <p>Receiver's Signature</p>
                </div>
            </div>
        </div>
    `).join('');

    billContent.innerHTML = billsHtml;
}

// Close print modal
function closePrintModal() {
    document.getElementById('printModal').classList.remove('active');
}

// Print bill
function printBill() {
    window.print();
}

// Delete delivery
function deleteDelivery(id) {
    if (!confirm('Are you sure you want to delete this delivery?')) return;

    deliveries = deliveries.filter(d => d.id !== id);
    localStorage.setItem('deliveries', JSON.stringify(deliveries));
    loadDeliveries();
}

// Update user info
function updateUserInfo(user) {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) userName.textContent = user.fullName;
    if (userRole) userRole.textContent = user.role === 'admin' ? 'Administrator' : 'Staff Member';
    if (userAvatar) userAvatar.textContent = user.fullName.charAt(0).toUpperCase();
}
