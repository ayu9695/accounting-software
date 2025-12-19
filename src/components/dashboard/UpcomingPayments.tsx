
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Expense {
  id: string;
  _id?: string;
  category: string;
  amount: number;
  currency: string;
  paymentStatus: boolean;
  approvalStatus: boolean;
  expenseDate: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Currency symbols map
const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const UpcomingPayments: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUnpaidExpenses = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseUrl}/expenses/filter/unpaid`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch expenses');
        
        const data = await response.json();
        setExpenses(data.expenses || []);
        setCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching unpaid expenses:', error);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidExpenses();
  }, [baseUrl]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Upcoming Payments</CardTitle>
          {!loading && count > 0 && (
            <span className="text-sm text-muted-foreground">({count} pending)</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-lg font-medium text-gray-700">You're all caught up!</p>
            <p className="text-sm text-muted-foreground">No upcoming payments</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.slice(0, 5).map((expense) => (
                <TableRow key={expense.id || expense._id}>
                  <TableCell className="font-medium">{expense.category}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {expense.description}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {currencySymbols[expense.currency] || expense.currency} {expense.amount.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDate(expense.expenseDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingPayments;
