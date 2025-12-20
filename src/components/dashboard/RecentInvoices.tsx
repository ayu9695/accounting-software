
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Invoice {
  _id: string;
  tenantId?: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  subtotal?: number;
  discount?: number;
  taxAmount?: number;
  total: number;
  status: 'paid' | 'unpaid' | 'partial' | 'overdue';
}

interface RecentInvoicesProps {
  startDate: string;
  endDate: string;
}

const getStatusColor = (status: Invoice["status"]) => {
  switch (status) {
    case "paid":
      return "bg-accounting-success text-white";
    case "unpaid":
      return "bg-accounting-danger text-white";
    case "partial":
      return "bg-accounting-warning text-white";
    case "overdue":
      return "bg-red-600 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const RecentInvoices: React.FC<RecentInvoicesProps> = ({ startDate, endDate }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!startDate || !endDate) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `${baseUrl}/invoices/filter/by-date?startDate=${startDate}&endDate=${endDate}`,
          { credentials: 'include' }
        );
        
        if (!response.ok) throw new Error('Failed to fetch invoices');
        
        const data = await response.json();
        setInvoices(data.invoices || []);
        setCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [startDate, endDate, baseUrl]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
          {!loading && count > 0 && (
            <span className="text-sm text-muted-foreground">({count} total)</span>
          )}
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/invoices">
            View all
            <ArrowRightIcon size={16} className="ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No invoices found for this period
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.slice(0, 5).map((invoice) => (
              <div
                key={invoice._id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="grid gap-1">
                  <div className="font-medium">{invoice.clientName}</div>
                  <div className="text-sm text-muted-foreground">
                    {invoice.invoiceNumber} • {formatDate(invoice.issueDate)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">₹ {invoice.total.toLocaleString('en-IN')}</div>
                  <Badge
                    className={cn(
                      "capitalize",
                      getStatusColor(invoice.status)
                    )}
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentInvoices;
