
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Payment {
  id: string;
  name: string;
  amount: string;
  dueDate: string;
  daysLeft: number;
}

const payments: Payment[] = [
  {
    id: "PAY-001",
    name: "Office Rent",
    amount: "$2,400.00",
    dueDate: "April 30, 2025",
    daysLeft: 15,
  },
  {
    id: "PAY-002",
    name: "Internet Service",
    amount: "$99.00",
    dueDate: "April 22, 2025",
    daysLeft: 7,
  },
  {
    id: "PAY-003",
    name: "Software Subscription",
    amount: "$49.00",
    dueDate: "April 20, 2025",
    daysLeft: 5,
  },
  {
    id: "PAY-004",
    name: "Contractor Payment",
    amount: "$1,200.00",
    dueDate: "April 18, 2025",
    daysLeft: 3,
  },
];

const UpcomingPayments: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Due Date</TableHead>
              <TableHead className="text-right">Days Left</TableHead>
            </TableRow>
          </TableHeader>
          {/* <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.name}</TableCell>
                <TableCell className="text-right">{payment.amount}</TableCell>
                <TableCell className="text-right">{payment.dueDate}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      payment.daysLeft <= 3
                        ? "text-accounting-danger font-medium"
                        : payment.daysLeft <= 7
                        ? "text-accounting-warning font-medium"
                        : ""
                    }
                  >
                    {payment.daysLeft} days
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody> */}
          COMING SOON
        </Table>
      </CardContent>
    </Card>
  );
};

export default UpcomingPayments;
