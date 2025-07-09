
import React, { useState, useEffect } from "react";
import { PopupForm } from "@/components/ui/popup-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { CurrencySelect, getCurrencySymbol } from "@/components/ui/currency-select";
import { Plus, Trash2 } from "lucide-react";
import { useSettings } from "@/pages/Settings";
import { useContacts } from "@/hooks/useContacts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface LineItem {
  id: string;
  service: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface EnhancedInvoiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (invoice: any) => void;
}

export const EnhancedInvoiceFormDialog: React.FC<EnhancedInvoiceFormDialogProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const { companySettings } = useSettings();
  const { contacts } = useContacts();
  
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: `INV-${Date.now()}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    hsnCode: "",
    currency: companySettings.currency,
    cgst: 9,
    sgst: 9,
    igst: 0,
    customField: "",
    notes: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", service: "", description: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  const handleClientSelect = (clientName: string) => {
    const contact = contacts.find(c => c.name === clientName);
    if (contact) {
      setFormData(prev => ({
        ...prev,
        clientName: contact.name,
        clientEmail: contact.email,
        clientAddress: contact.companyId ? `Contact via ${contact.companyId}` : ""
      }));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      service: "",
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

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const cgstAmount = (subtotal * formData.cgst) / 100;
  const sgstAmount = (subtotal * formData.sgst) / 100;
  const igstAmount = (subtotal * formData.igst) / 100;
  const taxAmount = cgstAmount + sgstAmount + igstAmount;
  const total = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.dueDate || !formData.hsnCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (lineItems.some(item => !item.service || !item.description || item.rate === 0)) {
      toast.error("Please complete all line items");
      return;
    }

    const invoice = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      lineItems,
      subtotal,
      cgst: cgstAmount,
      sgst: sgstAmount,
      igst: igstAmount,
      taxAmount,
      total,
      status: "unpaid"
    };

    onSave(invoice);
    onOpenChange(false);
    toast.success("Invoice created successfully");
  };

  return (
    <PopupForm
      title="Create New Invoice"
      description="Fill in the details to create a new invoice"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      className="max-w-6xl max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Select
              value={formData.clientName}
              onValueChange={handleClientSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select or enter client name" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.name}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Client Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
              placeholder="Enter client email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientAddress">Client Address</Label>
          <Textarea
            id="clientAddress"
            value={formData.clientAddress}
            onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
            placeholder="Enter client address"
          />
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue Date</Label>
            <Input
              id="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hsnCode">HSN Code *</Label>
            <Input
              id="hsnCode"
              value={formData.hsnCode}
              onChange={(e) => setFormData({...formData, hsnCode: e.target.value})}
              placeholder="Enter HSN code"
            />
          </div>
        </div>

        <CurrencySelect
          label="Currency"
          value={formData.currency}
          onValueChange={(value) => setFormData({...formData, currency: value})}
        />

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Line Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-3">
                  <Label className="text-sm">Service</Label>
                  <Input
                    value={item.service}
                    onChange={(e) => updateLineItem(item.id, 'service', e.target.value)}
                    placeholder="Service name"
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-sm">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Service description"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm">Rate</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1">
                  <Label className="text-sm">Amount</Label>
                  <Input
                    value={`${getCurrencySymbol(formData.currency)}${item.amount.toFixed(2)}`}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(item.id)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cgst">CGST (%)</Label>
            <Input
              id="cgst"
              type="number"
              min="0"
              step="0.01"
              value={formData.cgst}
              onChange={(e) => setFormData({...formData, cgst: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sgst">SGST (%)</Label>
            <Input
              id="sgst"
              type="number"
              min="0"
              step="0.01"
              value={formData.sgst}
              onChange={(e) => setFormData({...formData, sgst: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="igst">IGST (%)</Label>
            <Input
              id="igst"
              type="number"
              min="0"
              step="0.01"
              value={formData.igst}
              onChange={(e) => setFormData({...formData, igst: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customField">Custom Field</Label>
          <Input
            id="customField"
            value={formData.customField}
            onChange={(e) => setFormData({...formData, customField: e.target.value})}
            placeholder="Add any custom information"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes or terms"
          />
        </div>

        {/* Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{getCurrencySymbol(formData.currency)}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>CGST ({formData.cgst}%):</span>
            <span>{getCurrencySymbol(formData.currency)}{cgstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>SGST ({formData.sgst}%):</span>
            <span>{getCurrencySymbol(formData.currency)}{sgstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>IGST ({formData.igst}%):</span>
            <span>{getCurrencySymbol(formData.currency)}{igstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{getCurrencySymbol(formData.currency)}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </PopupForm>
  );
};
