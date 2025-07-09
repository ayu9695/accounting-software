
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Mail, Phone, Building } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position?: string;
  companyId?: string;
  type: 'individual' | 'company';
}

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  industry?: string;
  contacts: Contact[];
}

interface ContactTabsProps {
  contacts: Contact[];
  companies: Company[];
  onAddContact: () => void;
  onAddCompany: () => void;
}

export const ContactTabs: React.FC<ContactTabsProps> = ({
  contacts,
  companies,
  onAddContact,
  onAddCompany,
}) => {
  const [activeTab, setActiveTab] = useState("contacts");

  const getCompanyContacts = (companyId: string) => {
    return contacts.filter(contact => contact.companyId === companyId);
  };

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return "Individual";
    const company = companies.find(c => c.id === companyId);
    return company?.name || "Unknown Company";
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex items-center justify-between mb-6">
        <TabsList className="grid w-60 grid-cols-2">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
        </TabsList>
        
        <div className="flex gap-2">
          <Button onClick={onAddCompany} variant="outline">
            <Building className="mr-2 h-4 w-4" />
            Add Company
          </Button>
          <Button onClick={onAddContact} className="bg-accounting-blue hover:bg-accounting-blue/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      <TabsContent value="contacts">
        <Card>
          <CardHeader>
            <CardTitle>All Contacts ({contacts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{getCompanyName(contact.companyId)}</TableCell>
                    <TableCell>{contact.position || "N/A"}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="icon" variant="ghost">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="companies">
        <Card>
          <CardHeader>
            <CardTitle>All Companies ({companies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {companies.map((company) => (
                <div key={company.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.address}</p>
                      {company.website && (
                        <p className="text-sm text-blue-600">{company.website}</p>
                      )}
                      {company.industry && (
                        <Badge variant="secondary" className="mt-1">
                          {company.industry}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {getCompanyContacts(company.id).length} contacts
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                    <div>Email: {company.email}</div>
                    <div>Phone: {company.phone}</div>
                  </div>
                  
                  {getCompanyContacts(company.id).length > 0 && (
                    <div className="border-t pt-3">
                      <h4 className="font-medium mb-2">Contacts:</h4>
                      <div className="grid gap-2">
                        {getCompanyContacts(company.id).map((contact) => (
                          <div key={contact.id} className="flex items-center justify-between bg-muted/30 p-2 rounded">
                            <div>
                              <span className="font-medium">{contact.name}</span>
                              {contact.position && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  - {contact.position}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{contact.email}</span>
                              <span>{contact.phone}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
