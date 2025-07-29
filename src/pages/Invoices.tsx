import React, { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Download, Filter, Eye, Edit, Send, CalendarIcon, X } from "lucide-react";
import { CreateInvoiceForm } from "@/components/invoices/CreateInvoiceForm";
import { Invoice, ViewInvoiceDialog, EditInvoiceDialog } from "@/components/invoices/InvoicesDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

// interface Invoice {
//   _id: string;
//   tenantId: string;
//   invoiceNumber: string;
//   clientId: string;
//   clientName: string;
//   department: string;
//   issueDate: string;
//   dueDate: string;
//   hsnCode?: string;
//   currency: string;
//   lineItems: Array<{
//     service?: string;
//     description: string;
//     quantity: number;
//     rate: number;
//     amount: number;
//   }>;
//   subtotal: number;
//   discount: number;
//   cgst: number;
//   sgst: number;
//   igst: number;
//   taxAmount: number;
//   total: number;
//   status: 'paid' | 'unpaid' | 'partial' | 'overdue' | 'draft';
//   notes?: string;
//   paymentHistory?: Array<{
//     amount: number;
//     paymentDate: string;
//     paymentMethod?: string;
//     reference?: string;
//     notes?: string;
//   }>;
//   createdAt: string;
//   updatedAt: string;
// }

interface FilterState {
  dateType: 'issueDate' | 'dueDate' | '' | 'none';
  startDate: Date | undefined;
  endDate: Date | undefined;
  status: 'all' | 'paid' | 'unpaid' | 'partial' | 'overdue';
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    dateType: 'none',
    startDate: undefined,
    endDate: undefined,
    status: 'all'
  });
 
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`${baseUrl}/invoices`, {
          credentials: 'include'
        });
        const data = await response.json();
        setInvoices(data);
        setFilteredInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);
  
  // Apply filters whenever filters or invoices change
  useEffect(() => {
    let filtered = [...invoices];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filters.status);
    }

    // Filter by date range
    if (filters.dateType!= 'none' && filters.startDate && filters.endDate) {
      filtered = filtered.filter(invoice => {
        const dateToCheck = filters.dateType === 'issueDate' ? 
          new Date(invoice.issueDate) : 
          new Date(invoice.dueDate);
        
        return dateToCheck >= filters.startDate! && dateToCheck <= filters.endDate!;
      });
    }

    setFilteredInvoices(filtered);
  }, [filters, invoices]);

   const clearFilters = () => {
    setFilters({
      dateType: '',
      startDate: undefined,
      endDate: undefined,
      status: 'all'
    });
  };

  const hasActiveFilters = filters.status !== 'all' || 
    filters.dateType !== '' || 
    filters.startDate || 
    filters.endDate;


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.total, 0);
  const paidAmount = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const pendingAmount = filteredInvoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0);

  return (
    <PageLayout title="Invoices">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <div className="flex gap-4">
        <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className={hasActiveFilters ? "bg-blue-50 border-blue-300" : ""}>
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {hasActiveFilters && <Badge variant="secondary" className="ml-2">{filteredInvoices.length}</Badge>}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filter Invoices</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, status: value as FilterState['status'] }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Type Filter */}
                <div className="space-y-2">
                  <Label>Date Filter</Label>
                  <Select value={filters.dateType} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, dateType: value as FilterState['dateType'] }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Date Filter</SelectItem>
                      <SelectItem value="issueDate">Issue Date</SelectItem>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                {filters.dateType && (
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !filters.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.startDate ? format(filters.startDate, "dd/MM/yyyy") : "Start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.startDate}
                            onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !filters.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.endDate ? format(filters.endDate, "dd/MM/yyyy") : "End date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.endDate}
                            onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                            disabled={(date) => filters.startDate ? date < filters.startDate : false}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button onClick={() => setFilterDialogOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button onClick={() => setCreateDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Create Invoice</Button>
        </div>
      </div>
{/* 

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Invoiced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-600">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle  className="text-sm font-medium text-orange-600">Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">₹{pendingAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
      </div>


      <Card>
        <CardHeader><CardTitle>All Invoices</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
              ) : invoices.length === 0 ? (
                <TableRow><TableCell colSpan={7}>No invoices found</TableCell></TableRow>
              ) : (
                invoices.map(invoice => (
                  <TableRow key={invoice._id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-medium">₹{invoice.total.toLocaleString()}</TableCell>
                    <TableCell><Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewInvoice(invoice)}
                          title="View Invoice"> <Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditInvoice(invoice)}
                          title="Edit Invoice"><Edit className="h-4 w-4" /></Button>
                        {/* {invoice.status === 'draft' && ( *
                          <Button variant="ghost" size="sm"><Send className="h-4 w-4" /></Button>                        
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}

      
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <X className="h-3 w-3 cursor-pointer" onClick={() => 
                setFilters(prev => ({ ...prev, status: 'all' }))
              } />
            </Badge>
          )}
          {filters.dateType!= 'none' && filters.startDate && filters.endDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.dateType === 'issueDate' ? 'Issue Date' : 'Due Date'}: 
              {format(filters.startDate, 'dd/MM/yyyy')} - {format(filters.endDate, 'dd/MM/yyyy')}
              <X className="h-3 w-3 cursor-pointer" onClick={() => 
                setFilters(prev => ({ ...prev, dateType: '', startDate: undefined, endDate: undefined }))
              } />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Invoiced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{filteredInvoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{filteredInvoices.filter(i => i.status === 'paid').length} paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-gray-500">{filteredInvoices.filter(i => i.status !== 'paid').length} pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {hasActiveFilters ? 'No invoices match your filters' : 'No invoices found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map(invoice => (
                  <TableRow key={invoice._id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-medium">₹{invoice.total.toLocaleString()}</TableCell>
                    <TableCell><Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewInvoice(invoice)}
                          title="View Invoice"> <Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditInvoice(invoice)}
                          title="Edit Invoice"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><Send className="h-4 w-4" /></Button>                        
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateInvoiceForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateInvoice={(newInvoice) => {
          setInvoices(prev => [...prev, newInvoice]);
          toast.success("Invoice created!");
        }}
      />
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
          toast.success("Invoice updated successfully!");
        }}
      />
    </PageLayout>
  );
};

export default Invoices;
