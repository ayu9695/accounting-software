
import { useState, useEffect } from 'react';
import { VendorBill, Vendor } from '@/types';
import { useSmartFilters } from './useSmartFilters';
import { toast } from "sonner";

export const useVendorBills = () => {
  const [vendorBills, setVendorBills] = useState<VendorBill[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const baseUrl = import.meta.env.VITE_API_URL; 

 // Fetch vendors from backend
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/vendors`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setVendors(data.vendors || data);
      console.log("Fetched vendors: ", data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setError("Failed to load vendors");
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };
  // Fetch vendor bills from backend
  const fetchVendorBills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/vendor-bills`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setVendorBills(data.vendorBills || data);
      console.log("Fetched vendor bills: ", data);
      console.log("Saved vendor bills: ", vendorBills);
    } catch (error) {
      console.error("Error fetching vendor bills:", error);
      setError("Failed to load vendor bills");
      toast.error("Failed to load vendor bills");
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchVendors();
    fetchVendorBills();
  }, []);


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

  
  // Create new vendor bill
  const createVendorBill = async (billData: Omit<VendorBill, 'id' | 'uploadDate'>) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/vendor-bills`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newBill = await response.json();
      setVendorBills(prev => [newBill.vendorBill || newBill, ...prev]);
      toast.success("Vendor bill created successfully");
      return newBill.vendorBill || newBill;
    } catch (error) {
      console.error("Error creating vendor bill:", error);
      toast.error("Failed to create vendor bill");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update vendor bill
  const updateVendorBill = async (id: string, updates: Partial<VendorBill>) => {
    try {
      console.log("updating bill data: ", updates)
      setLoading(true);
      const response = await fetch(`${baseUrl}/vendor-bills/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      console.log("response received : ", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedBill = await response.json();
      setVendorBills(prev => prev.map(bill => 
        bill._id === id ? { ...bill, ...updatedBill.vendorBill || updatedBill } : bill
      ));
      toast.success("Vendor bill updated successfully");
      return updatedBill.vendorBill || updatedBill;
    } catch (error) {
      console.error("Error updating vendor bill:", error);
      toast.error("Failed to update vendor bill");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete vendor bill
  const deleteVendorBill = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/vendor-bills/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setVendorBills(prev => prev.filter(bill => bill._id !== id));
      toast.success("Vendor bill deleted successfully");
    } catch (error) {
      console.error("Error deleting vendor bill:", error);
      toast.error("Failed to delete vendor bill");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get vendor bill by ID
  const getVendorBillById = async (id: string) => {
    console.log("id value: ", id );
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/vendor-bills/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const bill = await response.json();
      return bill.vendorBill || bill;
    } catch (error) {
      console.error("Error fetching vendor bill:", error);
      toast.error("Failed to load vendor bill");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateVendorPayment = async (id: string, updates: Partial<VendorBill>) => {
    try {
      console.log("updating payment for vendor bill: ", updates)
      setLoading(true);
      const response = await fetch(`${baseUrl}/vendor-bills/payment/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      console.log("response received : ", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedBill = await response.json();
      setVendorBills(prev => prev.map(bill => 
        bill._id === id ? { ...bill, ...updatedBill.vendorBill || updatedBill } : bill
      ));
      toast.success("Vendor bill payment updated successfully");
      return updatedBill.vendorBill || updatedBill;
    } catch (error) {
      console.error("Error updating payment for vendor bill:", error);
      toast.error("Failed to update payment for vendor bill");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    fetchVendors();
    fetchVendorBills();
  };

  // Calculate summary statistics
  const totalAmount = vendorBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalTDS = vendorBills.reduce((sum, bill) => sum + bill.payableAmount, 0);
  const totalPayable = vendorBills.reduce((sum, bill) => sum + (bill.pendingAmount? bill.pendingAmount:0 ), 0);
  const pendingBills = vendorBills.filter(bill => bill.paymentStatus === 'unpaid').length;

  return {
    vendorBills: filteredBills,
    allVendorBills: vendorBills,
    vendors,
    loading,
    error,
    filters,
    updateVendorPayment,
    updateFilters,
    clearFilters,
    getActiveFilters,
    totalResults,
    filteredResults,
    createVendorBill,
    updateVendorBill,
    deleteVendorBill,
    getVendorBillById,
    refreshData,
    summary: {
      totalAmount,
      totalTDS,
      totalPayable,
      pendingBills
    }
  };
};
