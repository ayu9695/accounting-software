
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SmartFilters } from '@/components/common/SmartFilters';
import { Badge } from '@/components/ui/badge';
import { useSmartFilters } from '@/hooks/useSmartFilters';
import { formatDate } from '@/utils/calculations';

interface ActivityItem {
  id: string;
  type: 'invoice' | 'payment' | 'expense' | 'salary';
  title: string;
  description: string;
  amount?: number;
  status: string;
  date: string;
}

const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'invoice',
    title: 'Invoice INV-001 created',
    description: 'New invoice for Acme Inc.',
    amount: 1416,
    status: 'created',
    date: '2025-03-15'
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment received',
    description: 'Payment for Invoice INV-001',
    amount: 1416,
    status: 'completed',
    date: '2025-03-14'
  },
  {
    id: '3',
    type: 'expense',
    title: 'Office supplies',
    description: 'Monthly office supplies purchase',
    amount: 250,
    status: 'approved',
    date: '2025-03-13'
  }
];

const activityTypeOptions = [
  { value: 'invoice', label: 'Invoices' },
  { value: 'payment', label: 'Payments' },
  { value: 'expense', label: 'Expenses' },
  { value: 'salary', label: 'Salaries' }
];

const statusOptions = [
  { value: 'created', label: 'Created' },
  { value: 'completed', label: 'Completed' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' }
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'invoice': return 'bg-blue-500 text-white';
    case 'payment': return 'bg-green-500 text-white';
    case 'expense': return 'bg-red-500 text-white';
    case 'salary': return 'bg-purple-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export const RecentActivity: React.FC = () => {
  const {
    filters,
    filteredData,
    updateFilters,
    clearFilters,
    getActiveFilters,
    totalResults,
    filteredResults
  } = useSmartFilters(mockActivity, ['title', 'description'], {
    query: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest transactions and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SmartFilters
          searchValue={filters.query || ''}
          onSearchChange={(query) => updateFilters({ query })}
          searchPlaceholder="Search activity..."
          statusOptions={statusOptions}
          selectedStatus={filters.status}
          onStatusChange={(status) => updateFilters({ status })}
          statusLabel="Status"
          dateRange={filters.dateRange}
          onDateRangeChange={(dateRange) => updateFilters({ dateRange })}
          showDateFilter={true}
          activeFilters={getActiveFilters()}
          onClearAll={clearFilters}
          totalResults={totalResults}
          filteredResults={filteredResults}
        />
        
        <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
          {filteredData.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={getTypeColor(item.type)}>
                  {item.type}
                </Badge>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <div className="text-right">
                {item.amount && (
                  <p className="font-medium">${item.amount.toLocaleString()}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formatDate(item.date)}
                </p>
              </div>
            </div>
          ))}
          
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No activity found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
