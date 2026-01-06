
import React, { useCallback, useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, TrendingUp, TrendingDown, FileText, Download, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";

interface GST {
  'month': String;
  'year' : String;
  'output' : Number;
  'payable' : Number;
  'input' : Number;
};

interface TDS {
  'month' : String;
  'year' : String;
  'collected' : Number;
  'paid' : Number;
  'payable' : Number;
};

interface TaxAmounts {
  invoiceTaxAmount: number;
  vendorTdsCredit: number;
}

interface Tax {
  'gst' : GST;
  // 'tds' : TDS;
}

// const getMonthOptions = () => {
//   const months = [];
//   const now = new Date();
  
//   for (let i = 0; i < 12; i++) {
//     const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
//     months.push({
//       value: `${date.getMonth()}-${date.getFullYear()}`,
//       label: format(date, "MMMM yyyy")
//     });
//   }
  
//   return months;
// };

const getMonthOptions = () => {
  const months = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    
    // 1. Get the 0-indexed month (0-11)
    const monthIndex = date.getMonth(); 
    
    // 2. Add 1 to get the 1-indexed month (1-12)
    const monthNumber = monthIndex + 1; 
    
    // 3. 💡 FIX: Pad the number with a leading zero if needed
    const paddedMonth = monthNumber.toString().padStart(2, '0');
    
    months.push({
      // The value sent to the backend should be MM-YYYY (e.g., '05-2025')
      value: `${paddedMonth}-${date.getFullYear()}`,
      label: format(date, "MMMM yyyy")
    });
  }
  
  return months;
};


