
import { useState } from 'react';
import { SalaryRecord } from '@/types';
import { useSmartFilters } from './useSmartFilters';

export const useSalaryPayments = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    filters,
    filteredData: filteredRecords,
    updateFilters,
    clearFilters,
    getActiveFilters,
    totalResults,
    filteredResults
  } = useSmartFilters(salaryRecords, ['month'], {
    query: '',
    sortBy: 'month',
    sortOrder: 'desc'
  });

  const recordSalaryPayment = (recordId: string, paymentData: {
    paymentDate: string;
    paymentMethod: string;
    paymentReference?: string;
  }) => {
    setSalaryRecords(prev => prev.map(record => 
      record.id === recordId 
        ? { 
            ...record, 
            status: 'paid' as const,
            paymentDate: paymentData.paymentDate,
            paymentMethod: paymentData.paymentMethod,
            paymentReference: paymentData.paymentReference
          }
        : record
    ));
  };

  const updateSalaryRecord = (id: string, updates: Partial<SalaryRecord>) => {
    setSalaryRecords(prev => prev.map(record => 
      record.id === id ? { ...record, ...updates } : record
    ));
  };

  return {
    salaryRecords: filteredRecords,
    allSalaryRecords: salaryRecords,
    loading,
    filters,
    updateFilters,
    clearFilters,
    getActiveFilters,
    totalResults,
    filteredResults,
    recordSalaryPayment,
    updateSalaryRecord
  };
};
