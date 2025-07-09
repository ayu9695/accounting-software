
import { useState } from 'react';
import { useSmartFilters } from './useSmartFilters';

export interface TaxPayment {
  id: string;
  taxType: 'GST' | 'TDS' | 'Income Tax' | 'Professional Tax';
  amount: number;
  period: string; // YYYY-MM format
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
}

const mockTaxPayments: TaxPayment[] = [
  {
    id: "1",
    taxType: "GST",
    amount: 45000,
    period: "2025-03",
    dueDate: "2025-04-20",
    status: "pending"
  },
  {
    id: "2", 
    taxType: "TDS",
    amount: 1500,
    period: "2025-03",
    dueDate: "2025-04-07",
    status: "pending"
  }
];

export const useTaxPayments = () => {
  const [taxPayments, setTaxPayments] = useState<TaxPayment[]>(mockTaxPayments);
  const [loading, setLoading] = useState(false);

  const {
    filters,
    filteredData: filteredPayments,
    updateFilters,
    clearFilters,
    getActiveFilters,
    totalResults,
    filteredResults
  } = useSmartFilters(taxPayments, ['taxType', 'period'], {
    query: '',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });

  const recordTaxPayment = (paymentId: string, paymentData: {
    paymentDate: string;
    paymentMethod: string;
    paymentReference?: string;
    notes?: string;
  }) => {
    setTaxPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { 
            ...payment, 
            status: 'paid' as const,
            paymentDate: paymentData.paymentDate,
            paymentMethod: paymentData.paymentMethod,
            paymentReference: paymentData.paymentReference,
            notes: paymentData.notes
          }
        : payment
    ));
  };

  const addTaxPayment = (payment: Omit<TaxPayment, 'id'>) => {
    const newPayment: TaxPayment = {
      ...payment,
      id: Date.now().toString()
    };
    setTaxPayments(prev => [newPayment, ...prev]);
    return newPayment;
  };

  const updateTaxPayment = (id: string, updates: Partial<TaxPayment>) => {
    setTaxPayments(prev => prev.map(payment => 
      payment.id === id ? { ...payment, ...updates } : payment
    ));
  };

  // Calculate summary statistics
  const totalPending = taxPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = taxPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const overdueTaxes = taxPayments.filter(p => p.status === 'pending' && new Date(p.dueDate) < new Date()).length;

  return {
    taxPayments: filteredPayments,
    allTaxPayments: taxPayments,
    loading,
    filters,
    updateFilters,
    clearFilters,
    getActiveFilters,
    totalResults,
    filteredResults,
    recordTaxPayment,
    addTaxPayment,
    updateTaxPayment,
    summary: {
      totalPending,
      totalPaid,
      overdueTaxes
    }
  };
};