const Taxes = () => {
  const { user } = useAuth() as { user: { role?: string } | null };
  const isSuperAdmin = user?.role === 'superadmin';
  
  const [loading, setLoading] = useState(true);
  const [taxes, setTaxes] = useState<Tax>();
  const [taxAmounts, setTaxAmounts] = useState<TaxAmounts>({ invoiceTaxAmount: 0, vendorTdsCredit: 0 });
  const baseUrl = import.meta.env.VITE_API_URL;
  const monthOptions = getMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  

  const fetchTaxes = useCallback(async (month: string) => {
    if (!month) return;
    setLoading(true);
      try {
        console.log('selected month is : ', month);
        const response = await fetch(`${baseUrl}/invoices/gst-billed`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json' 
          },
        body: JSON.stringify({ month: month })
        });
        if (!response.ok) {
        // read server error message if available
        const errText = await response.text().catch(() => '');
        throw new Error(`Server responded ${response.status}${errText ? `: ${errText}` : ''}`);
        }
        const data = await response.json();
        const payableNumber = Number(data.totalTaxAmount ?? data.payable ?? 0);
        const gstTaxData: GST = {
          month: data.month,
          year: data.year,
          payable: Number.isFinite(payableNumber) ? payableNumber : 0,
          output: Number.isFinite(payableNumber) ? payableNumber : 0,
          input: 0
        };
        // const tdsTaxData : TDS = {
        //   month : ;
        //   'year' : String;
        //   'collected' : Number;
        //   'paid' : Number;
        //   'payable' : Number;
        // };
        const taxData : Tax = {gst: gstTaxData};
        setTaxes(taxData);
        console.log("tax data is : ", taxData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
     }
  }, [baseUrl]);

  // Fetch total tax amounts (GST output and TDS paid) from the dashboard API
  const fetchTaxAmounts = useCallback(async (month: string) => {
    if (!month) return;
    try {
      // Parse month from "MM-YYYY" format
      const [monthNum, yearNum] = month.split('-').map(Number);
      
      // Calculate startDate (1st of the month) and endDate (last day of the month or today if current month)
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const lastDayOfMonth = new Date(yearNum, monthNum, 0);
      const today = new Date();
      const endDate = lastDayOfMonth > today ? today : lastDayOfMonth;
      
      // Format dates as YYYY-MM-DD
      const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);
      
      console.log('Fetching tax amounts for:', startDateStr, 'to', endDateStr);
      
      const response = await fetch(
        `${baseUrl}/dashboard/total-tax-amount?startDate=${startDateStr}&endDate=${endDateStr}`,
        { credentials: 'include' }
      );
      
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Server responded ${response.status}${errText ? `: ${errText}` : ''}`);
      }
      
      const data = await response.json();
      console.log('Tax amounts response:', data);
      
      setTaxAmounts({
        invoiceTaxAmount: Number(data.invoiceTaxAmount) || 0,
        vendorTdsCredit: Number(data.vendorTdsCredit) || 0
      });
    } catch (error) {
      console.error("Error fetching tax amounts:", error);
    }
  }, [baseUrl]);

  useEffect(() => {
    console.log("selectedMonth : ", selectedMonth);
        // Call the fetch functions immediately upon component mount
        fetchTaxes(selectedMonth);
        fetchTaxAmounts(selectedMonth);

        // The dependency array ensures that 
        // the effect runs only on mount AND whenever selectedMonth changes.
    }, [fetchTaxes, fetchTaxAmounts, selectedMonth]);

   if (loading || !taxes) {
    return (
      <PageLayout title="Tax Dashboard">
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          Loading tax data…
        </div>
      </PageLayout>
    );
  }

  const [month, year] = selectedMonth.split('-').map(Number);  
  const totalLiability = taxes?.gst?.payable ?? 0;


  return (
    <PageLayout title="Tax Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tax Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive overview of your tax obligations and compliance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-60 bg-white">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <SelectValue placeholder="Select month" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white">
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSuperAdmin && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5" />
                GST Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Output Tax</span>
                  <span className="font-medium">₹{taxAmounts.invoiceTaxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Input Tax Credit</span>
                  <span className="font-medium">₹{taxes.gst.input.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Net GST Payable</span>
                    <span className="text-blue-600">₹{(taxAmounts.invoiceTaxAmount - Number(taxes.gst.input)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                TDS Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TDS Collected</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TDS Paid</span>
                  <span className="font-medium">₹{taxAmounts.vendorTdsCredit.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Net TDS Payable</span>
                    <span className="text-amber-600">₹{taxAmounts.vendorTdsCredit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">GSTR-1</span>
                  <Badge variant={taxData.compliance.gstr1Filed ? "default" : "destructive"}>
                    {taxData.compliance.gstr1Filed ? "Filed" : "Pending"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">GSTR-3B</span>
                  <Badge variant={taxData.compliance.gstr3bFiled ? "default" : "destructive"}>
                    {taxData.compliance.gstr3bFiled ? "Filed" : "Pending"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">TDS Returns</span>
                  <Badge variant={taxData.compliance.tdsReturns ? "default" : "destructive"}>
                    {taxData.compliance.tdsReturns ? "Filed" : "Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card> */}

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Total Tax Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST Payable</span>
                  <span className="font-medium">₹{(taxAmounts.invoiceTaxAmount - Number(taxes.gst.input)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TDS Payable</span>
                  <span className="font-medium">₹{taxAmounts.vendorTdsCredit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Penalties</span>
                  <span className="font-medium text-red-600">₹0</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Liability</span>
                    <span className="text-green-600 text-lg">₹{(taxAmounts.invoiceTaxAmount - Number(taxes.gst.input) + taxAmounts.vendorTdsCredit).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tax Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>GST Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="text-right">Tax Rate</TableHead>
                  </TableRow>
                </TableHeader>
                {/* <TableBody>
                  <TableRow>
                    <TableCell>Sales (18% GST)</TableCell>
                    <TableCell className="text-right">₹{Math.round(taxData.gst.output * 0.6).toLocaleString()}</TableCell>
                    <TableCell className="text-right">18%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sales (12% GST)</TableCell>
                    <TableCell className="text-right">₹{Math.round(taxData.gst.output * 0.3).toLocaleString()}</TableCell>
                    <TableCell className="text-right">12%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sales (5% GST)</TableCell>
                    <TableCell className="text-right">₹{Math.round(taxData.gst.output * 0.1).toLocaleString()}</TableCell>
                    <TableCell className="text-right">5%</TableCell>
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell>Total Output Tax</TableCell>
                    <TableCell className="text-right">₹{taxData.gst.output.toLocaleString()}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                </TableBody> */}
              </Table>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>TDS Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>194C - Professional Services</TableCell>
                    <TableCell className="text-right">₹{Math.round(taxData.tds.collected * 0.4).toLocaleString()}</TableCell>
                    <TableCell className="text-right">2%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>194J - Technical Services</TableCell>
                    <TableCell className="text-right">₹{Math.round(taxData.tds.collected * 0.3).toLocaleString()}</TableCell>
                    <TableCell className="text-right">2%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>194I - Rent</TableCell>
                    <TableCell className="text-right">₹{Math.round(taxData.tds.collected * 0.2).toLocaleString()}</TableCell>
                    <TableCell className="text-right">10%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Others</TableCell>
                    <TableCell className="text-right">₹{Math.round(taxData.tds.collected * 0.1).toLocaleString()}</TableCell>
                    <TableCell className="text-right">Various</TableCell>
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell>Total TDS Collected</TableCell>
                    <TableCell className="text-right">₹{taxData.tds.collected.toLocaleString()}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card> */}
        </div>

        {/* Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Tax Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tax Type</TableHead>
                  <TableHead className="text-right">Opening Balance</TableHead>
                  <TableHead className="text-right">Current Month</TableHead>
                  <TableHead className="text-right">Payments Made</TableHead>
                  <TableHead className="text-right">Closing Balance</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">GST</TableCell>
                  <TableCell className="text-right">₹{(Number(taxes.gst.payable) * 0.2).toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{Number(taxes.gst.payable).toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{(Number(taxes.gst.payable) * 0.8).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">₹{(Number(taxes.gst.payable) * 0.4).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="destructive">Due</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TDS</TableCell>
                  <TableCell className="text-right">₹-</TableCell>
                  <TableCell className="text-right">₹-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right font-medium">₹-</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">--</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Interest & Penalties</TableCell>
                  <TableCell className="text-right">₹-</TableCell>
                  <TableCell className="text-right">₹-</TableCell>
                  <TableCell className="text-right">₹-</TableCell>
                  <TableCell className="text-right font-medium text-red-600">₹-</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="destructive">--</Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/30">
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-medium">₹{(Number(taxes.gst.payable) * 0.2)}</TableCell> {/* + (taxData.tds.payable * 0.1) + (taxData.penalties * 0.5)).toLocaleString() */}
                  <TableCell className="text-right font-medium">₹-</TableCell>
                  <TableCell className="text-right font-medium">₹-</TableCell>
                  <TableCell className="text-right font-semibold text-lg">₹-</TableCell>
                  {/* <TableCell className="text-right font-medium">₹{(taxData.gst.payable + taxData.tds.payable + (taxData.penalties * 0.5)).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">₹{((taxData.gst.payable * 0.8) + (taxData.tds.payable * 0.9)).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold text-lg">₹{totalLiability.toLocaleString()}</TableCell> */}
                  <TableCell className="text-right">
                    <Badge variant="destructive">Action Required</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Taxes;
