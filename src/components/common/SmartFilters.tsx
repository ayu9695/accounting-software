
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from './SearchInput';
import { CalendarIcon, FilterIcon, SortAscIcon, SortDescIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface SmartFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Status/Category filters
  statusOptions?: FilterOption[];
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  statusLabel?: string;
  
  // Date range
  dateRange?: { from?: Date; to?: Date };
  onDateRangeChange?: (range: { from?: Date; to?: Date }) => void;
  showDateFilter?: boolean;
  
  // Sorting
  sortOptions?: SortOption[];
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
  sortOrder?: 'asc' | 'desc';
  onSortOrderChange?: (order: 'asc' | 'desc') => void;
  
  // Active filters
  activeFilters?: string[];
  onClearFilter?: (filter: string) => void;
  onClearAll?: () => void;
  
  // Results count
  totalResults?: number;
  filteredResults?: number;
}

export const SmartFilters: React.FC<SmartFiltersProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  statusOptions,
  selectedStatus,
  onStatusChange,
  statusLabel = "Status",
  dateRange,
  onDateRangeChange,
  showDateFilter = true,
  sortOptions,
  selectedSort,
  onSortChange,
  sortOrder = 'asc',
  onSortOrderChange,
  activeFilters = [],
  onClearFilter,
  onClearAll,
  totalResults,
  filteredResults
}) => {
  const formatDateRange = () => {
    if (!dateRange?.from) return 'Date Range';
    
    try {
      if (dateRange.to) {
        return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`;
      }
      return format(dateRange.from, 'MMM dd, yyyy');
    } catch (error) {
      return 'Date Range';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main filter row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            onClear={() => onSearchChange('')}
            className="min-w-[250px]"
          />
          
          {statusOptions && onStatusChange && (
            <Select value={selectedStatus || 'all'} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[140px] bg-white">
                <div className="flex items-center">
                  <FilterIcon size={16} className="mr-2" />
                  <SelectValue placeholder={statusLabel} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="all">All {statusLabel}</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                    {option.count !== undefined && (
                      <span className="ml-2 text-muted-foreground">({option.count})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {showDateFilter && onDateRangeChange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[160px] justify-start bg-white">
                  <CalendarIcon size={16} className="mr-2" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange as DateRange}
                  onSelect={(range) => onDateRangeChange?.(range || {})}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {sortOptions && onSortChange && (
            <Select value={selectedSort} onValueChange={onSortChange}>
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {onSortOrderChange && (
            <Button
              variant="outline"
              size="icon"
              className="bg-white"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAscIcon size={16} /> : <SortDescIcon size={16} />}
            </Button>
          )}
          
          {activeFilters.length > 0 && onClearAll && (
            <Button variant="outline" onClick={onClearAll} className="bg-white">
              Clear All
            </Button>
          )}
        </div>
      </div>
      
      {/* Active filters and results */}
      {(activeFilters.length > 0 || (totalResults !== undefined && filteredResults !== undefined)) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((filter) => (
              <Badge key={filter} variant="secondary" className="gap-1">
                {filter}
                {onClearFilter && (
                  <button
                    onClick={() => onClearFilter(filter)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <XIcon size={12} />
                  </button>
                )}
              </Badge>
            ))}
          </div>
          
          {totalResults !== undefined && filteredResults !== undefined && (
            <div className="text-sm text-muted-foreground">
              {filteredResults === totalResults
                ? `${totalResults} results`
                : `${filteredResults} of ${totalResults} results`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
