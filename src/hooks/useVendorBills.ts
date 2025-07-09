
import { useState } from 'react';
import { VendorBill, Vendor } from '@/types';
import { useSmartFilters } from './useSmartFilters';

// Mock data for vendors
const mockVendors: Vendor[] = [
  {
    id: "1",
    name: "Tech Solutions Pvt Ltd",
    gstin: "29ABCDE1234F1Z5",
    address: "123 Tech Park, Electronic City",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560100",
    email: "billing@techsolutions.com",
    phone: "+91 9876543210",
    panNumber: "ABCDE1234F"
  },
  {
    id: "2",
    name: "Office Supplies Co",
    gstin: "27FGHIJ5678K2A6",
    address: "456 Business District",
    city: "Mumbai",
    state: "Maharashtra", 
    pincode: "400001",
    email: "accounts@officesupplies.com",
    phone: "+91 9876543211"
  },
  {
    id: "3",
    name: "Digital Marketing Agency",
    gstin: "06KLMNO9012L3B7",
    address: "789 Corporate Avenue",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    email: "finance@digitalmarketing.com",
    phone: "+91 9876543212"
  }
];

// Mock data for vendor bills with payment tracking
const mockVendorBills: VendorBill[] = [
  {
    id: "1",
    vendorId: "1",
    vendorName: "Tech Solutions Pvt Ltd",
    billNumber: "TS/2024/001",
    billDate: "2025-05-20",
    uploadDate: "2025-05-20",
    totalAmount: 50000,
    taxableAmount: 42373,
    cgst: 3814,
    sgst: 3814,
    igst: 0,
    tdsRate: 2,
    tdsAmount: 1000,
    payableAmount: 49000,
    status: 'paid',
    category: 'Services',
    description: 'Software development services',
    fileName: 'tech-solutions-invoice.pdf',
    paymentDate: '2025-05-22',
    paymentMethod: 'bank_transfer',
    paymentReference: 'TXN123456789'
  },
  {
    id: "2",
    vendorId: "2", 
    vendorName: "Office Supplies Co",
    billNumber: "OS/2024/045",
    billDate: "2025-05-18",
    uploadDate: "2025-05-18",
    totalAmount: 15000,
    taxableAmount: 12712,
    cgst: 1144,
    sgst: 1144,
    igst: 0,
    tdsRate: 1,
    tdsAmount: 150,
    payableAmount: 14850,
    status: 'verified',
    category: 'Goods',
    description: 'Office stationery and supplies',
    fileName: 'office-supplies-bill.pdf',
    verifiedDate: '2025-05-19',
    verifiedBy: 'Finance Manager'
  }
];

export const useVendorBills = () => {
  const [vendorBills, setVendorBills] = useState<VendorBill[]>(mockVendorBills);
  const [vendors] = useState<Vendor[]>(mockVendors);
  const [loading, setLoading] = useState(false);

  const {
    filters,
    filteredData: filteredBills,
    updateFilters,
    clearFilters,
    getActiveFilters,
    totalResults,
    filteredResults
  } = useSmartFilters(vendorBills, ['billNumber', 'vendorName', 'description'], {
    query: '',
    sortBy: 'uploadDate',
    sortOrder: 'desc'
  });

  const createVendorBill = (bill: Omit<VendorBill, 'id' | 'uploadDate'>) => {
    const newBill: VendorBill = {
      ...bill,
      id: Date.now().toString(),
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setVendorBills(prev => [newBill, ...prev]);
    return newBill;
  };

  const updateVendorBill = (id: string, updates: Partial<VendorBill>) => {
    setVendorBills(prev => prev.map(bill => 
      bill.id === id ? { ...bill, ...updates } : bill
    ));
  };

  const deleteVendorBill = (id: string) => {
    setVendorBills(prev => prev.filter(bill => bill.id !== id));
  };

  // Calculate summary statistics
  const totalAmount = vendorBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalTDS = vendorBills.reduce((sum, bill) => sum + bill.tdsAmount, 0);
  const totalPayable = vendorBills.reduce((sum, bill) => sum + bill.payableAmount, 0);
  const pendingBills = vendorBills.filter(bill => bill.status === 'pending').length;

  return {
    vendorBills: filteredBills,
    allVendorBills: vendorBills,
    vendors,
    loading,
    filters,
    updateFilters,
    clearFilters,
    getActiveFilters,
    totalResults,
    filteredResults,
    createVendorBill,
    updateVendorBill,
    deleteVendorBill,
    summary: {
      totalAmount,
      totalTDS,
      totalPayable,
      pendingBills
    }
  };
};
