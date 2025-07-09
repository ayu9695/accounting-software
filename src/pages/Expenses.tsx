
import React, { useState, useMemo } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Receipt, Download } from "lucide-react";
import { ExpensePaymentDialog } from "@/components/expenses/ExpensePaymentDialog";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { SmartFilters } from "@/components/common/SmartFilters";
import { toast } from "sonner";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor: string;
  status: 'pending' | 'paid';
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
}

const initialExpenses: Expense[] = [
  {
    id: "1",
    description: "Office Rent - January 2024",
    amount: 50000,
    category: "Rent",
    date: "2024-01-01",
    vendor: "Property Management Co.",
    status: "paid",
    paymentDate: "2024-01-01",
    paymentMethod: "bank_transfer",
    paymentReference: "TXN123456"
  },
  {
    id: "2",
    description: "Software Licenses",
    amount: 25000,
    category: "Software",
    date: "2024-01-05",
    vendor: "Tech Solutions Ltd.",
    status: "pending"
  },
  {
    id: "3",
    description: "Office Supplies",
    amount: 8500,
    category: "Supplies",
    date: "2024-01-08",
    vendor: "Office Mart",
    status: "pending"
  },
  {
    id: "4",
    description: "Internet & Phone Bills",
    amount: 12000,
    category: "Utilities",
    date: "2024-01-10",
    vendor: "Telecom Provider",
    status: "paid",
    paymentDate: "2024-01-10",
    paymentMethod: "credit_card",
    paymentReference: "CC789012"
  },
  {
    id: "5",
    description: "Marketing Campaign",
    amount: 75000,
    category: "Marketing",
    date: "2024-01-15",
    vendor: "Digital Agency",
    status: "pending"
  }
];

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // Filter states
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter options
  const statusOptions = [
    { value: "paid", label: "Paid", count: expenses.filter(e => e.status === 'paid').length },
    { value: "pending", label: "Pending", count: expenses.filter(e => e.status === 'pending').length }
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...Array.from(new Set(expenses.map(e => e.category))).map(cat => ({
      value: cat.toLowerCase(),
      label: cat
    }))
  ];

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "amount", label: "Amount" },
    { value: "description", label: "Description" },
    { value: "vendor", label: "Vendor" },
    { value: "category", label: "Category" }
  ];

  // Apply filters and sorting
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search filter
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(expense =>
        expense.description.toLowerCase().includes(query) ||
        expense.vendor.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (selectedStatus && selectedStatus !== 'all') {
      result = result.filter(expense => expense.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(expense => expense.category.toLowerCase() === selectedCategory);
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      result = result.filter(expense => {
        const expenseDate = new Date(expense.date);
        if (dateRange.from && expenseDate < dateRange.from) return false;
        if (dateRange.to && expenseDate > dateRange.to) return false;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Expense];
      let bValue: any = b[sortBy as keyof Expense];

      if (sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'amount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [expenses, searchValue, selectedStatus, selectedCategory, dateRange, sortBy, sortOrder]);

  const getActiveFilters = () => {
    const filters: string[] = [];
    if (searchValue) filters.push(`Search: "${searchValue}"`);
    if (selectedStatus && selectedStatus !== 'all') filters.push(`Status: ${selectedStatus}`);
    if (selectedCategory && selectedCategory !== 'all') filters.push(`Category: ${selectedCategory}`);
    if (dateRange.from || dateRange.to) filters.push('Date filtered');
    return filters;
  };

  const clearAllFilters = () => {
    setSearchValue("");
    setSelectedStatus("all");
    setSelectedCategory("all");
    setDateRange({});
  };

  const handleRecordPayment = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      setSelectedExpense(expense);
      setPaymentDialogOpen(true);
    }
  };

  const handlePaymentSubmit = (paymentData: {
    paymentDate: string;
    paymentMethod: string;
    reference?: string;
    notes?: string;
  }) => {
    if (!selectedExpense) return;

    setExpenses(prev => prev.map(expense => 
      expense.id === selectedExpense.id 
        ? { 
            ...expense, 
            status: 'paid' as const,
            paymentDate: paymentData.paymentDate,
            paymentMethod: paymentData.paymentMethod,
            paymentReference: paymentData.reference,
            notes: paymentData.notes
          }
        : expense
    ));

    toast.success(`Payment recorded for ${selectedExpense.description}`);
  };

  const handleAddExpense = (expenseData: {
    description: string;
    amount: number;
    category: string;
    date: string;
    vendor: string;
  }) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      ...expenseData,
      status: 'pending'
    };

    setExpenses(prev => [newExpense, ...prev]);
    toast.success("Expense added successfully");
  };

  const handleExport = () => {
    const csvContent = [
      ['Description', 'Vendor', 'Category', 'Date', 'Amount', 'Status', 'Payment Date', 'Payment Method'].join(','),
      ...filteredExpenses.map(expense => [
        expense.description,
        expense.vendor,
        expense.category,
        expense.date,
        expense.amount,
        expense.status,
        expense.paymentDate || '',
        expense.paymentMethod || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Expenses exported successfully");
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const paidExpenses = filteredExpenses.filter(e => e.status === 'paid').reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = filteredExpenses.filter(e => e.status === 'pending').reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <PageLayout title="Expenses">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Expenses</h1>
            <p className="text-gray-600">Manage and track all your business expenses</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setAddExpenseDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{paidExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">₹{pendingExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Search Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <SmartFilters
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              searchPlaceholder="Search expenses..."
              statusOptions={statusOptions}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              statusLabel="Status"
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              showDateFilter={true}
              sortOptions={sortOptions}
              selectedSort={sortBy}
              onSortChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              activeFilters={getActiveFilters()}
              onClearAll={clearAllFilters}
              totalResults={expenses.length}
              filteredResults={filteredExpenses.length}
            />
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Expenses ({filteredExpenses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Vendor</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="text-right font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Payment Details</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.vendor}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-medium">₹{expense.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={expense.status === 'paid' ? 'default' : 'secondary'}
                        className={expense.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                      >
                        {expense.status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {expense.status === 'paid' ? (
                        <div className="text-sm">
                          <div>{expense.paymentMethod?.replace('_', ' ').toUpperCase()}</div>
                          <div className="text-gray-500">{expense.paymentDate}</div>
                          {expense.paymentReference && (
                            <div className="text-gray-500 text-xs">{expense.paymentReference}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.status === 'pending' ? (
                        <Button
                          size="sm"
                          onClick={() => handleRecordPayment(expense.id)}
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          Record Payment
                        </Button>
                      ) : (
                        <span className="text-green-600 text-sm font-medium">✓ Paid</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        {selectedExpense && (
          <ExpensePaymentDialog
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            onPayment={handlePaymentSubmit}
            expenseId={selectedExpense.id}
            expenseAmount={selectedExpense.amount}
            expenseDescription={selectedExpense.description}
          />
        )}

        {/* Add Expense Dialog */}
        <AddExpenseDialog
          open={addExpenseDialogOpen}
          onOpenChange={setAddExpenseDialogOpen}
          onAddExpense={handleAddExpense}
        />
      </div>
    </PageLayout>
  );
};

export default Expenses;
