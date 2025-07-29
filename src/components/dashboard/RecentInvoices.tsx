
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface Invoice {
  // id: string;
  // client: string;
  // amount: string;
  // date: string;
  // status: "paid" | "unpaid" | "partial";
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

interface RecentInvoicesProps {
  invoices: Invoice[];
}

// const invoices: Invoice[] = [
//   {
//     id: "INV-001",
//     client: "Acme Inc.",
//     amount: "$1,200.00",
//     date: "2025-04-01",
//     status: "paid",
//   },
//   {
//     id: "INV-002",
//     client: "Globex Corp",
//     amount: "$3,400.00",
//     date: "2025-04-05",
//     status: "unpaid",
//   },
//   {
//     id: "INV-003",
//     client: "Wayne Enterprises",
//     amount: "$2,800.00",
//     date: "2025-04-07",
//     status: "partial",
//   },
//   {
//     id: "INV-004",
//     client: "Stark Industries",
//     amount: "$5,600.00",
//     date: "2025-04-10",
//     status: "paid",
//   },
// ];

const getStatusColor = (status: Invoice["status"]) => {
  switch (status) {
    case "paid":
      return "bg-accounting-success text-white";
    case "unpaid":
      return "bg-accounting-danger text-white";
    case "partial":
      return "bg-accounting-warning text-white";
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

const RecentInvoices: React.FC<RecentInvoicesProps> = ({ invoices }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Invoices</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/invoices">
            View all
            <ArrowRightIcon size={16} className="ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.slice(0, 4).map((invoice) => (
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
                <div className="font-medium">{invoice.total}</div>
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
      </CardContent>
    </Card>
  );
};

export default RecentInvoices;
