
import { useState, useEffect } from 'react';
import { Contact, Company, SearchFilters, PaginationData } from '@/types';
import { mockContacts, mockCompanies } from '@/data/mockData';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  const filteredContacts = contacts.filter(contact => {
    if (filters.query) {
      const query = filters.query.toLowerCase();
      return (
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const filteredCompanies = companies.filter(company => {
    if (filters.query) {
      const query = filters.query.toLowerCase();
      return (
        company.name.toLowerCase().includes(query) ||
        company.email.toLowerCase().includes(query) ||
        company.industry?.toLowerCase().includes(query) ||
        company.gst?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  useEffect(() => {
    const total = filteredContacts.length;
    const totalPages = Math.ceil(total / pagination.pageSize);
    setPagination(prev => ({ ...prev, total, totalPages }));
  }, [filteredContacts, pagination.pageSize]);

  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString()
    };
    setContacts(prev => [...prev, newContact]);
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    ));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const addCompany = (companyData: any) => {
    const newCompany: Company = {
      id: companyData.id,
      name: companyData.name,
      email: companyData.email,
      phone: companyData.phone || '',
      address: companyData.address || '',
      city: companyData.city || '',
      state: companyData.state || '',
      pincode: companyData.pincode || '',
      gst: companyData.gst,
      panNumber: companyData.panNumber || '',
      type: companyData.type,
      contactPerson: companyData.contactPerson || '',
      notes: companyData.notes || '',
      contacts: [],
      createdAt: companyData.createdAt
    };
    setCompanies(prev => [...prev, newCompany]);
    return newCompany;
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(company => 
      company.id === id ? { ...company, ...updates } : company
    ));
  };

  const deleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(company => company.id !== id));
  };

  return {
    contacts: filteredContacts,
    companies: filteredCompanies,
    loading,
    filters,
    setFilters,
    pagination,
    setPagination,
    addContact,
    updateContact,
    deleteContact,
    addCompany,
    updateCompany,
    deleteCompany
  };
};
