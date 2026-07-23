# Enterprise Inventory Management System (EIMS)

## Software Requirements Specification (SRS)

## 1. Project Overview

The Enterprise Inventory Management System (EIMS) is a web-based
application designed to help businesses efficiently manage their
inventory, products, suppliers, sales, and stock movements. The system
provides real-time inventory tracking, reporting, analytics, and user
management while maintaining a complete audit trail of all inventory
transactions.

## 2. User Roles

### Administrator (Admin)

-   Full access to all modules.
-   Manage products, inventory, suppliers, categories, users, reports,
    analytics, and settings.

### Normal User

-   View inventory and products.
-   Search products.
-   Perform Stock In and Stock Out operations.
-   Update product quantity.
-   View personal transaction history.

Restrictions: - Cannot add/delete products. - Cannot edit product
prices. - Cannot manage users. - Cannot view profit reports. - Cannot
access settings.

## 3. System Pages

### Login

-   Secure authentication (JWT)
-   Forgot password

### Dashboard

**Admin** - Total products - Inventory value - Low/out-of-stock
products - Daily, monthly, yearly profit - Sales summary - Best-selling
products - Recent inventory transactions

**User** - Inventory overview - Available products - Notifications -
Personal activity

### Products

-   View, search, filter products
-   Product details

**Admin** - Add/Edit/Delete products - Upload product image - Update
purchase/selling prices

### Categories

-   Add/Edit/Delete categories
-   Assign products to categories

### Suppliers

-   Add/Edit/Delete suppliers
-   View supplier products

### Inventory

-   View stock
-   Stock In
-   Stock Out
-   Update quantity
-   Low-stock monitoring

### Inventory Transactions (Audit Log)

Every inventory action is recorded: - Transaction ID - Product - User -
Action (Stock In / Stock Out / Quantity Updated) - Quantity before -
Quantity after - Difference - Reason - Date & Time

### Sales

-   Create invoices
-   Sales history
-   Profit calculation
-   Sold products

### Reports

-   Daily, Weekly, Monthly, Yearly reports
-   Sales
-   Profit
-   Best-selling products
-   Inventory summary
-   Export to PDF and Excel

### Analytics

-   Sales charts
-   Profit charts
-   Inventory charts
-   Best-selling products

### User Management

-   Add/Edit/Delete users
-   Reset passwords
-   Assign roles
-   Activate/Deactivate accounts

### Notifications

-   Low stock
-   Out of stock
-   Stock In completed
-   Stock Out completed

### Profile

-   Update profile
-   Change password

### Settings

-   Company information
-   Logo
-   Currency
-   Tax settings

## 4. Product Information

-   Product ID
-   Product Name
-   Category
-   Barcode
-   Product Image
-   Purchase Price
-   Selling Price
-   Profit per Unit
-   Current Quantity
-   Minimum Stock
-   Supplier
-   Description
-   Created Date
-   Updated Date

## 5. Profit Calculation

`Profit = Selling Price - Purchase Price`

Calculates: - Profit per product - Daily profit - Monthly profit -
Yearly profit

## 6. Search

-   Product Name
-   Barcode
-   Category
-   Supplier

## 7. Future Enhancements

-   Barcode Scanner
-   QR Code Generator
-   Barcode Printing
-   Customer Management
-   Purchase Orders
-   Sales Orders
-   Invoice Printing
-   Excel Import/Export
-   Email & SMS Notifications
-   Multi-Branch Support
-   Dark Mode
-   Cloud Storage

## 8. Activity Log

Tracks: - Login/Logout - Product CRUD - Inventory updates - User
management - Password changes

Each log includes: - User - Action - Date & Time - IP Address (optional)
