
import React, { useState } from "react";
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

const Contacts = () => {
  const { contacts, companies, addContact, addCompany } = useContacts();
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);
  
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    companyId: "",
    type: "individual" as const,
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

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.email) {
      toast.error("Please fill in required fields");
      return;
    }

    try{
    await addContact(newContact);
    toast.success("Contact added successfully");
    setNewContact({
      name: "",
      email: "",
      phone: "",
      position: "",
      companyId: "",
      type: "individual",
      companyType: "vendor"
    });
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
    await addCompany(companyData);
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
              <div>
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
