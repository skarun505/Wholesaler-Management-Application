// Authentication System for BMW Chilly Management

// Demo user credentials
const DEMO_USERS = {
    admin: {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        fullName: 'Administrator'
    },
    staff: {
        username: 'staff',
        password: 'staff123',
        role: 'staff',
        fullName: 'Staff Member'
    }
};

// Check if user is already logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        // If on login page and already logged in, redirect to dashboard
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        }
        return user;
    } else {
        // If not on login page and not logged in, redirect to login
        if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
        return null;
    }
}

// Login function
function login(username, password, role) {
    // Check if credentials match demo users
    const user = Object.values(DEMO_USERS).find(
        u => u.username === username && u.password === password && u.role === role
    );

    if (user) {
        // Store user session
        localStorage.setItem('currentUser', JSON.stringify({
            username: user.username,
            role: user.role,
            fullName: user.fullName,
            loginTime: new Date().toISOString()
        }));
        return true;
    }
    return false;
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Check user permissions
function hasPermission(action) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return false;

    const permissions = {
        admin: {
            editAll: true,
            deleteRows: true,
            downloadReports: true,
            overrideStaff: true
        },
        staff: {
            editBags: true,
            editTradePrice: true,
            editQuality: true,
            editWeight: true,
            editDeliveryStatus: true,
            editAll: false,
            deleteRows: false,
            downloadReports: true,
            overrideStaff: false
        }
    };

    return permissions[currentUser.role][action] || false;
}

// Initialize login form if on login page
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        if (!username || !password || !role) {
            alert('Please fill in all fields');
            return;
        }

        if (login(username, password, role)) {
            // Success - redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials. Please check username, password, and role.');
        }
    });

    // Check if already logged in
    checkAuth();
}

// Initialize logout button
document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
