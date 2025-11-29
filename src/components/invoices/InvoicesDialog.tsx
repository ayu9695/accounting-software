import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, UserPlus, Loader2, Edit, Save, X, Eye, Download, Send } from "lucide-react";
import { toast } from "sonner";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Client {
  _id: string;
  name: string;
  email: string;
  address?: string;
  gstin?: string;
}

interface Department {
  _id: string;
  tenantId: string;
  name: string;
}

export interface Invoice {
  _id: string;
  tenantId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  department: string;
  issueDate: string;
  dueDate: string;
  hsnCode?: string;
  currency: string;
  lineItems: LineItem[];
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  total: number;
  status: 'paid' | 'unpaid' | 'partial' | 'overdue';
  notes?: string;
    amount: number;
    paymentDate: string;
    paymentMethod?: string;
    reference?: string;
    paymentnotes?: string;
  createdAt: string;
  updatedAt: string;
  remainingAmount: number;
  bankAccountDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
    branch?: string;
  };
}

interface ViewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onEditInvoice: (invoice: Invoice) => void;
}

interface EditInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onUpdateInvoice: (updatedInvoice: Invoice) => void;
}

// View Invoice Dialog Component
export const ViewInvoiceDialog: React.FC<ViewInvoiceDialogProps> = ({
  open,
  onOpenChange,
  invoice,
  onEditInvoice
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (open) {
      fetchDepartments();
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
  try {
    const res = await fetch(`${baseUrl}/settings`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load settings');
    const data = await res.json();
    const sanitized = (data.bankAccountDetails || []).map((b: any) => ({
      id: b._id || b.id || b.accountNumber,
      accountName: b.accountName || '',
      accountNumber: b.accountNumber || '',
      bankName: b.bankName || '',
      ifscCode: b.ifscCode || '',
      branch: b.branch || '',
      primaryAccount: !!b.primaryAccount
    }));
    setBankAccounts(sanitized);
  } catch (err) {
    console.error('Failed to fetch settings:', err);
  }
};

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${baseUrl}/departments`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data: Department[] = await res.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find(d => d._id === departmentId);
    return dept ? dept.name : 'Unknown Department';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/invoices/pdf/${invoice._id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Invoice PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/invoices/${invoice._id}/send`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to send invoice');
      
      toast.success('Invoice sent successfully');
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Invoice #{invoice.invoiceNumber}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.toUpperCase()}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={loading}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleSendInvoice} disabled={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invoice
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEditInvoice(invoice)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Invoice Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Invoice Number</Label>
                  <p className="font-semibold">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Issue Date</Label>
                  <p>{new Date(invoice.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Due Date</Label>
                  <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Currency</Label>
                  <p>{invoice.currency}</p>
                </div>
                {invoice.hsnCode && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">HSN Code</Label>
                    <p>{invoice.hsnCode}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Department</Label>
                  <p>{getDepartmentName(invoice.department)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          {invoice.bankAccountDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">Bank Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Account Name</Label>
                    <p className="font-medium">{invoice.bankAccountDetails.accountName || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Account Number</Label>
                    <p>{invoice.bankAccountDetails.accountNumber || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Bank Name</Label>
                    <p>{invoice.bankAccountDetails.bankName || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">IFSC Code</Label>
                    <p>{invoice.bankAccountDetails.ifscCode || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Branch</Label>
                    <p>{invoice.bankAccountDetails.branch || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Client Name</Label>
                  <p className="font-semibold">{invoice.clientName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Items & Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Description</th>
                      <th className="text-center py-2">Quantity</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">
                          {item.id && <div className="font-medium">{item.id}</div>}
                          <div className="text-gray-600">{item.description}</div>
                        </td>
                        <td className="text-center py-3">{item.quantity}</td>
                        <td className="text-right py-3">₹{item.rate.toFixed(2)}</td>
                        <td className="text-right py-3 font-medium">₹{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({invoice.discount}%):</span>
                      <span>-₹{((invoice.subtotal * invoice.discount) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.cgst > 0 && (
                    <div className="flex justify-between">
                      <span>CGST ({invoice.cgst}%):</span>
                      <span>₹{((invoice.subtotal - (invoice.subtotal * invoice.discount / 100)) * invoice.cgst / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.sgst > 0 && (
                    <div className="flex justify-between">
                      <span>SGST ({invoice.sgst}%):</span>
                      <span>₹{((invoice.subtotal - (invoice.subtotal * invoice.discount / 100)) * invoice.sgst / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.igst > 0 && (
                    <div className="flex justify-between">
                      <span>IGST ({invoice.igst}%):</span>
                      <span>₹{((invoice.subtotal - (invoice.subtotal * invoice.discount / 100)) * invoice.igst / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          {/* {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.paymentHistory.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">₹{payment.amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                          {payment.paymentMethod && ` • ${payment.paymentMethod}`}
                          {payment.reference && ` • Ref: ${payment.reference}`}
                        </div>
                        {payment.notes && (
                          <div className="text-sm text-gray-500">{payment.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )} */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Edit Invoice Dialog Component
export const EditInvoiceDialog: React.FC<EditInvoiceDialogProps> = ({
  open,
  onOpenChange,
  invoice,
  onUpdateInvoice
}) => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientId: "",
    department: undefined,
    invoiceNumber: "",
    issueDate: "",
    dueDate: "",
    hsnCode: "",
    currency: "INR",
    cgst: 9,
    sgst: 9,
    igst: 0,
    discount: 0,
    notes: "",
    status: 'unpaid' as 'paid' | 'unpaid' | 'partial' | 'overdue'
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

    // NEW: bank accounts & selection
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<any | null>(null);


  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (open && invoice) {
      loadInvoiceData();
      fetchClients();
      fetchDepartments();
      fetchSettings();
    }
  }, [open, invoice]);

    const fetchSettings = async () => {
    try {
      const res = await fetch(`${baseUrl}/settings`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      const sanitized = (data.bankAccountDetails || []).map((b: any) => ({
        id: b.accountNumber,
        accountName: b.accountName || '',
        accountNumber: b.accountNumber || '',
        bankName: b.bankName || '',
        ifscCode: b.ifscCode || '',
        branch: b.branch || '',
        primaryAccount: !!b.primaryAccount
      }));
      setBankAccounts(sanitized);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

    // Reset bank selection when dialog is closed or invoice changes to one without bank details
  // useEffect(() => {
  //   if (!open) {
  //     // dialog closed -> ensure we clear selection so next open is fresh
  //     setSelectedBank(null);
  //     setSelectedBankId('');
  //     return;
  //   }

  //   // If dialog opened with an invoice that has no bank details, clear selection
  //   if (open && invoice && !invoice.bankAccountDetails) {
  //     setSelectedBank(null);
  //     setSelectedBankId('');
  //   }
  // }, [open, invoice]);

  const loadInvoiceData = () => {
    if (!invoice) return;

    setFormData({
      clientName: invoice.clientName,
      clientId: invoice.clientId,
      department: invoice.department,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.split('T')[0],
      dueDate: invoice.dueDate.split('T')[0],
      hsnCode: invoice.hsnCode || "",
      currency: invoice.currency,
      cgst: invoice.cgst,
      sgst: invoice.sgst,
      igst: invoice.igst,
      discount: invoice.discount,
      notes: invoice.notes || "",
      status: invoice.status
    });

    setLineItems(invoice.lineItems.map((item, index) => ({
      ...item,
      id: index.toString()
    })) as any);

        // prefill selected bank from invoice if present (fallback)
    // if (invoice.bankAccountDetails) {
    //   setSelectedBank({
    //     id: invoice.bankAccountDetails.accountNumber || '',
    //     ...invoice.bankAccountDetails
    //   });
    //   setSelectedBankId(invoice.bankAccountDetails.accountNumber || '');
    // } 
    // else {
    //   // IMPORTANT: clear previous selection when invoice has no bank details
    //   setSelectedBank(null);
    //   setSelectedBankId('');
    // }
  };

    // When bankAccounts are available (or invoice changes), set the selected bank if invoice has bank details.
  useEffect(() => {
    if (!open) return; // only apply while dialog is open

    // If invoice has bankAccountDetails we try to match with sanitized bankAccounts
    if (invoice && invoice.bankAccountDetails) {
      // Candidate ids that invoice might carry — try multiple fallbacks
      const candidates = [
        invoice.bankAccountDetails.accountNumber,
        // the backend might store the _id instead, try that too if you have it:
        (invoice.bankAccountDetails as any)._id,
        invoice.bankAccountDetails.accountName,
        invoice.bankAccountDetails.bankName
      ].filter(Boolean).map(String);

      // If bankAccounts already loaded, try to find a match
      if (bankAccounts.length > 0) {
        let matched = null;
        for (const c of candidates) {
          matched = bankAccounts.find(b => b.id === c || b.accountNumber === c || b.accountName === c || b.bankName === c);
          if (matched) break;
        }
        if (matched) {
          setSelectedBankId(matched.id);
          setSelectedBank(matched);
          return;
        }
      }

      // If no match yet (bankAccounts not loaded or no match), set selectedBankId to '' so UI shows placeholder.
      // We'll attempt again when bankAccounts array changes (this effect will re-run).
      setSelectedBankId('');
      setSelectedBank(null);
      return;
    }

    // If invoice has no bank details — ensure selection is cleared
    setSelectedBank(null);
    setSelectedBankId('');
  }, [open, invoice, bankAccounts]);


    useEffect(() => {
    if (bankAccounts.length > 0 && selectedBankId) {
      const b = bankAccounts.find(x => x.id === selectedBankId);
      if (b) setSelectedBank(b);
    }
  }, [bankAccounts, selectedBankId]);

    const handleSelectBankById = (id: string) => {
    setSelectedBankId(id);
    const bank = bankAccounts.find(b => (b.id || '') === id) || null;
    if (bank) {
      setSelectedBank({ ...bank });
    } else {
      setSelectedBank(null);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${baseUrl}/clients`, { credentials: 'include' });
      if (response.ok) {
        const clientsData = await response.json();
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${baseUrl}/departments`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data: Department[] = await res.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems(items => items.map((item, i) => {
      if (i === index) {
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
        id:"",
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * formData.discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const cgstAmount = (taxableAmount * formData.cgst) / 100;
  const sgstAmount = (taxableAmount * formData.sgst) / 100;
  const igstAmount = (taxableAmount * formData.igst) / 100;
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const total = taxableAmount + totalTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.invoiceNumber) {
      toast.error("Client name and invoice number are required");
      return;
    }

    if (lineItems.some(item => !item.description || item.rate <= 0)) {
      toast.error("Please complete all line items");
      return;
    }

    setSaving(true);

    const bankPayload = selectedBank ? {
        accountName: selectedBank.accountName || '',
        accountNumber: selectedBank.accountNumber || '',
        bankName: selectedBank.bankName || '',
        ifscCode: selectedBank.ifscCode || '',
        branch: selectedBank.branch || ''
      } : null;

    try {
      const updatedInvoiceData = {
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
        bankAccountDetails: bankPayload
      };

      if (!updatedInvoiceData.department) {
        delete updatedInvoiceData.department;
      }
      
      const response = await fetch(`${baseUrl}/invoices/${invoice!._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedInvoiceData)
      });

      if (!response.ok) throw new Error('Failed to update invoice');
      
      const updatedInvoice = await response.json();
      
      onUpdateInvoice(updatedInvoice);
      onOpenChange(false);
      
      toast.success("Invoice updated successfully!");
      
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
    } finally {
      setSaving(false);
      setSelectedBank(null);
      setSelectedBankId('');
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Invoice #{invoice.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
                {/* <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hsnCode">HSN Code</Label>
                  <Input
                    id="hsnCode"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Account Name dropdown */}
                <div>
                  <Label className="text-sm font-medium">Account Name</Label>
                  <Select value={selectedBankId} onValueChange={(value) => handleSelectBankById(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Account Name" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.length === 0 ? (
                        // DON'T use SelectItem with value="" — render a plain message instead
                        <div className="p-3 text-gray-500">No bank accounts</div>
                      ) : bankAccounts.map((b, i) => {
                        const id = String(b.id || `bank-${i}`); // safe non-empty id
                        return (
                          <SelectItem key={id} value={id}>
                            {b.accountName} {/* change this to b.accountNumber or b.bankName for other selects */}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Account Number dropdown */}
                <div>
                  <Label className="text-sm font-medium">Account Number</Label>
                  <Select value={selectedBankId} onValueChange={(value) => handleSelectBankById(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Account Number" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.length === 0 ? (
                        // DON'T use SelectItem with value="" — render a plain message instead
                        <div className="p-3 text-gray-500">No bank accounts</div>
                      ) : bankAccounts.map((b, i) => {
                        const id = String(b.id || `bank-${i}`); // safe non-empty id
                        return (
                          <SelectItem key={id} value={id}>
                            {b.accountNumber} {/* change this to b.accountNumber or b.bankName for other selects */}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bank Name dropdown */}
                <div>
                  <Label className="text-sm font-medium">Bank Name</Label>
                  <Select value={selectedBankId} onValueChange={(value) => handleSelectBankById(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Bank Name" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.length === 0 ? (
                        // DON'T use SelectItem with value="" — render a plain message instead
                        <div className="p-3 text-gray-500">No bank accounts</div>
                      ) : bankAccounts.map((b, i) => {
                        const id = String(b.id || `bank-${i}`); // safe non-empty id
                        return (
                          <SelectItem key={id} value={id}>
                            {b.bankName} {/* change this to b.accountNumber or b.bankName for other selects */}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* IFSC / Branch read-only */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">IFSC Code</Label>
                  <Input value={selectedBank?.ifscCode || ''} readOnly className="mt-1 bg-gray-100 cursor-not-allowed" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Branch</Label>
                  <Input value={selectedBank?.branch || ''} readOnly className="mt-1 bg-gray-100 cursor-not-allowed" />
                </div>
                <div></div>
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
                  <div key={index} className="grid grid-cols-12 gap-3 items-end p-4 border rounded-lg bg-gray-50">
                    <div className="col-span-5">
                      <Label className="text-sm font-medium">Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
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
                        onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
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
                          onClick={() => removeLineItem(index)}
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
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="cgst">CGST (%)</Label>
                  <Input
                    id="cgst"
                    type="number"
                    min="0"
                    max="50"
                    step="0.01"
                    value={formData.cgst}
                    onChange={(e) => setFormData({ ...formData, cgst: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="sgst">SGST (%)</Label>
                  <Input
                    id="sgst"
                    type="number"
                    min="0"
                    max="50"
                    step="0.01"
                    value={formData.sgst}
                    onChange={(e) => setFormData({ ...formData, sgst: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="igst">IGST (%)</Label>
                  <Input
                    id="igst"
                    type="number"
                    min="0"
                    max="50"
                    step="0.01"
                    value={formData.igst}
                    onChange={(e) => setFormData({ ...formData, igst: parseFloat(e.target.value) || 0 })}
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

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter any additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating Invoice...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Invoice
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Usage in the main Invoices component - Update the buttons in the table
// Replace the existing action buttons with:

/*
<TableCell>
  <div className="flex gap-2">
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => setViewInvoice(invoice)}
    >
      <Eye className="h-4 w-4" />
    </Button>
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => setEditInvoice(invoice)}
    >
      <Edit className="h-4 w-4" />
    </Button>
    {invoice.status === 'draft' && (
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => handleSendInvoice(invoice)}
      >
        <Send className="h-4 w-4" />
      </Button>
    )}
  </div>
</TableCell>
*/

// Add these state variables to your main Invoices component:
/*
const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

// Add these dialogs at the end of your Invoices component JSX:
<ViewInvoiceDialog
  open={!!viewInvoice}
  onOpenChange={(open) => !open && setViewInvoice(null)}
  invoice={viewInvoice}
  onEditInvoice={(invoice) => {
    setViewInvoice(null);
    setEditInvoice(invoice);
  }}
/>

<EditInvoiceDialog
  open={!!editInvoice}
  onOpenChange={(open) => !open && setEditInvoice(null)}
  invoice={editInvoice}
  onUpdateInvoice={(updatedInvoice) => {
    setInvoices(prev => prev.map(inv => 
      inv._id === updatedInvoice._id ? updatedInvoice : inv
    ));
    setEditInvoice(null);
  }}
/>
*/