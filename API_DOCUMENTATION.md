
# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### POST /auth/login
Login user
**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "superadmin|admin|team_member"
    },
    "token": "string"
  }
}
```

### POST /auth/register
Register new user (superadmin/admin only)
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "admin|team_member"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
}
```

### POST /auth/logout
Logout user
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Companies/Clients/Vendors Endpoints

### GET /companies
Get all companies
**Query Parameters:**
- `type` (optional): "client" | "vendor" | "all"
- `search` (optional): string
- `page` (optional): number (default: 1)
- `limit` (optional): number (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "phone": "string",
        "address": "string",
        "city": "string",
        "state": "string",
        "pincode": "string",
        "gst": "string",
        "panNumber": "string",
        "type": "client|vendor",
        "contactPerson": "string",
        "notes": "string",
        "createdAt": "ISO string",
        "updatedAt": "ISO string"
      }
    ],
    "pagination": {
      "page": "number",
      "totalPages": "number",
      "total": "number",
      "limit": "number"
    }
  }
}
```

### POST /companies
Create new company
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "pincode": "string",
  "gst": "string",
  "panNumber": "string",
  "type": "client|vendor",
  "contactPerson": "string",
  "notes": "string"
}
```

### GET /companies/:id
Get company by ID

### PUT /companies/:id
Update company

### DELETE /companies/:id
Delete company

---

## Invoices Endpoints

### GET /invoices
Get all invoices
**Query Parameters:**
- `status` (optional): "paid" | "unpaid" | "partial" | "overdue"
- `clientId` (optional): string
- `search` (optional): string
- `page`, `limit`: pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "string",
        "invoiceNumber": "string",
        "clientId": "string",
        "clientName": "string",
        "clientEmail": "string",
        "clientAddress": "string",
        "issueDate": "ISO string",
        "dueDate": "ISO string",
        "hsnCode": "string",
        "currency": "string",
        "lineItems": [
          {
            "id": "string",
            "service": "string",
            "description": "string",
            "quantity": "number",
            "rate": "number",
            "amount": "number"
          }
        ],
        "subtotal": "number",
        "cgst": "number",
        "sgst": "number",
        "igst": "number",
        "taxAmount": "number",
        "total": "number",
        "status": "paid|unpaid|partial|overdue",
        "customField": "string",
        "notes": "string",
        "paymentHistory": [
          {
            "id": "string",
            "amount": "number",
            "paymentDate": "ISO string",
            "paymentMethod": "string",
            "reference": "string",
            "notes": "string"
          }
        ],
        "createdAt": "ISO string",
        "updatedAt": "ISO string"
      }
    ]
  }
}
```

### POST /invoices
Create new invoice

### GET /invoices/:id
Get invoice by ID

### PUT /invoices/:id
Update invoice

### DELETE /invoices/:id
Delete invoice

### POST /invoices/:id/payments
Add payment to invoice
**Body:**
```json
{
  "amount": "number",
  "paymentDate": "ISO string",
  "paymentMethod": "string",
  "reference": "string",
  "notes": "string"
}
```

---

## Employees Endpoints

### GET /employees
Get all employees

**Response:**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "department": "string",
        "position": "string",
        "baseSalary": "number",
        "allowances": [
          {
            "id": "string",
            "name": "string",
            "amount": "number",
            "type": "fixed|percentage"
          }
        ],
        "deductions": [
          {
            "id": "string",
            "name": "string",
            "amount": "number",
            "type": "fixed|percentage"
          }
        ],
        "joinDate": "ISO string",
        "isActive": "boolean",
        "createdAt": "ISO string",
        "updatedAt": "ISO string"
      }
    ]
  }
}
```

### POST /employees
Create new employee

### GET /employees/:id
Get employee by ID

### PUT /employees/:id
Update employee

### DELETE /employees/:id
Delete employee

---

## Salary Records Endpoints

### GET /salary-records
Get salary records
**Query Parameters:**
- `employeeId` (optional): string
- `month` (optional): string
- `year` (optional): number
- `status` (optional): "pending" | "processed" | "paid"

