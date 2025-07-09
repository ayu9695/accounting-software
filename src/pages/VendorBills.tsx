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
    summary,
  } = useVendorBills();

  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    billId: "",
    billNumber: "",
    amount: 0,
  });

  const handlePayment = (paymentData: any) => {
    updateVendorBill(paymentDialog.billId, {
      status: "paid",
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      paymentReference: paymentData.reference,
    });

    toast({
      title: "Payment Recorded",
      description: `Payment for ${paymentDialog.billNumber} recorded.`,
    });
  };

  const handleVerify = (billId: string, billNumber: string) => {
    updateVendorBill(billId, {
      status: "verified",
      verifiedDate: new Date().toISOString().split("T")[0],
      verifiedBy: "Current User",
    });

    toast({
      title: "Bill Verified",
      description: `${billNumber} verified successfully.`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      verified: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

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

            <Button onClick={() => setIsAddBillOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Bill
            </Button>
          </div>

          <TabsContent value="bills">
            <SmartFilters
              searchValue={filters.query || ''}
              onSearchChange={(v) => updateFilters({ query: v })}
              // statusOptions={["pending", "verified", "paid"]}
              selectedStatus={filters.status}
              onStatusChange={(v) => updateFilters({ status: v })}
              dateRange={filters.dateRange}
              onDateRangeChange={(v) => updateFilters({ dateRange: v })}
              // sortOptions={["uploadDate", "totalAmount"]}
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>
                          <div className="font-medium">{bill.billNumber}</div>
                          <div className="text-sm text-muted-foreground">{bill.description}</div>
                        </TableCell>
                        <TableCell>{bill.vendorName}</TableCell>
                        <TableCell>{formatDate(bill.billDate)}</TableCell>
                        <TableCell>{bill.category}</TableCell>
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
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            {bill.status === 'pending' && (
                              <Button variant="ghost" size="sm" onClick={() => handleVerify(bill.id, bill.billNumber)}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {bill.status === 'verified' && (
                              <Button variant="ghost" size="sm" onClick={() => setPaymentDialog({ open: true, billId: bill.id, billNumber: bill.billNumber, amount: bill.payableAmount })}>
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

        <VendorBillForm open={isAddBillOpen} onOpenChange={setIsAddBillOpen} onSubmit={createVendorBill} vendors={vendors} />

        <PaymentDialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ ...paymentDialog, open })} onPayment={handlePayment} totalAmount={paymentDialog.amount} title={`Record Payment - ${paymentDialog.billNumber}`} />
      </div>
    </PageLayout>
  );
};

export default VendorBills;
