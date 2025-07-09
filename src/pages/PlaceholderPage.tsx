
import React, { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PlaceholderPageProps {
  title: string;
}

// Mock tax data - in a real app, this would come from an API
const generateMockTaxData = (month: number, year: number) => {
  // Generate some varying data based on month for demonstration
  const multiplier = (month % 3) + 0.8;
  return {
    clientGST: Math.round(25000 * multiplier),
    vendorGST: Math.round(17500 * multiplier),
    clientTDS: Math.round(10000 * multiplier),
    vendorTDS: Math.round(8500 * multiplier),
  };
};

// Create an array of months from current month back through the last 12 months
const getMonthOptions = () => {
  const months = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: `${date.getMonth()}-${date.getFullYear()}`,
      label: format(date, "MMMM yyyy")
    });
  }
  
  return months;
};

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  const monthOptions = getMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  
  // Parse the selected month-year
  const [month, year] = selectedMonth.split('-').map(Number);
  
  // Get tax data for the selected month
  const taxData = generateMockTaxData(month, year);
  
  // Calculate payable amounts
  const gstPayable = taxData.clientGST - taxData.vendorGST;
  const tdsPayable = taxData.vendorTDS;
  
  return (
    <PageLayout title={title}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title} Dashboard</h1>
        <div className="w-60">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="bg-white">
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">GST Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Client GST</dt>
                <dd className="font-medium">₹{taxData.clientGST.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Vendor GST</dt>
                <dd className="font-medium">₹{taxData.vendorGST.toLocaleString()}</dd>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <dt>GST Payable</dt>
                  <dd className={cn(gstPayable >= 0 ? "text-accounting-success" : "text-accounting-danger")}>
                    ₹{gstPayable.toLocaleString()}
                  </dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">TDS Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Client TDS</dt>
                <dd className="font-medium">₹{taxData.clientTDS.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Vendor TDS</dt>
                <dd className="font-medium">₹{taxData.vendorTDS.toLocaleString()}</dd>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <dt>TDS Payable</dt>
                  <dd className="text-accounting-success">₹{tdsPayable.toLocaleString()}</dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Tax Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST Payable</dt>
                <dd className={cn(gstPayable >= 0 ? "text-accounting-success" : "text-accounting-danger")}>
                  ₹{gstPayable.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">TDS Payable</dt>
                <dd className="text-accounting-success">₹{tdsPayable.toLocaleString()}</dd>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <dt>Total Liability</dt>
                  <dd className={cn((gstPayable + tdsPayable) >= 0 ? "text-accounting-success" : "text-accounting-danger")}>
                    ₹{(gstPayable + tdsPayable).toLocaleString()}
                  </dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Detailed Tax Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tax Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Payable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">GST</TableCell>
                <TableCell>₹{taxData.clientGST.toLocaleString()}</TableCell>
                <TableCell>₹{taxData.vendorGST.toLocaleString()}</TableCell>
                <TableCell className={cn(gstPayable >= 0 ? "text-accounting-success" : "text-accounting-danger")}>
                  ₹{gstPayable.toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">TDS</TableCell>
                <TableCell>₹{taxData.clientTDS.toLocaleString()}</TableCell>
                <TableCell>₹{taxData.vendorTDS.toLocaleString()}</TableCell>
                <TableCell className="text-accounting-success">₹{tdsPayable.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow className="bg-muted/30">
                <TableCell className="font-semibold">Total</TableCell>
                <TableCell className="font-medium">₹{(taxData.clientGST + taxData.clientTDS).toLocaleString()}</TableCell>
                <TableCell className="font-medium">₹{(taxData.vendorGST + taxData.vendorTDS).toLocaleString()}</TableCell>
                <TableCell className={cn("font-semibold", (gstPayable + tdsPayable) >= 0 ? "text-accounting-success" : "text-accounting-danger")}>
                  ₹{(gstPayable + tdsPayable).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default PlaceholderPage;
