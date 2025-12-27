# BMW Dry Chilly Management - Demo Web Application

A comprehensive local web application for managing APMC weekly winner lists, trade data, delivery, and billing workflows for dry chilly business operations.

## 🌟 Features

### 1. **User Authentication**
- Role-based access control (Admin & Staff)
- Different permissions for each role
- Demo credentials included

### 2. **APMC Data Upload & OCR**
- Upload PDF or image files
- Automatic text extraction using Tesseract.js
- Manual editing of extracted data
- Drag & drop file upload

### 3. **Trade Data Management**
- Editable trade records
- Quality assignment
- Bag-wise or total weight entry
- Mandatory bill image upload
- Delivery status tracking
- Quality-based filtering
- Export quality reports (CSV)

### 4. **Delivery & Billing**
- Create delivery entries
- Vehicle capacity validation (60 bags max)
- Quality-wise billing (one quality per bill)
- Print preview for delivery bills
- Multiple shop support

### 5. **Quality-Based Billing Calculator**
- Automatic price calculations
- Base price computation
- 8% wastage calculation
- Fixed delivery charge (₹720)
- Manual repacked charge entry
- Lot-wise breakdown
- Print billing summary

### 6. **Repacked Bags Calculator**
- Dynamic row management
- Default 30kg bag weight reference
- Auto-calculate subtotals
- Percentage calculation against final price
- Save/load calculations
- Export to CSV
- Print reports

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- No installation required - runs entirely in the browser!

### How to Use

1. **Open the Application**
   - Navigate to the project folder
   - Double-click on `index.html` to open in your browser
   - Or right-click → Open with → Your preferred browser

2. **Login**
   - Use demo credentials:
     - **Admin**: username: `admin`, password: `admin123`
     - **Staff**: username: `staff`, password: `staff123`
   - Select appropriate role

3. **Workflow**
   ```
   Login → Upload APMC File → Edit Trade Data → 
   Add Weights & Quality → Delivery Entry → 
   Quality Billing → Repacked Calculator
   ```

## 👥 User Roles & Permissions

### Admin
- ✅ Full access to all features
- ✅ Can edit all fields
- ✅ Can delete rows
- ✅ Can download all reports
- ✅ Can override staff entries

### Staff
- ✅ Can edit: Bags, Trade Price, Quality, Weight, Delivery Status
- ❌ Cannot edit: Lot Code, Commission Agent, Commodity
- ❌ Cannot delete original OCR rows
- ✅ Can download reports

## 📁 Project Structure

```
BMW Demo App/
├── index.html              # Login page
├── dashboard.html          # Main dashboard
├── upload.html             # APMC file upload & OCR
├── trade-data.html         # Trade data management
├── delivery.html           # Delivery & billing entry
├── quality-billing.html    # Quality-based billing calculator
├── repacked.html           # Repacked bags calculator
├── css/
│   ├── style.css          # Main design system
│   ├── upload.css         # Upload page styles
│   ├── trade-data.css     # Trade data styles
│   ├── delivery.css       # Delivery page styles
│   ├── quality-billing.css # Billing calculator styles
│   └── repacked.css       # Repacked calculator styles
└── js/
    ├── auth.js            # Authentication system
    ├── dashboard.js       # Dashboard logic
    ├── upload.js          # File upload & OCR
    ├── trade-data.js      # Trade data management
    ├── delivery.js        # Delivery management
    ├── quality-billing.js # Billing calculations
    └── repacked.js        # Repacked calculator
```

## 💾 Data Storage

All data is stored locally in your browser's **localStorage**:
- Trade data
- Delivery entries
- User sessions
- Repacked calculations

**Note**: Data persists until you clear browser cache/storage

## 🎨 Design Features

- **Dark mode** with premium glassmorphism effects
- **Responsive design** for all screen sizes
- **Smooth animations** and transitions
- **Modern color palette** with vibrant gradients
- **Print-ready** pages for bills and reports

## 📊 Key Calculations

### Base Price
```
(Total Weight ÷ 100) × Trade Price
```

### Wastage
```
Base Price × 8%
```

### Final Price
```
Base Price + Wastage + Delivery Charge (₹720) + Repacked Charge
```

### Percentage (Repacked)
```
(Total Repacked Weight ÷ Final Price) × 100
```

## 🔧 Technical Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **OCR**: Tesseract.js (via CDN)
- **Data Storage**: Browser localStorage
- **Fonts**: Google Fonts (Inter)
- **No backend required** - 100% client-side

## 📝 Notes

- This is a **DEMO version** for local use only
- **No cloud storage** or external dependencies
- **Simple authentication** (demo purposes only)
- **No production security** features
- Focus on **workflow & calculations**

## 🎯 Future Enhancements (Not in Demo)

- Multi-tenant support
- Cloud OCR integration
- GST billing
- Role audit logs
- Mobile app version
- Real authentication system
- Database backend
- API integrations

## 🐛 Troubleshooting

**Issue**: OCR not working
- **Solution**: Make sure you have internet connection (Tesseract.js loads via CDN)

**Issue**: Data lost after closing browser
- **Solution**: Data persists in localStorage unless you clear browser data

**Issue**: Page not loading
- **Solution**: Open `index.html` directly in browser, don't use file:// protocol restrictions

## 📞 Support

For demo purposes only. This is a local application with no external support system.

## 📄 License

Demo application - For educational and testing purposes only.

---

**Built with ❤️ for BMW Dry Chilly Management**

🌶️ **Happy Managing!** 🌶️

