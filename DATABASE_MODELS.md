
# Database Models (MongoDB)

## Collections Overview

### 1. users
User accounts and authentication

### 2. companies
Clients and vendors information

### 3. invoices
Invoice records with line items and payment history

### 4. employees
Employee information and salary details

### 5. salaryRecords
Monthly salary records for employees

### 6. vendorBills
Vendor bills and payment tracking

### 7. expenses
Expense records and approvals

### 8. settings
Application settings and configurations

---

## Detailed Models

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String, // required
  email: String, // required, unique
  password: String, // required, hashed
  role: String, // required, enum: ['superadmin', 'admin', 'team_member']
  avatar: String, // optional, URL to profile image
  isActive: Boolean, // default: true
  lastLogin: Date,
  createdAt: Date, // default: Date.now
  updatedAt: Date, // default: Date.now
  createdBy: ObjectId, // ref: 'users', who created this user
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
```

### Companies Collection
```javascript
{
  _id: ObjectId,
  name: String, // required
  email: String, // required
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  gst: String, // required, GST number
  panNumber: String,
  type: String, // required, enum: ['client', 'vendor']
  contactPerson: String,
  notes: String,
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  isActive: Boolean, // default: true
  createdAt: Date, // default: Date.now
  updatedAt: Date, // default: Date.now
  createdBy: ObjectId, // ref: 'users'
}

// Indexes
db.companies.createIndex({ type: 1 })
db.companies.createIndex({ name: 1 })
db.companies.createIndex({ gst: 1 })
db.companies.createIndex({ email: 1 })
```

### Invoices Collection
```javascript
{
  _id: ObjectId,
  invoiceNumber: String, // required, unique
  clientId: ObjectId, // required, ref: 'companies'
  clientName: String, // denormalized for performance
  clientEmail: String,
  clientAddress: String,
  issueDate: Date, // required
  dueDate: Date, // required
  hsnCode: String,
  currency: String, // default: 'INR'
  lineItems: [
    {
      _id: ObjectId,
      service: String, // required
      description: String,
      quantity: Number, // required, min: 1
      rate: Number, // required, min: 0
      amount: Number // calculated: quantity * rate
    }
  ],
  subtotal: Number, // calculated from line items
  cgst: Number, // default: 0
  sgst: Number, // default: 0
  igst: Number, // default: 0
  taxAmount: Number, // calculated: cgst + sgst + igst
  total: Number, // calculated: subtotal + taxAmount
  status: String, // enum: ['paid', 'unpaid', 'partial', 'overdue'], default: 'unpaid'
  customField: String,
  notes: String,
  paymentHistory: [
    {
      _id: ObjectId,
      amount: Number, // required
      paymentDate: Date, // required
      paymentMethod: String,
      reference: String,
      notes: String,
      recordedBy: ObjectId, // ref: 'users'
      recordedAt: Date // default: Date.now
    }
  ],
  createdAt: Date, // default: Date.now
  updatedAt: Date, // default: Date.now
  createdBy: ObjectId, // ref: 'users'
}

// Indexes
db.invoices.createIndex({ invoiceNumber: 1 }, { unique: true })
db.invoices.createIndex({ clientId: 1 })
db.invoices.createIndex({ status: 1 })
db.invoices.createIndex({ issueDate: 1 })
db.invoices.createIndex({ dueDate: 1 })
```

### Employees Collection
```javascript
{
  _id: ObjectId,
  name: String, // required
  email: String, // required, unique
  department: String, // required
  position: String, // required
  baseSalary: Number, // required, min: 0
  allowances: [
    {
      _id: ObjectId,
      name: String, // required
      amount: Number, // required
      type: String // enum: ['fixed', 'percentage']
    }
  ],
  deductions: [
    {
      _id: ObjectId,
      name: String, // required
      amount: Number, // required
      type: String // enum: ['fixed', 'percentage']
    }
  ],
  joinDate: Date, // required
  isActive: Boolean, // default: true
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  documents: [
    {
      type: String, // e.g., 'aadhar', 'pan', 'passport'
      url: String,
      uploadedAt: Date
    }
  ],
  createdAt: Date, // default: Date.now
  updatedAt: Date, // default: Date.now
  createdBy: ObjectId, // ref: 'users'
}

// Indexes
db.employees.createIndex({ email: 1 }, { unique: true })
db.employees.createIndex({ department: 1 })
db.employees.createIndex({ isActive: 1 })
```

### SalaryRecords Collection
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId, // required, ref: 'employees'
  employeeName: String, // denormalized
  month: String, // required, format: 'YYYY-MM'
  year: Number, // required
  baseSalary: Number, // required
  allowances: Number, // calculated total allowances
  deductions: Number, // calculated total deductions
  leaveDays: Number, // default: 0
  workingDays: Number, // required
  grossSalary: Number, // calculated
  netSalary: Number, // calculated final amount
  status: String, // enum: ['pending', 'processed', 'paid'], default: 'pending'
  paymentDate: Date,
  paymentMethod: String,
  paymentReference: String,
  processedAt: Date,
  processedBy: ObjectId, // ref: 'users'
  paidAt: Date,
  paidBy: ObjectId, // ref: 'users'
  createdAt: Date, // default: Date.now
  updatedAt: Date, // default: Date.now
}

// Indexes
db.salaryRecords.createIndex({ employeeId: 1, month: 1, year: 1 }, { unique: true })
db.salaryRecords.createIndex({ status: 1 })
db.salaryRecords.createIndex({ month: 1, year: 1 })
```

