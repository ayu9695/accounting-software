// Core application types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  extension: string;
  gst: string;
  panNumber?: string;
  type: 'client' | 'vendor';
  contactPerson?: [];
  notes?: string;
  website?: string;
  industry?: string;
  contacts: Contact[];
  createdAt?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position?: string;
  companyId?: string;
  companyType?: 'client' | 'vendor' | '';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  hsnCode: string;
  currency: string;
  lineItems: LineItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  total: number;
  status: 'paid' | 'unpaid' | 'partial' | 'overdue';
  customField?: string;
  notes?: string;
  paymentHistory: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}

export interface LineItem {
  id: string;
  service: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  baseSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  joinDate: string;
  isActive: boolean;
}

export interface Allowance {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface Deduction {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  leaveDays: number;
  workingDays: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
}

export interface AppSettings {
  companySettings: {
    name: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    logo: string;
    currency: string;
    departments: string[];
  };
  emailSettings: {
    smtpServer: string;
    smtpPort: string;
    smtpUsername: string;
    smtpPassword: string;
    enableEmailNotifications: boolean;
    sendInvoiceReminders: boolean;
    sendPaymentReceipts: boolean;
  };
  taxSettings: {
    gstRate: string;
    tdsRate: string;
    enableAutoCalculation: boolean;
    taxes: Tax[];
  };
  currencies: Currency[];
  permissions: UserPermissions;
}

export interface Tax {
  id: string;
  name: string;
  percentage: number;
}

export interface Currency {
  value: string;
  label: string;
  symbol: string;
}

export interface UserPermissions {
  canCreateInvoices: boolean;
  canEditInvoices: boolean;
  canDeleteInvoices: boolean;
  canManageSalaries: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
}

export interface SearchFilters {
  query: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  status?: string;
  category?: string;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface VendorBill {
  _id:string;
  vendorId: string;
  vendorName: string;
  department: string;
  billNumber: string;
  billDate: string;
  uploadDate: string;
  totalAmount: number;
  amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  tdsRate: number;
  tdsAmount: number;
  payableAmount: number;
  status: 'pending' | 'verified' | 'paid';
  description?: string;
  fileName?: string;
  fileUrl?: string;
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  verifiedDate?: string;
  verifiedBy?: string;
}

export interface Vendor {
  _id: string;
  name: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email?: string;
  phone?: string;
  panNumber?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}
