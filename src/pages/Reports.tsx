
import React, { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Enhanced mock financial data with more detailed breakdown
const generateDetailedFinancialData = (month: number, year: number) => {
  const multiplier = (month % 3) + 0.8;
  
  return {
    incomeStatement: {
      revenue: {
        salesRevenue: Math.round(120000 * multiplier),
        serviceRevenue: Math.round(45000 * multiplier),
        otherIncome: Math.round(8000 * multiplier),
        total: Math.round(173000 * multiplier)
      },
      expenses: {
        costOfGoodsSold: Math.round(65000 * multiplier),
        operatingExpenses: {
          salariesAndWages: Math.round(35000 * multiplier),
          rentAndUtilities: Math.round(12000 * multiplier),
          marketingAndAdvertising: Math.round(8000 * multiplier),
          professionalFees: Math.round(5000 * multiplier),
          depreciation: Math.round(4000 * multiplier),
          insurance: Math.round(2500 * multiplier),
          other: Math.round(6500 * multiplier),
          total: Math.round(73000 * multiplier)
        },
        totalExpenses: Math.round(138000 * multiplier)
      },
      grossProfit: Math.round(108000 * multiplier),
      operatingIncome: Math.round(35000 * multiplier),
      netIncome: Math.round(30000 * multiplier),
      taxes: Math.round(5000 * multiplier)
    },
    balanceSheet: {
      assets: {
        currentAssets: {
          cash: Math.round(85000 * multiplier),
          accountsReceivable: Math.round(45000 * multiplier),
          inventory: Math.round(32000 * multiplier),
          prepaidExpenses: Math.round(8000 * multiplier),
          total: Math.round(170000 * multiplier)
        },
        fixedAssets: {
          propertyPlantEquipment: Math.round(180000 * multiplier),
          accumulatedDepreciation: Math.round(-35000 * multiplier),
          intangibleAssets: Math.round(25000 * multiplier),
          total: Math.round(170000 * multiplier)
        },
        totalAssets: Math.round(340000 * multiplier)
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable: Math.round(25000 * multiplier),
          shortTermDebt: Math.round(15000 * multiplier),
          accruedExpenses: Math.round(12000 * multiplier),
          taxesPayable: Math.round(8000 * multiplier),
          total: Math.round(60000 * multiplier)
        },
        longTermLiabilities: {
          longTermDebt: Math.round(80000 * multiplier),
          deferredTaxLiabilities: Math.round(10000 * multiplier),
          total: Math.round(90000 * multiplier)
        },
        totalLiabilities: Math.round(150000 * multiplier)
      },
      equity: {
        shareCapital: Math.round(100000 * multiplier),
        retainedEarnings: Math.round(90000 * multiplier),
        total: Math.round(190000 * multiplier)
      }
    },
    cashFlow: {
      operating: {
        netIncome: Math.round(30000 * multiplier),
        depreciation: Math.round(4000 * multiplier),
        accountsReceivableChange: Math.round(-5000 * multiplier),
        inventoryChange: Math.round(-3000 * multiplier),
        accountsPayableChange: Math.round(2000 * multiplier),
        total: Math.round(28000 * multiplier)
      },
      investing: {
        equipmentPurchases: Math.round(-15000 * multiplier),
        softwareInvestments: Math.round(-5000 * multiplier),
        total: Math.round(-20000 * multiplier)
      },
      financing: {
        loanProceeds: Math.round(10000 * multiplier),
        loanRepayments: Math.round(-8000 * multiplier),
        dividendsPaid: Math.round(-5000 * multiplier),
        total: Math.round(-3000 * multiplier)
      },
      netCashFlow: Math.round(5000 * multiplier)
    }
  };
};

// Create period options
const getPeriodOptions = () => {
  const periods = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push({
      value: `${date.getMonth()}-${date.getFullYear()}`,
      label: format(date, "MMMM yyyy")
    });
  }
  
  return periods;
};

