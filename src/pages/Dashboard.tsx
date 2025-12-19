
import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  TrendingUpIcon,
  BanknoteIcon,
  ReceiptCentIcon,
  ShoppingBagIcon,
  CalendarIcon,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import InvoiceStatusChart from "@/components/dashboard/InvoiceStatusChart";
import RecentInvoices from "@/components/dashboard/RecentInvoices";
import UpcomingPayments from "@/components/dashboard/UpcomingPayments";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface Invoice {
  _id: string;
  tenantId: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  status: 'paid' | 'unpaid' | 'partial' | 'overdue';
}

interface ForeignRevenueItem {
  totalRevenue: number;
  taxAmount: number;
  count: number;
}

interface DashboardSummary {
  totalRevenue: number;
  totalExpenses: number;
  taxLiability: number;
  breakdown: {
    vendorBillsExpense: number;
    salariesExpense: number;
    otherExpenses: number;
    invoiceTaxAmount: number;
    vendorTdsAmount: number;
  };
  foreignRevenue?: {
    [currency: string]: ForeignRevenueItem;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

// Currency symbols map
const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get first day of a month
const getFirstDayOfMonth = (year: number, month: number): string => {
  return formatDate(new Date(year, month, 1));
};

// Get last day of a month (or current date if it's the current month)
const getLastDayOfMonth = (year: number, month: number): string => {
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
  
  if (isCurrentMonth) {
    return formatDate(now);
  }
  
  // Last day of the month
  return formatDate(new Date(year, month + 1, 0));
};

// Generate month options for the last 12 months + current month
const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    options.push({ value, label, year: date.getFullYear(), month: date.getMonth() });
  }
  
  return options;
};

const Dashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [previousMonthSummary, setPreviousMonthSummary] = useState<DashboardSummary | null>(null);
  
  // Filter states
  const [filterType, setFilterType] = useState<'month' | 'custom'>('month');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}`;
  });
  const [startDate, setStartDate] = useState(() => getFirstDayOfMonth(new Date().getFullYear(), new Date().getMonth()));
  const [endDate, setEndDate] = useState(() => formatDate(new Date()));
  
  const baseUrl = import.meta.env.VITE_API_URL;
  const monthOptions = generateMonthOptions();

  // Fetch dashboard summary based on date filters
  const fetchDashboardSummary = async (start: string, end: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}/dashboard/summary?startDate=${start}&endDate=${end}`,
        { credentials: 'include' }
      );
      
      if (!response.ok) throw new Error('Failed to fetch dashboard summary');
      
      const data: DashboardSummary = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch previous month's summary for comparison
  const fetchPreviousMonthSummary = async (year: number, month: number) => {
    try {
      // Calculate previous month
      const prevDate = new Date(year, month - 1, 1);
      const prevYear = prevDate.getFullYear();
      const prevMonth = prevDate.getMonth();
      
      const start = getFirstDayOfMonth(prevYear, prevMonth);
      const end = formatDate(new Date(prevYear, prevMonth + 1, 0)); // Last day of prev month
      
      const response = await fetch(
        `${baseUrl}/dashboard/summary?startDate=${start}&endDate=${end}`,
        { credentials: 'include' }
      );
      
      if (!response.ok) {
        setPreviousMonthSummary(null);
        return;
      }
      
      const data: DashboardSummary = await response.json();
      setPreviousMonthSummary(data);
    } catch (error) {
      console.error("Error fetching previous month summary:", error);
      setPreviousMonthSummary(null);
    }
  };

  // Fetch invoices for charts (can be filtered or all)
  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${baseUrl}/invoices`, {
        credentials: 'include'
      });
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  // Initial load - current month
  useEffect(() => {
    const now = new Date();
    const start = getFirstDayOfMonth(now.getFullYear(), now.getMonth());
    const end = formatDate(now);
    
    fetchDashboardSummary(start, end);
    fetchPreviousMonthSummary(now.getFullYear(), now.getMonth());
    fetchInvoices();
  }, []);

  // Handle month filter change
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    const [year, month] = value.split('-').map(Number);
    const start = getFirstDayOfMonth(year, month);
    const end = getLastDayOfMonth(year, month);
    
    setStartDate(start);
    setEndDate(end);
    fetchDashboardSummary(start, end);
    fetchPreviousMonthSummary(year, month);
  };

  // Handle custom date filter apply
  const handleApplyCustomFilter = () => {
    if (startDate && endDate) {
      fetchDashboardSummary(startDate, endDate);
      setPreviousMonthSummary(null); // Clear previous month comparison for custom range
    }
  };

  // Handle filter type change
  const handleFilterTypeChange = (type: 'month' | 'custom') => {
    setFilterType(type);
    if (type === 'month') {
      // Reset to selected month
      handleMonthChange(selectedMonth);
    } else {
      setPreviousMonthSummary(null); // Clear comparison for custom range
    }
  };

  // Calculate values
  const totalRevenue = summary?.totalRevenue ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const netProfit = totalRevenue - totalExpenses;
  const taxLiability = summary?.taxLiability ?? 0;

  // Calculate previous month's net profit and percentage change
  const previousNetProfit = previousMonthSummary 
    ? (previousMonthSummary.totalRevenue ?? 0) - (previousMonthSummary.totalExpenses ?? 0)
    : null;
  
  const profitPercentageChange = (() => {
    if (filterType !== 'month' || previousNetProfit === null) return null;
    if (previousNetProfit === 0) {
      // If previous was 0, show 100% if current is positive, -100% if negative, 0 if also 0
      if (netProfit > 0) return 100;
      if (netProfit < 0) return -100;
      return 0;
    }
    return ((netProfit - previousNetProfit) / Math.abs(previousNetProfit)) * 100;
  })();  

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar 
          isCollapsed={sidebarCollapsed} 
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <div className="flex-1">
          <DashboardHeader />
          
          <div className="p-6">
            {/* Date Filter Section */}
            <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700">Filter by:</span>
              </div>
              
              {/* Filter Type Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterTypeChange('month')}
                >
                  Month
                </Button>
                <Button
                  variant={filterType === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterTypeChange('custom')}
                >
                  Custom Range
                </Button>
              </div>

              {filterType === 'month' ? (
                /* Month Filter */
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-600">Month:</Label>
                  <Select value={selectedMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                /* Custom Date Range Filter */
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-gray-600">From:</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-[150px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-gray-600">To:</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-[150px]"
                    />
                  </div>
                  <Button size="sm" onClick={handleApplyCustomFilter}>
                    Apply
                  </Button>
                </div>
              )}

              {/* Show current filter range */}
              {summary?.dateRange && (
                <div className="ml-auto text-sm text-gray-500">
                  Showing: {new Date(summary.dateRange.startDate).toLocaleDateString()} - {new Date(summary.dateRange.endDate).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Total Revenue"
                value={loading ? 'Loading...' : `₹ ${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                icon={<BanknoteIcon size={24} />}
                subContent={
                  !loading && summary?.foreignRevenue && Object.keys(summary.foreignRevenue).length > 0 ? (
                    <div className="space-y-1 mt-1">
                      {Object.entries(summary.foreignRevenue).map(([currency, data]) => {
                        // Dynamic font size based on number of foreign currencies
                        const foreignCount = Object.keys(summary.foreignRevenue!).length;
                        const fontSize = foreignCount === 1 ? 'text-lg' : foreignCount === 2 ? 'text-base' : 'text-sm';
                        
                        return (
                          <div key={currency} className="flex items-baseline gap-1">
                            <span className={`${fontSize} font-semibold text-gray-700`}>
                              {currencySymbols[currency] || currency} {data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({data.count} invoice{data.count !== 1 ? 's' : ''})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : undefined
                }
              />
              <StatCard
                title="Total Expenses"
                value={loading ? 'Loading...' : `₹ ${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                icon={<ShoppingBagIcon size={24} />}
              />
              <StatCard
                title="Net Profit"
                value={loading ? 'Loading...' : `₹ ${netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                icon={<TrendingUpIcon size={24} />}
                trend={
                  filterType === 'month' && profitPercentageChange !== null
                    ? { value: Math.abs(Number(profitPercentageChange.toFixed(1))), isPositive: profitPercentageChange >= 0 }
                    : undefined
                }
              />
              <StatCard
                title="Tax Liability"
                value={loading ? 'Loading...' : `₹ ${taxLiability.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                icon={<ReceiptCentIcon size={24} />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <RevenueChart startDate={startDate} endDate={endDate} />
              <InvoiceStatusChart invoices={invoices} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentInvoices startDate={startDate} endDate={endDate} />
              <UpcomingPayments />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
