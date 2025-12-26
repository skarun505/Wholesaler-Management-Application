// Repacked Bags Calculator JavaScript

const DEFAULT_BAG_WEIGHT = 30; // Default bag weight in kg

let repackedRows = [];
let rowIdCounter = 1;

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    const currentUser = checkAuth();
    if (!currentUser) return;

    updateUserInfo(currentUser);
    loadSavedCalculation();
    initializeEventListeners();

    // Add initial row
    if (repackedRows.length === 0) {
        addRow();
    }
});

// Initialize event listeners
function initializeEventListeners() {
    // Add row button
    document.getElementById('addRowBtn').addEventListener('click', addRow);

    // Calculate percentage button
    document.getElementById('calculatePercentageBtn').addEventListener('click', calculatePercentage);

    // Quick action buttons
    document.getElementById('clearAllBtn').addEventListener('click', clearAllRows);
    document.getElementById('saveCalculationBtn').addEventListener('click', saveCalculation);
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    document.getElementById('printBtn').addEventListener('click', printReport);
}

// Add new row
function addRow() {
    const row = {
        id: rowIdCounter++,
        bags: 1,
        weight: DEFAULT_BAG_WEIGHT
    };

    repackedRows.push(row);
    renderTable();
    updateSummary();
}

// Render table
function renderTable() {
    const tableBody = document.getElementById('repackedTableBody');

    if (repackedRows.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No rows added yet. Click "Add Row" to start.</td></tr>';
        return;
    }

    tableBody.innerHTML = repackedRows.map((row, index) => {
        const subtotal = row.bags * row.weight;
        return `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <input 
                        type="number" 
                        value="${row.bags}" 
                        min="1" 
                        data-id="${row.id}" 
                        data-field="bags"
                        onchange="updateRow(this)"
                    >
                </td>
                <td>
                    <input 
                        type="number" 
                        value="${row.weight}" 
                        min="0" 
                        step="0.01" 
                        data-id="${row.id}" 
                        data-field="weight"
                        onchange="updateRow(this)"
                    >
                </td>
                <td class="subtotal-cell">${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn-sm btn-delete" onclick="deleteRow(${row.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update row data
function updateRow(input) {
    const id = parseInt(input.dataset.id);
    const field = input.dataset.field;
    const value = parseFloat(input.value);

    const row = repackedRows.find(r => r.id === id);
    if (row) {
        row[field] = value || 0;
        renderTable();
        updateSummary();
    }
}

// Delete row
function deleteRow(id) {
    if (repackedRows.length === 1) {
        alert('Cannot delete the last row. At least one row is required.');
        return;
    }

    if (!confirm('Delete this row?')) return;

    repackedRows = repackedRows.filter(r => r.id !== id);
    renderTable();
    updateSummary();
}

// Update summary
function updateSummary() {
    const totalRows = repackedRows.length;
    const totalBags = repackedRows.reduce((sum, row) => sum + row.bags, 0);
    const totalWeight = repackedRows.reduce((sum, row) => sum + (row.bags * row.weight), 0);

    document.getElementById('totalRows').textContent = totalRows;
    document.getElementById('totalBags').textContent = totalBags;
    document.getElementById('totalRepackedWeight').textContent = totalWeight.toFixed(2) + ' kg';
}

// Calculate value per kg
function calculatePercentage() {
    const finalPrice = parseFloat(document.getElementById('finalPrice').value);
    const totalWeight = repackedRows.reduce((sum, row) => sum + (row.bags * row.weight), 0);

    if (!finalPrice || finalPrice <= 0) {
        alert('Please enter a valid final price');
        return;
    }

    if (totalWeight === 0) {
        alert('Total repacked weight is zero. Please add rows with valid weights.');
        return;
    }

    // Calculate value: (Final Price ÷ Total Weight) × 100
    const valuePerKg = (finalPrice / totalWeight) * 100;

    // Display result
    document.getElementById('formulaPrice').textContent = finalPrice.toFixed(2);
    document.getElementById('formulaWeight').textContent = totalWeight.toFixed(2);
    document.getElementById('percentageValue').textContent = valuePerKg.toFixed(2);

    document.getElementById('percentageResult').style.display = 'block';

    // Scroll to result
    document.getElementById('percentageResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Clear all rows
function clearAllRows() {
    if (!confirm('Are you sure you want to clear all rows? This action cannot be undone.')) return;

    repackedRows = [];
    rowIdCounter = 1;
    addRow(); // Add one default row
    document.getElementById('finalPrice').value = '';
    document.getElementById('percentageResult').style.display = 'none';
}

// Save calculation
function saveCalculation() {
    const calculation = {
        rows: repackedRows,
        finalPrice: document.getElementById('finalPrice').value || '',
        savedAt: new Date().toISOString()
    };

    localStorage.setItem('repackedCalculation', JSON.stringify(calculation));
    alert('Calculation saved successfully!');
}

// Load saved calculation
function loadSavedCalculation() {
    const saved = localStorage.getItem('repackedCalculation');

    if (saved) {
        try {
            const calculation = JSON.parse(saved);

            if (calculation.rows && calculation.rows.length > 0) {
                repackedRows = calculation.rows;
                rowIdCounter = Math.max(...repackedRows.map(r => r.id)) + 1;

                if (calculation.finalPrice) {
                    document.getElementById('finalPrice').value = calculation.finalPrice;
                }

                renderTable();
                updateSummary();
            }
        } catch (e) {
            console.error('Error loading saved calculation:', e);
        }
    }
}

// Export to CSV
function exportToCSV() {
    if (repackedRows.length === 0) {
        alert('No data to export');
        return;
    }

    let csv = 'Repacked Bags Calculator Report\n\n';
    csv += 'Row,No of Bags,Net Weight (kg),Subtotal (kg)\n';

    repackedRows.forEach((row, index) => {
        const subtotal = row.bags * row.weight;
        csv += `${index + 1},${row.bags},${row.weight},${subtotal.toFixed(2)}\n`;
    });

    const totalBags = repackedRows.reduce((sum, row) => sum + row.bags, 0);
    const totalWeight = repackedRows.reduce((sum, row) => sum + (row.bags * row.weight), 0);

    csv += '\nSummary\n';
    csv += `Total Rows,${repackedRows.length}\n`;
    csv += `Total Bags,${totalBags}\n`;
    csv += `Total Repacked Weight (kg),${totalWeight.toFixed(2)}\n`;

    const finalPrice = document.getElementById('finalPrice').value;
    if (finalPrice) {
        const valuePerKg = (parseFloat(finalPrice) / totalWeight) * 100;
        csv += `\nFinal Price,${finalPrice}\n`;
        csv += `Value per kg,₹${valuePerKg.toFixed(2)}\n`;
    }

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repacked_calculator_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// Print report
function printReport() {
    if (repackedRows.length === 0) {
        alert('No data to print');
        return;
    }

    window.print();
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
