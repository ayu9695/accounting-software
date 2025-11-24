
import React, { useState, useEffect, useRef } from "react";
import PageLayout from "@/components/PageLayout";
import { ContactTabs } from "@/components/contacts/ContactTabs";
import { useContacts } from "@/hooks/useContacts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { Building, Plus } from "lucide-react";
import { Contact, Company} from '@/types';

const Contacts = () => {
  const { contacts, companies, addContact, addCompany, updateContact } = useContacts();
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);

    // Company autocomplete states
  const [companySearchValue, setCompanySearchValue] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState(companies || []);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  const [isEditContactDialogOpen, setIsEditContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editContactData, setEditContactData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
  });
  
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    companyId: "",
    companyType: "client" as "client" | "vendor",
  });

  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    extension: "",
    city: "",
    state: "",
    pincode: "",
    gst: "",
    panNumber: "",
    type: "client" as "client" | "vendor",
    contactPerson: [],
    website: "",
    industry: "",
    notes: ""
  });

  // Filter companies based on search input
  useEffect(() => {
    if (!companies) return;
    
    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(companySearchValue.toLowerCase()) ||
      company.email.toLowerCase().includes(companySearchValue.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [companySearchValue, companies]);

  // Handle clicking outside of company dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(event.target as Node) &&
        !companyInputRef.current?.contains(event.target as Node)
      ) {
        setShowCompanyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCompanySelect = (company: any) => {
    setCompanySearchValue(company.name);
    setNewContact({
      ...newContact,
      companyId: company.id,
      companyType: company.type
    });
    setShowCompanyDropdown(false);
  };

  const handleAddNewCompany = () => {
    setShowCompanyDropdown(false);
    setIsAddCompanyDialogOpen(true);
  };

  const handleCompanyInputFocus = () => {
    setShowCompanyDropdown(true);
  };

  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCompanySearchValue(value);
    setShowCompanyDropdown(true);
    
    // Clear selection if user types something different
    if (newContact.companyId && value !== companies?.find(c => c.id === newContact.companyId)?.name) {
      setNewContact({
        ...newContact,
        companyId: "",
        companyType: "client"
      });
    }
  };

   const resetContactForm = () => {
    setNewContact({
      name: "",
      email: "",
      phone: "",
      position: "",
      companyId: "",
      companyType: "client"
    });
    setCompanySearchValue("");
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.email) {
      toast.error("Please fill in required fields");
      return;
    }

    try{
    await addContact(newContact);
    console.log("new contact data recived: ", newContact);
    toast.success("Contact added successfully");
    resetContactForm();
    setIsAddContactDialogOpen(false);
    } catch(err) {
    toast.error("Failed to add contact");
    }
  };

  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.email || !newCompany.gst || !newCompany.type) {
      toast.error("Please fill in all required fields (Name, Email, GST, Type)");
      return;
    }

    const companyData = {
      ...newCompany,
      id: Date.now().toString(),
      contacts: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    try{
    const savedCompany = await addCompany(companyData);
    // Auto-select the newly created company in the contact form
      if (isAddContactDialogOpen) {
        setCompanySearchValue(savedCompany.name);
        setNewContact({
          ...newContact,
          companyId: savedCompany.id,
          companyType: savedCompany.type
        });
      }
    setNewCompany({
      name: "",
      email: "",
      phone: "",
      address: "",
      extension: "",
      city: "",
      state: "",
      pincode: "",
      gst: "",
      panNumber: "",
      type: "client",
      contactPerson: [],
      website: "",
      industry: "",
      notes: ""
    });
    setIsAddCompanyDialogOpen(false);
    toast.success("Company added successfully");
  } catch (err) {
  toast.error("Failed to add company");
}
  };

  // Add these functions in your Contacts component:
const handleEditContact = (contact: Contact) => {
  setEditingContact(contact);
  setEditContactData({
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    position: contact.position,
  });
  setIsEditContactDialogOpen(true);
};

const handleUpdateContact = async (contact: Contact) => {

  if (!editingContact) return;
  setEditingContact(contact);
  setEditContactData({
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    position: contact.position,
  });
  setIsEditContactDialogOpen(true);
  
  if (!editContactData.name || !editContactData.email) {
    toast.error("Please fill in required fields");
    return;
  }

  try {
    await updateContact(editingContact.id, editContactData);
    toast.success("Contact updated successfully");
    setIsEditContactDialogOpen(false);
    setEditingContact(null);
    setEditContactData({ name: "", email: "", phone: "", position: "" });
  } catch (err) {
    console.error('Error updating contact:', err);
    toast.error("Failed to update contact");
  }
};

