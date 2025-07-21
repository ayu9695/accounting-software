
import { useState, useEffect } from 'react';
import { Contact, Company, SearchFilters, PaginationData } from '@/types';
import { mockContacts, mockCompanies } from '@/data/mockData';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>();
  const [companies, setCompanies] = useState<Company[]>();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const baseUrl = import.meta.env.VITE_API_URL;

 const fetchCompanies = async () => {
    setLoading(true);
    try {
      const [clientsRes, vendorsRes] = await Promise.all([
        fetch(`${baseUrl}/clients-with-contacts`, { credentials: 'include' }),
        fetch(`${baseUrl}/vendors-with-contacts`, { credentials: 'include' })
      ]);

      const [clients, vendors] = await Promise.all([
        clientsRes.json(),
        vendorsRes.json()
      ]);

      const combined = [
        ...clients.map((c: any) => ({ ...c, type: 'client' })),
        ...vendors.map((v: any) => ({ ...v, type: 'vendor' }))
      ];

      const parsedCompanies: Company[] = combined.map((c: any) => {
        const companyId = c._id;
        const contacts = Array.isArray(c.contactPerson) ? c.contactPerson : [];

        return {
          id: companyId,
          name: c.name,
          email: c.email || '',
          phone: c.phone || '',
          extension: c.extension || '',
          address: c.address || '',
          website: c.website || '',
          industry: c.industry || '',
          gst: c.gst || '',
          city: c.city || '',
          state: c.state || '',
          pincode: c.pincode || '',
          panNumber: c.panNumber || '',
          type: c.type,
          contacts: contacts.map((contact: any, idx: number) => ({
            id: `${companyId}-contact-${idx}`,
            name: contact.name,
            email: contact.email || '',
            phone: contact.extension
            ? `+ ${contact.extension} ${contact.phone || ''}`
            : contact.phone || '',
            position: contact.position || '',
            companyId: companyId,
            type: 'individual'
        }))
        };
      });

      const flattenedContacts: Contact[] = parsedCompanies.flatMap((company) => company.contacts);

      setCompanies(parsedCompanies);
      setContacts(flattenedContacts);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const addCompany = async (companyData: any) => {
    const endpoint = companyData.type === "client" ? "/clients" : "/vendors";
    try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(companyData)
    });
    if (!res.ok) throw new Error(`Failed to add ${companyData.type}`);
    const savedCompany = await res.json();
    const newCompany: Company = {
      id: savedCompany.id,
      name: savedCompany.name,
      email: savedCompany.email,
      phone: savedCompany.phone || '',
      extension: savedCompany.extension || '+91',
      address: savedCompany.address || '',
      city: savedCompany.city || '',
      state: savedCompany.state || '',
      pincode: savedCompany.pincode || '',
      gst: savedCompany.gst,
      panNumber: savedCompany.panNumber || '',
      type: savedCompany.type,
      contactPerson: savedCompany.contactPerson || '',
      notes: savedCompany.notes || '',
      contacts: [],
      createdAt: savedCompany.createdAt
    };
    setCompanies(prev => [...prev, newCompany]);
    return newCompany;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(company => 
      company.id === id ? { ...company, ...updates } : company
    ));
  };

  const deleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(company => company.id !== id));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);


  return {
    contacts,
    companies,
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
