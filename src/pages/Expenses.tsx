
import React, { useState, useMemo, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Receipt, Download } from "lucide-react";
import { ExpensePaymentDialog } from "@/components/expenses/ExpensePaymentDialog";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { SmartFilters } from "@/components/common/SmartFilters";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  approvalStatus: true | false;
  paymentStatus: true | false;
  paymentDate?: string;
  expenseDate: Date;
  paymentMethod?: string;
  paymentMethodName?: string;
  paymentReference?: string;
  notes?: string;
}

interface paymentMethods {
  id: string;
  code: string;
  name: string;
};

const Expenses: React.FC = () => {
  const { user } = useAuth() as { user: { role?: string } | null };
  const isSuperAdmin = user?.role === 'superadmin';
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(`${baseUrl}/expenses`, {
          credentials: 'include'
        });
        const data = await response.json();
        const newexpense: Expense[] = data.map((item:any) =>({
          id: item.id,
          description: item.description,
          amount: item.amount,
          category: item.category,
          expenseDate: item.expenseDate,
          paymentDate: item.paymentDate,
          paymentStatus: item.paymentStatus ?? false,
          approvalStatus: item.approvalStatus ?? false,
          paymentMethod: item.paymentMethod,
          paymentMethodName: item.paymentMethodName,
          paymentReference: item.paymentReference,
          notes: item.notes,
        }));
        setExpenses(newexpense);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  // Filter options - use paymentStatus (boolean) for filtering
  const statusOptions = [
    { value: "paid", label: "Paid", count: expenses.filter(e => e.paymentStatus === true).length },
    { value: "pending", label: "Pending", count: expenses.filter(e => e.paymentStatus === false).length }
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
        expense.category.toLowerCase().includes(query)
      );
    }

    // Status filter - use paymentStatus boolean
    if (selectedStatus && selectedStatus !== 'all') {
      if (selectedStatus === 'paid') {
        result = result.filter(expense => expense.paymentStatus === true);
      } else if (selectedStatus === 'pending') {
        result = result.filter(expense => expense.paymentStatus === false);
      }
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(expense => expense.category.toLowerCase() === selectedCategory);
    }

    // Date range filter - use expenseDate
    if (dateRange.from || dateRange.to) {
      result = result.filter(expense => {
        const expDate = new Date(expense.expenseDate);
        if (dateRange.from && expDate < dateRange.from) return false;
        if (dateRange.to && expDate > dateRange.to) return false;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortBy === 'date') {
        // Use expenseDate for date sorting
        aValue = new Date(a.expenseDate);
        bValue = new Date(b.expenseDate);
      } else if (sortBy === 'amount') {
        aValue = Number(a.amount);
        bValue = Number(b.amount);
      } else {
        aValue = String(a[sortBy as keyof Expense] || '').toLowerCase();
        bValue = String(b[sortBy as keyof Expense] || '').toLowerCase();
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

  const handlePaymentSubmit = async(paymentData: {
    paymentDate: string;
    paymentMethod: string;
    paymentMethodName: string;
    reference?: string;
    notes?: string;
  }) => {
    if (!selectedExpense) return;
      const payload = {
        paymentDate: paymentData.paymentDate,          // ISO string e.g. "2025-11-14"
        paymentMethod: paymentData.paymentMethod,      // ID for BE
        paymentReference: paymentData.reference,
        paymentNotes: paymentData.notes,
        paymentStatus: true
      };


    try{
      const response = await fetch(`${baseUrl}/expenses/${selectedExpense.id}`, {
          credentials: 'include',
          method: 'PUT',
          headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
        });

        const updatedExpensePayment = await response.json();
        if (!response.ok) {
          toast.error("Failed to record payment");
          return;
        }

    } catch (error){
        console.error("Error update payment:", error);
        toast.error("Failed to record payment");
        return;
    }

    setExpenses(prev => prev.map(expense => 
      expense.id === selectedExpense.id 
        ? { 
            ...expense, 
            paymentStatus: true,
            paymentDate: paymentData.paymentDate,
            paymentMethod: paymentData.paymentMethod,
            paymentMethodName: paymentData.paymentMethodName,
            paymentReference: paymentData.reference,
            notes: paymentData.notes
          }
        : expense
    ));
    

    toast.success(`Payment recorded for ${selectedExpense.description}`);
  };

  const handleAddExpense = async(expenseData: {
    description: string;
    amount: number;
    category: string;
    date: string;
  }) => {
    // const newExpense: Expense = {
    //   _id: Date.now().toString(),
    //   ...expenseData,
    //   status: 'pending'
    // };

    // setExpenses(prev => [newExpense, ...prev]);
    try{
      const response = await fetch(`${baseUrl}/expenses`, {
          credentials: 'include',
          method: 'POST',
          headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
        });

        const data = await response.json();
        if (!response.ok) {
          toast.error("Failed to add expense");
          return;
        }
      
      // Add the new expense to the existing array
      const newExpense: Expense = {
        id: data.id || data._id,
        description: data.description,
        amount: data.amount,
        category: data.category,
        expenseDate: data.expenseDate || data.date,
        paymentStatus: data.paymentStatus ?? false,
        approvalStatus: data.approvalStatus ?? false,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        paymentMethodName: data.paymentMethodName,
        paymentReference: data.paymentReference,
        notes: data.notes,
      };
      setExpenses(prev => [newExpense, ...prev]);
      toast.success("Expense added successfully");

    } catch (error){
        console.error("Error adding expense:", error);
        toast.error("Failed to add expense");
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Description', 'Category', 'Date', 'Amount', 'Status', 'Payment Date', 'Payment Method'].join(','),
      ...filteredExpenses.map(expense => [
        expense.description,
        expense.category,
        expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : '',
        expense.amount,
        expense.paymentStatus ? 'Paid' : 'Pending',
        expense.paymentDate ? new Date(expense.paymentDate).toLocaleDateString() : '',
        expense.paymentMethodName || expense.paymentMethod || ''
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
  const paidExpenses = filteredExpenses.filter(e => e.paymentStatus === true).reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = filteredExpenses.filter(e => e.paymentStatus === false).reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <PageLayout title="Expenses">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Expenses</h1>
            <p className="text-gray-600">Manage and track all your business expenses</p>
          </div>
          <div className="flex gap-3">
            {isSuperAdmin && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
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
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="text-right font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Approval Status</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Payment Details</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-medium">₹{expense.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={expense.approvalStatus === true ? 'default' : 'secondary'}
                        className={expense.approvalStatus === true ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                      >
                        {expense.approvalStatus === true ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={expense.paymentStatus === true ? 'default' : 'secondary'}
                        className={expense.paymentStatus === true ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                      >
                        {expense.paymentStatus === true ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {expense.paymentStatus === true ? (
                        <div className="text-sm">
                          <div>{expense.paymentMethodName || expense.paymentMethod}</div>
                          <div className="text-gray-500">
                            {expense.paymentDate ? new Date(expense.paymentDate).toLocaleDateString() : ''}
                          </div>
                          {expense.paymentReference && (
                            <div className="text-gray-500 text-xs">{expense.paymentReference}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.paymentStatus === false ? (
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
