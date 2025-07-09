
import { useState, useMemo } from 'react';

export interface SmartFilterState {
  query: string;
  status?: string;
  category?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useSmartFilters = <T extends Record<string, any>>(
  data: T[],
  searchFields: (keyof T)[],
  initialFilters: SmartFilterState = { query: '' }
) => {
  const [filters, setFilters] = useState<SmartFilterState>(initialFilters);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (filters.query?.trim()) {
      const query = filters.query.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }
          if (typeof value === 'number') {
            return value.toString().includes(query);
          }
          return false;
        })
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter(item => {
        const status = item['status' as keyof T];
        return status === filters.status;
      });
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter(item => {
        const category = item['category' as keyof T] || item['type' as keyof T];
        if (typeof category === 'string') {
          return category.toLowerCase() === filters.category;
        }
        return category === filters.category;
      });
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      result = result.filter(item => {
        // Try common date fields
        const dateFields = ['date', 'issueDate', 'dueDate', 'createdAt', 'updatedAt'];
        const dateFieldName = dateFields.find(field => item[field as keyof T]);
        
        if (dateFieldName) {
          const itemDateValue = item[dateFieldName as keyof T];
          if (itemDateValue) {
            const itemDate = new Date(itemDateValue as string);
            const fromDate = filters.dateRange?.from;
            const toDate = filters.dateRange?.to;
            
            if (fromDate && itemDate < fromDate) return false;
            if (toDate && itemDate > toDate) return false;
          }
        }
        
        return true;
      });
    }

    // Sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        const aValue = a[filters.sortBy as keyof T];
        const bValue = b[filters.sortBy as keyof T];
        
        let comparison = 0;
        
        // Handle different data types
        if (filters.sortBy === 'date' || filters.sortBy?.includes('Date')) {
          const aDate = new Date(aValue as string);
          const bDate = new Date(bValue as string);
          comparison = aDate.getTime() - bDate.getTime();
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          const aStr = String(aValue || '').toLowerCase();
          const bStr = String(bValue || '').toLowerCase();
          comparison = aStr.localeCompare(bStr);
        }
        
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [data, filters, searchFields]);

  const updateFilters = (newFilters: Partial<SmartFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({ query: '' });
  };

  const getActiveFilters = () => {
    const active: string[] = [];
    if (filters.query?.trim()) active.push(`Search: "${filters.query}"`);
    if (filters.status && filters.status !== 'all') active.push(`Status: ${filters.status}`);
    if (filters.category && filters.category !== 'all') active.push(`Category: ${filters.category}`);
    if (filters.dateRange?.from || filters.dateRange?.to) active.push('Date filtered');
    return active;
  };

  return {
    filters,
    filteredData,
    updateFilters,
    clearFilters,
    getActiveFilters,
    totalResults: data.length,
    filteredResults: filteredData.length
  };
};