**Response:**
```json
{
  "success": true,
  "data": {
    "salaryRecords": [
      {
        "id": "string",
        "employeeId": "string",
        "employeeName": "string",
        "month": "string",
        "year": "number",
        "baseSalary": "number",
        "allowances": "number",
        "deductions": "number",
        "leaveDays": "number",
        "workingDays": "number",
        "netSalary": "number",
        "status": "pending|processed|paid",
        "paymentDate": "ISO string",
        "paymentMethod": "string",
        "paymentReference": "string",
        "createdAt": "ISO string",
        "updatedAt": "ISO string"
      }
    ]
  }
}
```

### POST /salary-records
Create salary record

### PUT /salary-records/:id
Update salary record

### POST /salary-records/:id/pay
Process salary payment

---

## Vendor Bills Endpoints

### GET /vendor-bills
Get vendor bills
**Query Parameters:**
- `vendorId` (optional): string
- `status` (optional): "pending" | "verified" | "paid"
- `category` (optional): string

**Response:**
```json
{
  "success": true,
  "data": {
    "vendorBills": [
      {
        "id": "string",
        "vendorId": "string",
        "vendorName": "string",
        "billNumber": "string",
        "billDate": "ISO string",
        "uploadDate": "ISO string",
        "taxableAmount": "number",
        "cgst": "number",
        "sgst": "number",
        "igst": "number",
        "otherCharges": "number",
        "grossAmount": "number",
        "tdsRate": "number",
        "tdsAmount": "number",
        "netPayableAmount": "number",
        "status": "pending|verified|paid",
        "category": "string",
        "description": "string",
        "fileName": "string",
        "fileUrl": "string",
        "paymentDate": "ISO string",
        "paymentMethod": "string",
        "paymentReference": "string",
        "verifiedDate": "ISO string",
        "verifiedBy": "string",
        "createdAt": "ISO string",
        "updatedAt": "ISO string"
      }
    ]
  }
}
```

### POST /vendor-bills
Create vendor bill

### GET /vendor-bills/:id
Get vendor bill by ID

### PUT /vendor-bills/:id
Update vendor bill

### DELETE /vendor-bills/:id
Delete vendor bill

### POST /vendor-bills/:id/verify
Verify vendor bill

### POST /vendor-bills/:id/pay
Pay vendor bill

---

## Expenses Endpoints

### GET /expenses
Get expenses
**Query Parameters:**
- `category` (optional): string
- `status` (optional): "pending" | "approved" | "paid"
- `dateFrom`, `dateTo` (optional): ISO strings

**Response:**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "amount": "number",
        "category": "string",
        "date": "ISO string",
        "status": "pending|approved|paid",
        "receipt": "string",
        "submittedBy": "string",
        "approvedBy": "string",
        "paymentDate": "ISO string",
        "paymentMethod": "string",
        "createdAt": "ISO string",
        "updatedAt": "ISO string"
      }
    ]
  }
}
```

### POST /expenses
Create expense

### GET /expenses/:id
Get expense by ID

### PUT /expenses/:id
Update expense

### DELETE /expenses/:id
Delete expense

### POST /expenses/:id/approve
Approve expense

### POST /expenses/:id/pay
Pay expense

---

## Reports Endpoints

### GET /reports/income-statement
Get income statement
**Query Parameters:**
- `startDate`: ISO string
- `endDate`: ISO string

### GET /reports/balance-sheet
Get balance sheet
**Query Parameters:**
- `asOfDate`: ISO string

### GET /reports/cash-flow
Get cash flow statement
**Query Parameters:**
- `startDate`: ISO string
- `endDate`: ISO string

### GET /reports/tax-summary
Get tax summary
**Query Parameters:**
- `startDate`: ISO string
- `endDate`: ISO string

---

## Settings Endpoints

### GET /settings
Get application settings

### PUT /settings
Update application settings

### GET /settings/departments
Get departments list

### POST /settings/departments
Add department

### PUT /settings/departments/:id
Update department

### DELETE /settings/departments/:id
Delete department

---

## Users Endpoints

### GET /users
Get all users (admin/superadmin only)

### GET /users/:id
Get user by ID

### PUT /users/:id
Update user

### DELETE /users/:id
Delete user (superadmin only)

### PUT /users/:id/role
Update user role (superadmin only)

---

## Dashboard Endpoints

### GET /dashboard/stats
Get dashboard statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": "number",
    "totalInvoices": "number",
    "paidInvoices": "number",
    "unpaidInvoices": "number",
    "totalExpenses": "number",
    "totalEmployees": "number",
    "recentInvoices": "array",
    "upcomingPayments": "array",
    "recentActivity": "array"
  }
}
```
