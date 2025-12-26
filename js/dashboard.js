// Dashboard JavaScript for BMW Chilly Management

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    const currentUser = checkAuth();
    if (!currentUser) return;

    // Update user info in sidebar
    updateUserInfo(currentUser);

    // Load dashboard data
    loadDashboardData();

    // Setup refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDashboardData);
    }
});

// Update user info display
function updateUserInfo(user) {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) userName.textContent = user.fullName;
    if (userRole) userRole.textContent = user.role === 'admin' ? 'Administrator' : 'Staff Member';
    if (userAvatar) userAvatar.textContent = user.fullName.charAt(0).toUpperCase();
}

// Load dashboard statistics
function loadDashboardData() {
    // Get trade data from localStorage
    const tradeData = JSON.parse(localStorage.getItem('tradeData')) || [];

    // Calculate statistics
    const stats = calculateStats(tradeData);

    // Update stats cards
    document.getElementById('totalLots').textContent = stats.totalLots;
    document.getElementById('deliveredCount').textContent = stats.delivered;
    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('totalWeight').textContent = stats.totalWeight.toFixed(2);

    // Update recent activity table
    updateRecentActivity(tradeData.slice(0, 5)); // Show last 5 entries
}

// Calculate statistics from trade data
function calculateStats(data) {
    let stats = {
        totalLots: data.length,
        delivered: 0,
        pending: 0,
        totalWeight: 0
    };

    data.forEach(item => {
        if (item.deliveryStatus === 'Delivered') {
            stats.delivered++;
        } else {
            stats.pending++;
        }

        if (item.totalWeight) {
            stats.totalWeight += parseFloat(item.totalWeight);
        }
    });

    return stats;
}

// Update recent activity table
function updateRecentActivity(data) {
    const tableBody = document.getElementById('recentActivityTable');

    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No data available. Upload APMC file to get started.</td></tr>';
        return;
    }

    tableBody.innerHTML = data.map(item => `
        <tr>
            <td>${item.lotCode || 'N/A'}</td>
            <td>${item.commissionAgent || 'N/A'}</td>
            <td>${item.commodity || 'N/A'}</td>
            <td>${item.noOfBags || 0}</td>
            <td>₹${item.tradePrice || 0}</td>
            <td>
                <span class="status ${item.deliveryStatus === 'Delivered' ? 'status-delivered' : 'status-pending'}">
                    ${item.deliveryStatus || 'Pending'}
                </span>
            </td>
        </tr>
    `).join('');
}

// Initialize sample data for demo (optional - remove in production)
function initializeSampleData() {
    const existingData = localStorage.getItem('tradeData');
    if (!existingData) {
        const sampleData = [
            {
                id: 1,
                lotCode: 'LOT001',
                commissionAgent: 'Rajesh Traders',
                commodity: 'Dry Red Chilly',
                noOfBags: 50,
                tradePrice: 12000,
                quality: 'Grade A',
                totalWeight: 1500,
                deliveryStatus: 'Delivered'
            },
            {
                id: 2,
                lotCode: 'LOT002',
                commissionAgent: 'Kumar & Sons',
                commodity: 'Dry Red Chilly',
                noOfBags: 30,
                tradePrice: 11500,
                quality: 'Grade B',
                totalWeight: 900,
                deliveryStatus: 'Pending'
            }
        ];

        localStorage.setItem('tradeData', JSON.stringify(sampleData));
    }
}

// Uncomment to initialize sample data for demo
// initializeSampleData();