const Reports = () => {
  const periodOptions = getPeriodOptions();
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0].value);
  
  // Parse the selected period
  const [month, year] = selectedPeriod.split('-').map(Number);
  
  // Get financial data for the selected period
  const financialData = generateDetailedFinancialData(month, year);
  
  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const formattedAmount = `₹${Math.abs(amount).toLocaleString()}`;
    return isNegative ? `(${formattedAmount})` : formattedAmount;
  };

  const getTrendIcon = (amount: number) => {
    return amount >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <PageLayout title="Financial Reports">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground mt-2">Comprehensive financial analysis and statements</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="bg-white w-60">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white">
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="income" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow Statement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Income Statement
                <Badge variant="outline">{format(new Date(year, month), "MMM yyyy")}</Badge>
              </CardTitle>
              <CardDescription>
                Comprehensive profit & loss statement showing revenue, expenses, and net income
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/3">Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center w-16">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="font-semibold bg-blue-50">
                    <TableCell colSpan={3} className="text-blue-800">REVENUE</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Sales Revenue</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.revenue.salesRevenue)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.incomeStatement.revenue.salesRevenue)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Service Revenue</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.revenue.serviceRevenue)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.incomeStatement.revenue.serviceRevenue)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Other Income</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.revenue.otherIncome)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.incomeStatement.revenue.otherIncome)}</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold border-t">
                    <TableCell>Total Revenue</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.revenue.total)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.incomeStatement.revenue.total)}</TableCell>
                  </TableRow>
                  
                  <TableRow className="font-semibold bg-orange-50">
                    <TableCell colSpan={3} className="text-orange-800">COST OF GOODS SOLD</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Cost of Goods Sold</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.expenses.costOfGoodsSold)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(-financialData.incomeStatement.expenses.costOfGoodsSold)}</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold bg-green-50">
                    <TableCell className="text-green-800">Gross Profit</TableCell>
                    <TableCell className="text-right text-green-800">{formatCurrency(financialData.incomeStatement.grossProfit)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.incomeStatement.grossProfit)}</TableCell>
                  </TableRow>
                  
                  <TableRow className="font-semibold bg-red-50">
                    <TableCell colSpan={3} className="text-red-800">OPERATING EXPENSES</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Salaries and Wages</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.expenses.operatingExpenses.salariesAndWages)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(-financialData.incomeStatement.expenses.operatingExpenses.salariesAndWages)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Rent and Utilities</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.expenses.operatingExpenses.rentAndUtilities)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(-financialData.incomeStatement.expenses.operatingExpenses.rentAndUtilities)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Marketing & Advertising</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.expenses.operatingExpenses.marketingAndAdvertising)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(-financialData.incomeStatement.expenses.operatingExpenses.marketingAndAdvertising)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Professional Fees</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.expenses.operatingExpenses.professionalFees)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(-financialData.incomeStatement.expenses.operatingExpenses.professionalFees)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Depreciation</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.expenses.operatingExpenses.depreciation)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(-financialData.incomeStatement.expenses.operatingExpenses.depreciation)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Insurance</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.expenses.operatingExpenses.insurance)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(-financialData.incomeStatement.expenses.operatingExpenses.insurance)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Other Operating Expenses</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.expenses.operatingExpenses.other)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(-financialData.incomeStatement.expenses.operatingExpenses.other)}</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold border-t">
                    <TableCell>Total Operating Expenses</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.expenses.operatingExpenses.total)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(-financialData.incomeStatement.expenses.operatingExpenses.total)}</TableCell>
                  </TableRow>
                  
                  <TableRow className="font-semibold bg-blue-50">
                    <TableCell className="text-blue-800">Operating Income</TableCell>
                    <TableCell className="text-right text-blue-800">{formatCurrency(financialData.incomeStatement.operatingIncome)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.incomeStatement.operatingIncome)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Income Tax Expense</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.incomeStatement.taxes)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(-financialData.incomeStatement.taxes)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-green-100 border-t-2">
                    <TableCell className="text-green-800 text-lg">NET INCOME</TableCell>
                    <TableCell className="text-right text-green-800 text-lg">{formatCurrency(financialData.incomeStatement.netIncome)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.incomeStatement.netIncome)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="balance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Balance Sheet
                <Badge variant="outline">As of {format(new Date(year, month, 28), "MMM dd, yyyy")}</Badge>
              </CardTitle>
              <CardDescription>
                Statement of financial position showing assets, liabilities, and equity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assets */}
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead colSpan={2} className="text-center bg-blue-50 text-blue-800 font-bold">ASSETS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="font-semibold bg-blue-50">
                        <TableCell colSpan={2} className="text-blue-800">Current Assets</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Cash and Cash Equivalents</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.assets.currentAssets.cash)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Accounts Receivable</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.assets.currentAssets.accountsReceivable)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Inventory</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.assets.currentAssets.inventory)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Prepaid Expenses</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.assets.currentAssets.prepaidExpenses)}</TableCell>
                      </TableRow>
                      <TableRow className="font-semibold border-t">
                        <TableCell>Total Current Assets</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.assets.currentAssets.total)}</TableCell>
                      </TableRow>
                      
                      <TableRow className="font-semibold bg-blue-50">
                        <TableCell colSpan={2} className="text-blue-800">Fixed Assets</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Property, Plant & Equipment</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.assets.fixedAssets.propertyPlantEquipment)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Less: Accumulated Depreciation</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.assets.fixedAssets.accumulatedDepreciation)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Intangible Assets</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.assets.fixedAssets.intangibleAssets)}</TableCell>
                      </TableRow>
                      <TableRow className="font-semibold border-t">
                        <TableCell>Total Fixed Assets</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.assets.fixedAssets.total)}</TableCell>
                      </TableRow>
                      
                      <TableRow className="font-bold bg-blue-100 border-t-2">
                        <TableCell className="text-blue-800 text-lg">TOTAL ASSETS</TableCell>
                        <TableCell className="text-right text-blue-800 text-lg">{formatCurrency(financialData.balanceSheet.assets.totalAssets)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Liabilities & Equity */}
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead colSpan={2} className="text-center bg-red-50 text-red-800 font-bold">LIABILITIES & EQUITY</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="font-semibold bg-red-50">
                        <TableCell colSpan={2} className="text-red-800">Current Liabilities</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Accounts Payable</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.liabilities.currentLiabilities.accountsPayable)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Short-term Debt</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.liabilities.currentLiabilities.shortTermDebt)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Accrued Expenses</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.liabilities.currentLiabilities.accruedExpenses)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Taxes Payable</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.liabilities.currentLiabilities.taxesPayable)}</TableCell>
                      </TableRow>
                      <TableRow className="font-semibold border-t">
                        <TableCell>Total Current Liabilities</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.liabilities.currentLiabilities.total)}</TableCell>
                      </TableRow>
                      
                      <TableRow className="font-semibold bg-red-50">
                        <TableCell colSpan={2} className="text-red-800">Long-term Liabilities</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Long-term Debt</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.liabilities.longTermLiabilities.longTermDebt)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Deferred Tax Liabilities</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.liabilities.longTermLiabilities.deferredTaxLiabilities)}</TableCell>
                      </TableRow>
                      <TableRow className="font-semibold border-t">
                        <TableCell>Total Long-term Liabilities</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.liabilities.longTermLiabilities.total)}</TableCell>
                      </TableRow>
                      <TableRow className="font-semibold border-t">
                        <TableCell>Total Liabilities</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.liabilities.totalLiabilities)}</TableCell>
                      </TableRow>
                      
                      <TableRow className="font-semibold bg-green-50">
                        <TableCell colSpan={2} className="text-green-800">Equity</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Share Capital</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.equity.shareCapital)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6">Retained Earnings</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.equity.retainedEarnings)}</TableCell>
                      </TableRow>
                      <TableRow className="font-semibold border-t">
                        <TableCell>Total Equity</TableCell>
                        <TableCell className="text-right">{formatCurrency(financialData.balanceSheet.equity.total)}</TableCell>
                      </TableRow>
                      
                      <TableRow className="font-bold bg-gray-100 border-t-2">
                        <TableCell className="text-gray-800 text-lg">TOTAL LIABILITIES & EQUITY</TableCell>
                        <TableCell className="text-right text-gray-800 text-lg">{formatCurrency(financialData.balanceSheet.liabilities.totalLiabilities + financialData.balanceSheet.equity.total)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cashflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Cash Flow Statement
                <Badge variant="outline">{format(new Date(year, month), "MMM yyyy")}</Badge>
              </CardTitle>
              <CardDescription>
                Statement of cash flows from operating, investing, and financing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/3">Cash Flow Activity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center w-16">Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="font-semibold bg-green-50">
                    <TableCell colSpan={3} className="text-green-800">OPERATING ACTIVITIES</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Net Income</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.cashFlow.operating.netIncome)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.operating.netIncome)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Depreciation and Amortization</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.cashFlow.operating.depreciation)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.operating.depreciation)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Changes in Accounts Receivable</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.cashFlow.operating.accountsReceivableChange)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.operating.accountsReceivableChange)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Changes in Inventory</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.cashFlow.operating.inventoryChange)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.operating.inventoryChange)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Changes in Accounts Payable</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.cashFlow.operating.accountsPayableChange)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.operating.accountsPayableChange)}</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold border-t bg-green-100">
                    <TableCell className="text-green-800">Net Cash from Operating Activities</TableCell>
                    <TableCell className="text-right text-green-800">{formatCurrency(financialData.cashFlow.operating.total)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.operating.total)}</TableCell>
                  </TableRow>
                  
                  <TableRow className="font-semibold bg-blue-50">
                    <TableCell colSpan={3} className="text-blue-800">INVESTING ACTIVITIES</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Equipment Purchases</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.cashFlow.investing.equipmentPurchases)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.investing.equipmentPurchases)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Software Investments</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.cashFlow.investing.softwareInvestments)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.investing.softwareInvestments)}</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold border-t bg-blue-100">
                    <TableCell className="text-blue-800">Net Cash from Investing Activities</TableCell>
                    <TableCell className="text-right text-blue-800">{formatCurrency(financialData.cashFlow.investing.total)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.investing.total)}</TableCell>
                  </TableRow>
                  
                  <TableRow className="font-semibold bg-purple-50">
                    <TableCell colSpan={3} className="text-purple-800">FINANCING ACTIVITIES</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Loan Proceeds</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.cashFlow.financing.loanProceeds)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.financing.loanProceeds)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Loan Repayments</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.cashFlow.financing.loanRepayments)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.financing.loanRepayments)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-6">Dividends Paid</TableCell>
                    <TableCell className="text-right">{formatCurrency(financialData.cashFlow.financing.dividendsPaid)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.financing.dividendsPaid)}</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold border-t bg-purple-100">
                    <TableCell className="text-purple-800">Net Cash from Financing Activities</TableCell>
                    <TableCell className="text-right text-purple-800">{formatCurrency(financialData.cashFlow.financing.total)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.financing.total)}</TableCell>
                  </TableRow>
                  
                  <TableRow className="font-bold bg-gray-100 border-t-2">
                    <TableCell className="text-gray-800 text-lg">NET CHANGE IN CASH</TableCell>
                    <TableCell className="text-right text-gray-800 text-lg">{formatCurrency(financialData.cashFlow.netCashFlow)}</TableCell>
                    <TableCell className="text-center">{getTrendIcon(financialData.cashFlow.netCashFlow)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Reports;
