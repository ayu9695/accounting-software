import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Client {
  id: string;
  _id: string,
  name: string;
  email: string;
  address?: string;
  gstin?: string;
}

interface CreateInvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateInvoice: (invoiceData: any) => void;
}

export const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({
  open,
  onOpenChange,
  onCreateInvoice
}) => {
  // States
  const [formData, setFormData] = useState({
    clientName: "",
    clientId:"",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: "",
    clientGST: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hsnCode: "",
    currency: "INR",
    cgst: 9,
    sgst: 9,
    igst: 0,
    discount: 0,
    notes: "",
    termsAndConditions: ""
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  // New states for client management
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    address: "",
    gstin: ""
  });
  const [savingClient, setSavingClient] = useState(false);
  const baseUrl = import.meta.env.VITE_API_URL;

  // Fetch clients from backend
  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await fetch(`${baseUrl}/clients`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch clients');
      const clientsData = await response.json();
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  };

  // Load clients when dialog opens
  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  // Filter clients for autocomplete
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients.slice(0, 5); // Show first 5 when no search
    return clients.filter(client => 
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase())
    ).slice(0, 5);
  }, [clients, clientSearch]);

  // Handle client selection from autocomplete
  const handleClientSelect = (client: Client) => {
    console.log("selecting client: ", client);
    setFormData({
      ...formData,
      clientName: client.name,
      clientId: client._id,
      clientEmail: client.email,
      clientAddress: client.address || "",
      clientGST: client.gstin || ""
    });
    console.log("setting form data: ", formData);
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  // Handle client name input change
  const handleClientNameChange = (value: string) => {
    setClientSearch(value);
    setFormData({ ...formData, clientName: value });
    
    // Clear other client fields if manually typing
    if (!clients.find(c => c.name === value)) {
      setFormData(prev => ({
        ...prev,
        clientName: value,
        clientId:"",
        clientEmail: "",
        clientAddress: "",
        clientGST: ""
      }));
    }
  };

  // Handle client input focus to show dropdown
  const handleClientInputFocus = () => {
    setShowClientDropdown(true);
  };

  // Add new client function
  const addNewClient = async () => {
    if (!newClientData.name || !newClientData.email) {
      toast.error("Client name and email are required");
      return;
    }

    setSavingClient(true);
    console.log("saving client request : ", newClientData);
    try {
      const response = await fetch(`${baseUrl}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         credentials: 'include',
        body: JSON.stringify(newClientData),
      });

      if (!response.ok) throw new Error('Failed to create client');
      
      const createdClient = await response.json();
      
      // Refresh clients list
      await fetchClients();
      
      // Pre-fill form with new client data
      handleClientSelect(createdClient);
      
      // Close dialog and reset form
      setShowAddClientDialog(false);
      setNewClientData({ name: "", email: "", address: "", gstin: "" });
      
      toast.success("Client created successfully!");
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Failed to create client');
    } finally {
      setSavingClient(false);
    }
  };

  // Existing line item functions (unchanged)
  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      }
      return item;
    }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  // Calculations (unchanged)
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * formData.discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const cgstAmount = (taxableAmount * formData.cgst) / 100;
  const sgstAmount = (taxableAmount * formData.sgst) / 100;
  const igstAmount = (taxableAmount * formData.igst) / 100;
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const total = taxableAmount + totalTax;

  // Updated submit handler with backend integration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.clientEmail) {
      toast.error("Client name and email are required");
      return;
    }

    if (lineItems.some(item => !item.description || item.rate <= 0)) {
      toast.error("Please complete all line items");
      return;
    }

    setSavingInvoice(true);

    try {
      const invoiceData = {
        ...formData,
        lineItems: lineItems.map(({ id, ...item }) => item),
        subtotal,
        discountAmount,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalTax,
        total,
        status: "unpaid"
      };

      // Save to backend
      const response = await fetch(`${baseUrl}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         credentials: 'include',
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) throw new Error('Failed to save invoice');
      
      const savedInvoice = await response.json();
      
      // Call the parent handler with the saved invoice
      onCreateInvoice(savedInvoice);
      onOpenChange(false);
      
      toast.success("Invoice created successfully!");
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    } finally {
      setSavingInvoice(false);
    }
  };

  // Reset form helper
  const resetForm = () => {
    setFormData({
      clientName: "",
      clientId:"",
      clientEmail: "",
      clientAddress: "",
      clientGST: "",
      invoiceNumber:"",
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hsnCode: "",
      currency: "INR",
      cgst: 9,
      sgst: 9,
      igst: 0,
      discount: 0,
      notes: "",
      termsAndConditions: ""
    });
    setLineItems([{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }]);
    setClientSearch("");
    setShowClientDropdown(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create New Invoice</DialogTitle>
          </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information with Autocomplete */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="clientName" className="text-sm font-medium">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={clientSearch}
                    onChange={(e) => handleClientNameChange(e.target.value)}
                    onFocus={handleClientInputFocus}
                    // onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                    placeholder="Start typing client name..."
                    className="mt-1"
                    required
                  />
                  
                  {/* Autocomplete Dropdown */}
                  {showClientDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {/* Add New Client Option */}
                      <div
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b bg-blue-25 font-medium text-blue-700"
                        onClick={() => {
                          setShowAddClientDialog(true);
                          setShowClientDropdown(false);
                        }}
                      >
                        <UserPlus className="h-4 w-4 inline mr-2" />
                        Add New Client
                      </div>
                      
                      {loadingClients ? (
                        <div className="p-3 text-center text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                          Loading clients...
                        </div>
                      ) : filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <div
                            key={client._id}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleClientSelect(client)}
                          >
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-gray-500 text-center">
                          No clients found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="clientEmail" className="text-sm font-medium">Client Email *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="Enter client email"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientGST" className="text-sm font-medium">Client GST Number</Label>
                  <Input
                    id="clientGST"
                    value={formData.clientGST}
                    onChange={(e) => setFormData({ ...formData, clientGST: e.target.value })}
                    placeholder="Enter GST number"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="clientAddress" className="text-sm font-medium">Client Address</Label>
                <Textarea
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  placeholder="Enter client address"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Rest of the form remains the same... */}
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber" className="text-sm font-medium">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="Enter Invoice number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="issueDate" className="text-sm font-medium">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate" className="text-sm font-medium">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hsnCode" className="text-sm font-medium">HSN Code</Label>
                  <Input
                    id="hsnCode"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                    placeholder="Enter HSN code"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-blue-700">Line Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 border rounded-lg bg-gray-50">
                    <div className="col-span-5">
                      <Label className="text-sm font-medium">Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Enter item description"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium">Rate</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium">Amount</Label>
                      <Input
                        value={`₹${item.amount.toFixed(2)}`}
                        readOnly
                        className="bg-gray-100 mt-1"
                      />
                    </div>
                    <div className="col-span-1">
                      {lineItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tax Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Tax Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="discount" className="text-sm font-medium">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cgst" className="text-sm font-medium">CGST (%)</Label>
                  <Input
                    id="cgst"
                    type="number"
                    min="0"
                    max="50"
                    step="0.01"
                    value={formData.cgst}
                    onChange={(e) => setFormData({ ...formData, cgst: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sgst" className="text-sm font-medium">SGST (%)</Label>
                  <Input
                    id="sgst"
                    type="number"
                    min="0"
                    max="50"
                    step="0.01"
                    value={formData.sgst}
                    onChange={(e) => setFormData({ ...formData, sgst: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="igst" className="text-sm font-medium">IGST (%)</Label>
                  <Input
                    id="igst"
                    type="number"
                    min="0"
                    max="50"
                    step="0.01"
                    value={formData.igst}
                    onChange={(e) => setFormData({ ...formData, igst: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              {/* Calculation Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount ({formData.discount}%):</span>
                      <span className="text-red-600">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Taxable Amount:</span>
                      <span>₹{taxableAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>CGST ({formData.cgst}%):</span>
                      <span>₹{cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST ({formData.sgst}%):</span>
                      <span>₹{sgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IGST ({formData.igst}%):</span>
                      <span>₹{igstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter any additional notes..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="termsAndConditions" className="text-sm font-medium">Terms & Conditions</Label>
                <Textarea
                  id="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  placeholder="Enter terms and conditions..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={savingInvoice}>
              {savingInvoice ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Add New Client Dialog */}
    <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add New Client</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="newClientName" className="text-sm font-medium">Client Name *</Label>
            <Input
              id="newClientName"
              value={newClientData.name}
              onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
              placeholder="Enter client name"
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="newClientEmail" className="text-sm font-medium">Client Email *</Label>
            <Input
              id="newClientEmail"
              type="email"
              value={newClientData.email}
              onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
              placeholder="Enter client email"
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="newClientAddress" className="text-sm font-medium">Client Address</Label>
            <Textarea
              id="newClientAddress"
              value={newClientData.address}
              onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
              placeholder="Enter client address"
              className="mt-1"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="newClientGST" className="text-sm font-medium">GST Number</Label>
            <Input
              id="newClientGST"
              value={newClientData.gstin}
              onChange={(e) => setNewClientData({ ...newClientData, gstin: e.target.value })}
              placeholder="Enter GST number"
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setShowAddClientDialog(false);
              setNewClientData({ name: "", email: "", address: "", gstin: "" });
            }}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={addNewClient}
            disabled={savingClient}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {savingClient ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding Client...
              </>
            ) : (
              'Add Client'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
};