
import React from 'react';
import { SmartFilters, FilterOption } from '@/components/common/SmartFilters';
import { Contact } from '@/types';

interface ContactFiltersProps {
  contacts: Contact[];
  onFiltersChange: (filteredContacts: Contact[]) => void;
}

const contactTypeOptions: FilterOption[] = [
  { value: 'individual', label: 'Individuals' },
  { value: 'company', label: 'Companies' }
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'type', label: 'Type' }
];

export const ContactFilters: React.FC<ContactFiltersProps> = ({
  contacts,
  onFiltersChange
}) => {
  const [filters, setFilters] = React.useState({
    query: '',
    type: 'all',
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  React.useEffect(() => {
    let filtered = [...contacts];

    // Search filter
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        (contact.phone && contact.phone.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(contact => contact.type === filters.type);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Contact];
      let bValue: any = b[filters.sortBy as keyof Contact];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    onFiltersChange(filtered);
  }, [contacts, filters, onFiltersChange]);

  const getActiveFilters = () => {
    const active: string[] = [];
    if (filters.query.trim()) active.push(`Search: "${filters.query}"`);
    if (filters.type !== 'all') active.push(`Type: ${filters.type}`);
    return active;
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      type: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  return (
    <SmartFilters
      searchValue={filters.query}
      onSearchChange={(query) => setFilters(prev => ({ ...prev, query }))}
      searchPlaceholder="Search contacts by name, email, or phone..."
      statusOptions={contactTypeOptions}
      selectedStatus={filters.type}
      onStatusChange={(type) => setFilters(prev => ({ ...prev, type }))}
      statusLabel="Type"
      showDateFilter={false}
      sortOptions={sortOptions}
      selectedSort={filters.sortBy}
      onSortChange={(sortBy) => setFilters(prev => ({ ...prev, sortBy }))}
      sortOrder={filters.sortOrder}
      onSortOrderChange={(sortOrder) => setFilters(prev => ({ ...prev, sortOrder }))}
      activeFilters={getActiveFilters()}
      onClearAll={clearFilters}
      totalResults={contacts.length}
      filteredResults={contacts.length}
    />
  );
};
