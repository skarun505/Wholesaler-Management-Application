// Quality-Based Billing Calculator JavaScript

const DELIVERY_CHARGE = 720; // Fixed delivery charge
const WASTAGE_PERCENT = 8; // 8% wastage

let qualityData = {};

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    const currentUser = checkAuth();
    if (!currentUser) return;

    updateUserInfo(currentUser);
    loadQualities();
    initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', calculateBilling);

    // Repacked charge input
    document.getElementById('repackedCharge').addEventListener('input', updateFinalPrice);

    // Print button
    document.getElementById('printBillingBtn').addEventListener('click', printBilling);
}

// Load available qualities
function loadQualities() {
    const tradeData = JSON.parse(localStorage.getItem('tradeData')) || [];
    const qualities = [...new Set(tradeData.map(item => item.quality).filter(q => q))];

    const qualitySelect = document.getElementById('selectedQuality');

    if (qualities.length === 0) {
        qualitySelect.innerHTML = '<option value="">No qualities available - Add trade data first</option>';
        qualitySelect.disabled = true;
        return;
    }

    qualitySelect.innerHTML = '<option value="">Select Quality</option>' +
        qualities.map(q => `<option value="${q}">${q}</option>`).join('');
}

// Calculate billing for selected quality
function calculateBilling() {
    const selectedQuality = document.getElementById('selectedQuality').value;

    if (!selectedQuality) {
        alert('Please select a quality');
        return;
    }

    const tradeData = JSON.parse(localStorage.getItem('tradeData')) || [];
    const qualityItems = tradeData.filter(item => item.quality === selectedQuality);

    if (qualityItems.length === 0) {
        alert('No data found for this quality');
        return;
    }

    // Calculate totals
    const totalWeight = qualityItems.reduce((sum, item) => sum + (item.totalWeight || 0), 0);
    const totalBags = qualityItems.reduce((sum, item) => sum + (item.noOfBags || 0), 0);

    // Get average trade price (or you can use first item's price)
    const tradePrice = qualityItems[0].tradePrice || 0;

    // Store quality data
    qualityData = {
        quality: selectedQuality,
        totalWeight,
        totalBags,
        tradePrice,
        items: qualityItems
    };

    // Display results
    displayBillingResults();
}

// Display billing results
function displayBillingResults() {
    const resultsCard = document.getElementById('billingResultsCard');

    // Update quality name
    document.getElementById('billingQuality').textContent = qualityData.quality;

    // Update summary table
    document.getElementById('tradePrice').textContent = qualityData.tradePrice.toLocaleString('en-IN');
    document.getElementById('totalWeight').textContent = qualityData.totalWeight.toFixed(2);
    document.getElementById('totalBags').textContent = qualityData.totalBags;
    document.getElementById('qualityPrice').textContent = qualityData.tradePrice.toLocaleString('en-IN');

    // Calculate and display prices
    calculatePrices();

    // Display lot breakdown
    displayLotBreakdown();

    // Show results card
    resultsCard.style.display = 'block';

    // Scroll to results
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Calculate all prices
function calculatePrices() {
    // Base Price = (Total Weight / 100) × Trade Price
    const basePrice = (qualityData.totalWeight / 100) * qualityData.tradePrice;

    // Wastage = 8% of Base Price
    const wastage = basePrice * (WASTAGE_PERCENT / 100);

    // Update display
    document.getElementById('basePrice').textContent = basePrice.toFixed(2);
    document.getElementById('wastage').textContent = wastage.toFixed(2);
    document.getElementById('deliveryCharge').textContent = DELIVERY_CHARGE.toFixed(2);

    // Update final price calculation
    updateFinalPrice();
}

// Update final price
function updateFinalPrice() {
    const basePrice = parseFloat(document.getElementById('basePrice').textContent);
    const wastage = parseFloat(document.getElementById('wastage').textContent);
    const deliveryCharge = DELIVERY_CHARGE;
    const repackedCharge = parseFloat(document.getElementById('repackedCharge').value) || 0;

    // Calculate final price
    const finalPrice = basePrice + wastage + deliveryCharge + repackedCharge;

    // Update price breakdown
    document.getElementById('finalBase').textContent = basePrice.toFixed(2);
    document.getElementById('finalWastage').textContent = wastage.toFixed(2);
    document.getElementById('finalDelivery').textContent = deliveryCharge.toFixed(2);
    document.getElementById('finalRepacked').textContent = repackedCharge.toFixed(2);
    document.getElementById('finalPrice').textContent = finalPrice.toFixed(2);
}

// Display lot-wise breakdown
function displayLotBreakdown() {
    const tableBody = document.getElementById('lotBreakdownTable');

    tableBody.innerHTML = qualityData.items.map(item => `
        <tr>
            <td>${item.lotCode || 'N/A'}</td>
            <td>${item.commissionAgent || 'N/A'}</td>
            <td>${item.commodity || 'N/A'}</td>
            <td>${item.noOfBags || 0}</td>
            <td>${item.totalWeight ? item.totalWeight.toFixed(2) : '-'}</td>
            <td>₹${item.tradePrice ? item.tradePrice.toLocaleString('en-IN') : 0}</td>
        </tr>
    `).join('');
}

// Print billing summary
function printBilling() {
    if (!qualityData.quality) {
        alert('Please calculate billing first');
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
