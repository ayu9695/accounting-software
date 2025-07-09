
import { SearchFilters } from '@/types';

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const filterByDateRange = <T extends { [key: string]: any }>(
  items: T[],
  dateField: keyof T,
  filters: SearchFilters
): T[] => {
  if (!filters.dateRange) return items;
  
  const { from, to } = filters.dateRange;
  if (!from || !to) return items;
  
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= fromDate && itemDate <= toDate;
  });
};

export const createSearchFilter = <T>(
  items: T[],
  searchFields: (keyof T)[],
  searchTerm: string
): T[] => {
  if (!searchTerm.trim()) return items;
  
  const query = searchTerm.toLowerCase();
  
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(query);
      }
      return false;
    })
  );
};