const handleCancelEdit = () => {
  setIsEditContactDialogOpen(false);
  setEditingContact(null);
  setEditContactData({ name: "", email: "", phone: "", position: "" });
};

  return (
    <PageLayout title="Contacts">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Contact Management</h1>
        <p className="text-muted-foreground">Manage your contacts and companies</p>
      </div>

      <ContactTabs
        contacts={contacts || []}
        companies={companies || []}
        onAddContact={() => setIsAddContactDialogOpen(true)}
        onAddCompany={() => setIsAddCompanyDialogOpen(true)}
      />

      {/* Add Contact Dialog */}
      <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Add contact details for your client or vendor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="contactName">Full Name *</Label>
                <Input
                  id="contactName"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactPosition">Position</Label>
                <Input
                  id="contactPosition"
                  value={newContact.position}
                  onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                />
              </div>
              {/* <div>
                <Label htmlFor="contactCompany">Company</Label>
                <Select
                  value={newContact.companyId}
                    onValueChange={(value) => {
                      const selectedCompany = companies.find(c => c.id === value);
                      setNewContact({
                        ...newContact,
                        companyId: value,
                        companyType: selectedCompany?.type // ✅ 'client' or 'vendor'
                      });
                    }}                
                  >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {(companies || []).map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}
              <div className="relative">
                <Label htmlFor="contactCompany">Company</Label>
                <Input
                  ref={companyInputRef}
                  id="contactCompany"
                  value={companySearchValue}
                  onChange={handleCompanyInputChange}
                  onFocus={handleCompanyInputFocus}
                  placeholder="Search for a company..."
                  className="w-full"
                />
                
                {/* Company Dropdown */}
                {showCompanyDropdown && (
                  <div 
                    ref={companyDropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                  >
                    {/* Add New Company Option */}
                    <div
                      onClick={handleAddNewCompany}
                      className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 border-b border-gray-100"
                    >
                      <Plus className="h-4 w-4 mr-2 text-blue-600" />
                      <Building className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-blue-600 font-medium">Add New Company</span>
                    </div>
                    
                    {/* Company List */}
                    {filteredCompanies.length > 0 ? (
                      filteredCompanies.map((company) => (
                        <div
                          key={company.id}
                          onClick={() => handleCompanySelect(company)}
                          className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                        >
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-gray-500 text-xs">{company.email}</div>
                          </div>
                          <div className="flex items-center">
                            <span className={`text-xs px-2 py-1 rounded ${
                              company.type === 'client' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {company.type}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : companySearchValue ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No companies found for "{companySearchValue}"
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Type to search companies...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact}>Save Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Company Dialog */}
      <Dialog open={isAddCompanyDialogOpen} onOpenChange={setIsAddCompanyDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Add company details to organize your contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="companyEmail">Email *</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="companyPhone">Phone</Label>
                <Input
                  id="companyPhone"
                  value={newCompany.phone}
                  onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="companyGST">GST Number *</Label>
                <Input
                  id="companyGST"
                  value={newCompany.gst}
                  onChange={(e) => setNewCompany({ ...newCompany, gst: e.target.value })}
                  placeholder="Enter GST number"
                />
              </div>
              <div>
                <Label htmlFor="companyType">Type *</Label>
                <Select
                  value={newCompany.type}
                  onValueChange={(value: "client" | "vendor") => setNewCompany({ ...newCompany, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="companyCity">City</Label>
                <Input
                  id="companyCity"
                  value={newCompany.city}
                  onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="companyState">State</Label>
                <Input
                  id="companyState"
                  value={newCompany.state}
                  onChange={(e) => setNewCompany({ ...newCompany, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="companyPincode">Pincode</Label>
                <Input
                  id="companyPincode"
                  value={newCompany.pincode}
                  onChange={(e) => setNewCompany({ ...newCompany, pincode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="companyWebsite">Website</Label>
                <Input
                  id="companyWebsite"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="companyIndustry">Industry</Label>
                <Input
                  id="companyIndustry"
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Textarea
                  id="companyAddress"
                  value={newCompany.address}
                  onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="companyNotes">Notes</Label>
                <Textarea
                  id="companyNotes"
                  value={newCompany.notes}
                  onChange={(e) => setNewCompany({ ...newCompany, notes: e.target.value })}
                  placeholder="Additional notes about the company"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCompanyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCompany}>Save Company</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Contacts;