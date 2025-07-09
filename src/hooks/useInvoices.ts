
import { useState, useEffect } from 'react';
import { Invoice, SearchFilters, PaginationData, PaymentRecord } from '@/types';
import { mockInvoices } from '@/data/mockData';
import { useSmartFilters } from './useSmartFilters';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices.map(invoice => ({
    ...invoice,
    paymentHistory: invoice.paymentHistory || []
  })));
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  const {
    filters,
    filteredData: filteredInvoices,
    updateFilters,
    clearFilters,
    getActiveFilters,
    totalResults,
    filteredResults
  } = useSmartFilters(invoices, ['invoiceNumber', 'clientName', 'clientEmail'], {
    query: '',
    sortBy: 'issueDate',
    sortOrder: 'desc'
  });

  useEffect(() => {
    const total = filteredInvoices.length;
    const totalPages = Math.ceil(total / pagination.pageSize);
    setPagination(prev => ({ ...prev, total, totalPages }));
  }, [filteredInvoices, pagination.pageSize]);

  const paginatedInvoices = filteredInvoices.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const createInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      paymentHistory: []
    };
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, ...updates } : inv
    ));
  };

  const addPayment = (invoiceId: string, payment: Omit<PaymentRecord, 'id'>) => {
    const paymentRecord: PaymentRecord = {
      ...payment,
      id: Date.now().toString()
    };

    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === invoiceId) {
        const updatedPaymentHistory = [...invoice.paymentHistory, paymentRecord];
        const totalPaid = updatedPaymentHistory.reduce((sum, p) => sum + p.amount, 0);
        
        let newStatus: Invoice['status'] = 'unpaid';
        if (totalPaid >= invoice.total) {
          newStatus = 'paid';
        } else if (totalPaid > 0) {
          newStatus = 'partial';
        }

        return {
          ...invoice,
          paymentHistory: updatedPaymentHistory,
          status: newStatus
        };
      }
      return invoice;
    }));

    return paymentRecord;
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  return {
    invoices: paginatedInvoices,
    allInvoices: invoices,
    loading,
    filters,
    updateFilters,
    clearFilters,
    getActiveFilters,
    totalResults,
    filteredResults,
    pagination,
    setPagination,
    createInvoice,
    updateInvoice,
    addPayment,
    deleteInvoice
  };
};
