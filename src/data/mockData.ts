import { Invoice, Employee, Contact, Company, SalaryRecord } from '@/types';

export const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    clientId: "1",
    clientName: "Acme Inc.",
    clientEmail: "billing@acme.com",
    clientAddress: "123 Business St, City, State 12345",
    issueDate: "2025-03-15",
    dueDate: "2025-04-15",
    hsnCode: "998314",
    currency: "USD",
    lineItems: [
      { id: "1", service: "Web Development", description: "Custom website development", quantity: 1, rate: 1200, amount: 1200 }
    ],
    subtotal: 1200,
    cgst: 108,
    sgst: 108,
    igst: 0,
    taxAmount: 216,
    total: 1416,
    status: "paid",
    notes: "Thank you for your business",
    paymentHistory: [
      {
        id: "1",
        amount: 1416,
        paymentDate: "2025-03-20",
        paymentMethod: "bank_transfer",
        reference: "TXN001234",
        notes: "Full payment received"
      }
    ]
  },
  {
    id: "2",
    invoiceNumber: "INV-002",
    clientId: "2",
    clientName: "Globex Corp",
    clientEmail: "accounts@globex.com",
    clientAddress: "456 Corporate Ave, Business City, State 67890",
    issueDate: "2025-03-18",
    dueDate: "2025-04-18",
    hsnCode: "998314",
    currency: "INR",
    lineItems: [
      { id: "2", service: "Mobile App Development", description: "Cross-platform mobile application", quantity: 1, rate: 250000, amount: 250000 }
    ],
    subtotal: 250000,
    cgst: 22500,
    sgst: 22500,
    igst: 0,
    taxAmount: 45000,
    total: 295000,
    status: "unpaid",
    paymentHistory: []
  }
];

export const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Technical",
    position: "Senior Developer",
    baseSalary: 80000,
    allowances: [
      { id: "1", name: "HRA", amount: 20000, type: "fixed" },
      { id: "2", name: "Transport", amount: 5000, type: "fixed" }
    ],
    deductions: [
      { id: "1", name: "PF", amount: 10, type: "percentage" },
      { id: "2", name: "Insurance", amount: 2000, type: "fixed" }
    ],
    joinDate: "2023-01-15",
    isActive: true
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Sales",
    position: "Sales Manager",
    baseSalary: 75000,
    allowances: [
      { id: "3", name: "HRA", amount: 18000, type: "fixed" },
      { id: "4", name: "Sales Incentive", amount: 15, type: "percentage" }
    ],
    deductions: [
      { id: "3", name: "PF", amount: 10, type: "percentage" }
    ],
    joinDate: "2022-08-10",
    isActive: true
  }
];

export const mockContacts: Contact[] = [
  {
    id: "1",
    name: "John Client",
    email: "john@acme.com",
    phone: "+1 (555) 123-4567",
    position: "CEO",
    companyId: "1",
    type: "individual"
  },
  {
    id: "2",
    name: "Acme Inc.",
    email: "contact@acme.com",
    phone: "+1 (555) 123-4567",
    type: "company"
  }
];

export const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Acme Inc.",
    email: "contact@acme.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business St",
    city: "Business City",
    state: "California",
    pincode: "12345",
    gst: "29ABCDE1234F1Z5",
    panNumber: "ABCDE1234F",
    type: "client",
    contactPerson: "John Client",
    website: "https://acme.com",
    industry: "Technology",
    notes: "Important client with multiple projects",
    contacts: [
      {
        id: "1",
        name: "John Client",
        email: "john@acme.com",
        phone: "+1 (555) 123-4567",
        position: "CEO",
        companyId: "1",
        type: "individual"
      }
    ],
    createdAt: "2025-01-15"
  }
];

export const mockSalaryRecords: SalaryRecord[] = [
  {
    id: "1",
    employeeId: "1",
    month: "March",
    year: 2025,
    baseSalary: 80000,
    allowances: 25000,
    deductions: 10000,
    leaveDays: 2,
    workingDays: 22,
    netSalary: 92727,
    status: "processed"
  }
];
