import React, { useState } from "react";
import PageLayout from "@/components/PageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmartFilters } from "@/components/common/SmartFilters";
import { VendorBillForm } from "@/components/vendor-bills/VendorBillForm";
import { PaymentDialog } from "@/components/common/PaymentDialog";
import { useVendorBills } from "@/hooks/useVendorBills";
import {
  PlusCircle,
  FileText,
  Eye,
  Download,
  CreditCard,
  CheckCircle,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/utils/calculations";
import { toast } from "@/components/ui/use-toast";

const VendorBills: React.FC = () => {
  const {
    vendorBills,
    vendors,
    filters,
    updateFilters,
    clearFilters,
    getActiveFilters,
    totalResults,
    filteredResults,
    createVendorBill,
    updateVendorBill,
    deleteVendorBill,
    getVendorBillById,
    refreshData,
    loading,
    error,
    summary,
  } = useVendorBills();

  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isEditBillOpen, setIsEditBillOpen] = useState(false);
  const [isViewBillOpen, setIsViewBillOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    billId: "",
    billNumber: "",
  });
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    billId: "",
    billNumber: "",
    amount: 0,
  });

  const handlePayment = async (paymentData: any) => {
    try {
      await updateVendorBill(paymentDialog.billId, {
        status: "paid",
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        paymentReference: paymentData.reference,
      });

      toast({
        title: "Payment Recorded",
        description: `Payment for ${paymentDialog.billNumber} recorded successfully.`,
      });
      setPaymentDialog({ open: false, billId: "", billNumber: "", amount: 0 });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    }
  };
  console.log("Loaded vendor bill info: ", vendorBills);

  const handleVerify = async (billId: string, billNumber: string) => {
    try {
      await updateVendorBill(billId, {
        status: "verified",
        verifiedDate: new Date().toISOString().split("T")[0],
        verifiedBy: "Current User",
      });

      toast({
        title: "Bill Verified",
        description: `${billNumber} verified successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify bill. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewBill = async (billId: string) => {
    try {
      console.log("bill id is: ", billId);
      const bill = await getVendorBillById(billId);
      setSelectedBill(bill);
      setIsViewBillOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bill details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditBill = async (billId: string) => {
    try {
      const bill = await getVendorBillById(billId);
      setSelectedBill(bill);
      setIsEditBillOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bill details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBill = async () => {
    try {
      await deleteVendorBill(deleteDialog.billId);
      toast({
        title: "Bill Deleted",
        description: `${deleteDialog.billNumber} deleted successfully.`,
      });
      setDeleteDialog({ open: false, billId: "", billNumber: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bill. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBill = async (billData: any) => {
    try {
      await updateVendorBill(selectedBill._id, billData);
      toast({
        title: "Bill Updated",
        description: "Vendor bill updated successfully.",
      });
      setIsEditBillOpen(false);
      setSelectedBill(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bill. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      verified: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      partial: "bg-orange-100 text-orange-800",
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  if (error) {
    return (
      <PageLayout title="Vendor Bills">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Vendor Bills">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm text-blue-800">Total Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-blue-700 mt-1">{totalResults} bills</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-sm text-green-800">Payable Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.totalPayable.toLocaleString()}</div>
              <p className="text-xs text-green-700 mt-1">After TDS</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-sm text-purple-800">Total TDS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.totalTDS.toLocaleString()}</div>
              <p className="text-xs text-purple-700 mt-1">Tax deducted</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-sm text-amber-800">Pending Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pendingBills}</div>
              <p className="text-xs text-amber-700 mt-1">Awaiting verification</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bills">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="bills">Bills</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button variant="outline" onClick={refreshData} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setIsAddBillOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Bill
              </Button>
            </div>
          </div>

          <TabsContent value="bills">
            <SmartFilters
              searchValue={filters.query || ''}
              onSearchChange={(v) => updateFilters({ query: v })}
              selectedStatus={filters.status}
              onStatusChange={(v) => updateFilters({ status: v })}
              dateRange={filters.dateRange}
              onDateRangeChange={(v) => updateFilters({ dateRange: v })}
              selectedSort={filters.sortBy}
              onSortChange={(v) => updateFilters({ sortBy: v })}
              totalResults={totalResults}
              filteredResults={filteredResults}
              onClearAll={clearFilters}
              activeFilters={getActiveFilters()}
            />

            <Card>
              <CardHeader>
                <CardTitle>Vendor Bills</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bill</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">TDS</TableHead>
                        <TableHead className="text-right">Payable</TableHead>
                        <TableHead>Paid On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorBills.map((bill) => (
                        <TableRow key={bill._id}>
                          <TableCell>
                            <div className="font-medium">{bill.billNumber}</div>
                            <div className="text-sm text-muted-foreground">{bill.description}</div>
                          </TableCell>
                          <TableCell>{bill.vendorName}</TableCell>
                          <TableCell>{formatDate(bill.billDate)}</TableCell>
                          <TableCell>{bill.department}</TableCell>
                          <TableCell className="text-right">₹{bill.totalAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">₹{bill.tdsAmount} ({bill.tdsRate}%)</TableCell>
                          <TableCell className="text-right">₹{bill.payableAmount.toLocaleString()}</TableCell>
                          <TableCell>{bill.paymentDate ? formatDate(bill.paymentDate) : '-'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(bill.status)}>
                              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewBill(bill._id)}
                                title="View Bill"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditBill(bill._id)}
                                title="Edit Bill"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setDeleteDialog({ 
                                  open: true, 
                                  billId: bill._id, 
                                  billNumber: bill.billNumber 
                                })}
                                title="Delete Bill"
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {bill.status === 'pending' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleVerify(bill._id, bill.billNumber)}
                                  title="Verify Bill"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {bill.status === 'verified' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setPaymentDialog({ 
                                    open: true, 
                                    billId: bill._id, 
                                    billNumber: bill.billNumber, 
                                    amount: bill.payableAmount 
                                  })}
                                  title="Record Payment"
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {vendorBills.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8">
                            <div className="text-muted-foreground">
                              No vendor bills found. Create your first bill to get started.
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Vendor Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload invoices to extract bill number, vendor, amount, taxes, and due date automatically.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Bill Dialog */}
        <VendorBillForm 
          open={isAddBillOpen} 
          onOpenChange={setIsAddBillOpen} 
          onSubmit={createVendorBill} 
          vendors={vendors} 
        />

        {/* Edit Bill Dialog */}
        <VendorBillForm 
          open={isEditBillOpen} 
          onOpenChange={setIsEditBillOpen} 
          onSubmit={handleUpdateBill} 
          vendors={vendors}
          initialData={selectedBill}
          mode="edit"
        />

        {/* View Bill Dialog */}
        <Dialog open={isViewBillOpen} onOpenChange={setIsViewBillOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bill Details - {selectedBill?.billNumber}</DialogTitle>
              <DialogDescription>
                View complete details of the vendor bill
              </DialogDescription>
            </DialogHeader>
            {selectedBill && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Vendor</label>
                    <p className="text-sm text-muted-foreground">{selectedBill.vendorName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusBadge(selectedBill.status)}>
                        {selectedBill.status.charAt(0).toUpperCase() + selectedBill.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bill Date</label>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedBill.billDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedBill.dueDate ? formatDate(selectedBill.dueDate) : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Amount</label>
                    <p className="text-sm text-muted-foreground">₹{selectedBill.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Payable Amount</label>
                    <p className="text-sm text-muted-foreground">₹{selectedBill.payableAmount.toLocaleString()}</p>
                  </div>
                </div>
                {selectedBill.description && (
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="text-sm text-muted-foreground">{selectedBill.description}</p>
                  </div>
                )}
                {selectedBill.attachments && selectedBill.attachments.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Attachments</label>
                    <div className="mt-2 space-y-2">
                      {selectedBill.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{attachment.name}</span>
                          <Button variant="ghost" size="sm" className="ml-auto">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Vendor Bill</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete bill "{deleteDialog.billNumber}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteBill} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Payment Dialog */}
        <PaymentDialog 
          open={paymentDialog.open} 
          onOpenChange={(open) => setPaymentDialog({ ...paymentDialog, open })} 
          onPayment={handlePayment} 
          totalAmount={paymentDialog.amount} 
          title={`Record Payment - ${paymentDialog.billNumber}`} 
        />
      </div>
    </PageLayout>
  );
};

export default VendorBills;