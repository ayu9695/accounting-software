
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, CheckCircle } from "lucide-react";

interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  leavesDeduction: number;
  netSalary: number;
  status: "paid" | "pending";
  paymentDate: string;
  leaves: number;
  month: string;
  year: number;
}

interface SalaryPaymentTableProps {
  payments: SalaryPayment[];
  onUpdatePayment: (id: string, updates: Partial<SalaryPayment>) => void;
}

export const SalaryPaymentTable: React.FC<SalaryPaymentTableProps> = ({ 
  payments, 
  onUpdatePayment 
}) => {
  const markAsPaid = (payment: SalaryPayment) => {
    onUpdatePayment(payment.id, {
      status: "paid",
      paymentDate: new Date().toISOString().split('T')[0]
    });
  };

  const totalBaseSalary = payments.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalAllowances = payments.reduce((sum, p) => sum + p.allowances, 0);
  const totalDeductions = payments.reduce((sum, p) => sum + p.deductions, 0);
  const totalLeaveDeductions = payments.reduce((sum, p) => sum + p.leavesDeduction, 0);
  const totalNetSalary = payments.reduce((sum, p) => sum + p.netSalary, 0);
  const totalLeaves = payments.reduce((sum, p) => sum + p.leaves, 0);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-right">Base Salary</TableHead>
            <TableHead className="text-right">Allowances</TableHead>
            <TableHead className="text-right">Deductions</TableHead>
            <TableHead className="text-center">Leaves</TableHead>
            <TableHead className="text-right">Leave Deduction</TableHead>
            <TableHead className="text-right">Net Salary</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{payment.employeeName}</div>
                  <div className="text-sm text-gray-500">{payment.designation}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {payment.department}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">₹{payment.baseSalary.toLocaleString()}</TableCell>
              <TableCell className="text-right text-green-600">+₹{payment.allowances.toLocaleString()}</TableCell>
              <TableCell className="text-right text-red-600">-₹{payment.deductions.toLocaleString()}</TableCell>
              <TableCell className="text-center">{payment.leaves}</TableCell>
              <TableCell className="text-right text-red-500">-₹{payment.leavesDeduction.toLocaleString()}</TableCell>
              <TableCell className="text-right font-bold">₹{payment.netSalary.toLocaleString()}</TableCell>
              <TableCell>
                <Badge 
                  variant={payment.status === "paid" ? "default" : "secondary"}
                  className={payment.status === "paid" 
                    ? "bg-green-100 text-green-800 hover:bg-green-100" 
                    : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                  }
                >
                  {payment.status === "paid" ? "Paid" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-center space-x-2">
                  {payment.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsPaid(payment)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          
          {/* Summary Row */}
          <TableRow className="bg-muted/30 font-bold">
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell className="text-right">₹{totalBaseSalary.toLocaleString()}</TableCell>
            <TableCell className="text-right text-green-600">+₹{totalAllowances.toLocaleString()}</TableCell>
            <TableCell className="text-right text-red-600">-₹{totalDeductions.toLocaleString()}</TableCell>
            <TableCell className="text-center">{totalLeaves}</TableCell>
            <TableCell className="text-right text-red-500">-₹{totalLeaveDeductions.toLocaleString()}</TableCell>
            <TableCell className="text-right">₹{totalNetSalary.toLocaleString()}</TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