### VendorBills Collection
```javascript
{
  _id: ObjectId,
  vendorId: ObjectId, // required, ref: 'companies'
  vendorName: String, // denormalized
  billNumber: String, // required
  billDate: Date, // required
  uploadDate: Date, // default: Date.now
  taxableAmount: Number, // required, min: 0
  cgst: Number, // default: 0
  sgst: Number, // default: 0
  igst: Number, // default: 0
  otherCharges: Number, // default: 0, optional additional charges
  grossAmount: Number, // calculated: taxableAmount + cgst + sgst + igst + otherCharges
  tdsRate: Number, // default: 0, percentage
  tdsAmount: Number, // calculated: grossAmount * (tdsRate/100)
  netPayableAmount: Number, // calculated: grossAmount - tdsAmount
  status: String, // enum: ['pending', 'verified', 'paid'], default: 'pending'
  category: String, // required
  description: String,
  fileName: String,
  fileUrl: String, // URL to uploaded bill document
  paymentDate: Date,
  paymentMethod: String,
  paymentReference: String,
  verifiedDate: Date,
  verifiedBy: ObjectId, // ref: 'users'
  paidDate: Date,
  paidBy: ObjectId, // ref: 'users'
  createdAt: Date, // default: Date.now
  updatedAt: Date, // default: Date.now
  uploadedBy: ObjectId, // ref: 'users'
}

// Indexes
db.vendorBills.createIndex({ vendorId: 1 })
db.vendorBills.createIndex({ status: 1 })
db.vendorBills.createIndex({ billDate: 1 })
db.vendorBills.createIndex({ category: 1 })
```

### Expenses Collection
```javascript
{
  _id: ObjectId,
  title: String, // required
  description: String,
  amount: Number, // required, min: 0
  category: String, // required
  date: Date, // required
  status: String, // enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending'
  receipt: String, // URL to receipt image/document
  tags: [String], // optional tags for categorization
  submittedBy: ObjectId, // required, ref: 'users'
  approvedBy: ObjectId, // ref: 'users'
  approvedAt: Date,
  rejectedBy: ObjectId, // ref: 'users'
  rejectedAt: Date,
  rejectionReason: String,
  paymentDate: Date,
  paymentMethod: String,
  paymentReference: String,
  paidBy: ObjectId, // ref: 'users'
  paidAt: Date,
  createdAt: Date, // default: Date.now
  updatedAt: Date, // default: Date.now
}

// Indexes
db.expenses.createIndex({ submittedBy: 1 })
db.expenses.createIndex({ status: 1 })
db.expenses.createIndex({ category: 1 })
db.expenses.createIndex({ date: 1 })
```

### Settings Collection
```javascript
{
  _id: ObjectId,
  companySettings: {
    name: String, // required
    email: String, // required
    phone: String,
    address: String,
    taxId: String, // GST number
    logo: String, // URL to company logo
    currency: String, // default: 'INR'
    departments: [String] // list of department names
  },
  emailSettings: {
    smtpServer: String,
    smtpPort: String,
    smtpUsername: String,
    smtpPassword: String, // encrypted
    enableEmailNotifications: Boolean, // default: false
    sendInvoiceReminders: Boolean, // default: false
    sendPaymentReceipts: Boolean // default: false
  },
  taxSettings: {
    gstRate: String,
    tdsRate: String,
    enableAutoCalculation: Boolean, // default: true
    taxes: [
      {
        _id: ObjectId,
        name: String, // e.g., 'CGST', 'SGST', 'IGST'
        percentage: Number
      }
    ]
  },
  currencies: [
    {
      value: String, // e.g., 'INR'
      label: String, // e.g., 'Indian Rupee'
      symbol: String // e.g., '₹'
    }
  ],
  permissions: {
    canCreateInvoices: Boolean,
    canEditInvoices: Boolean,
    canDeleteInvoices: Boolean,
    canManageSalaries: Boolean,
    canViewReports: Boolean,
    canManageSettings: Boolean,
    canManageUsers: Boolean
  },
  createdAt: Date, // default: Date.now
  updatedAt: Date, // default: Date.now
  updatedBy: ObjectId // ref: 'users'
}

// Note: Typically only one settings document exists
```

## Foreign Key Relationships

### Direct References (ObjectId)
- `invoices.clientId` → `companies._id`
- `salaryRecords.employeeId` → `employees._id`
- `vendorBills.vendorId` → `companies._id`
- `expenses.submittedBy` → `users._id`
- `expenses.approvedBy` → `users._id`
- `expenses.paidBy` → `users._id`
- `users.createdBy` → `users._id`
- `companies.createdBy` → `users._id`
- `invoices.createdBy` → `users._id`
- `employees.createdBy` → `users._id`

### Validation Rules
1. When creating invoices, `clientId` must exist in companies with `type: 'client'`
2. When creating vendor bills, `vendorId` must exist in companies with `type: 'vendor'`
3. Employee emails must be unique across the employees collection
4. User emails must be unique across the users collection
5. Invoice numbers must be unique
6. Only one salary record per employee per month/year combination

### Cascade Operations
- When a company is deleted, related invoices/vendor bills should be handled (soft delete recommended)
- When an employee is deleted, related salary records should be preserved for audit purposes
- When a user is deleted, their created records should remain but `createdBy` field should be handled appropriately
