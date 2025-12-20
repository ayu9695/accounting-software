
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calculator, Loader2, User } from "lucide-react";

interface SalaryPayment {
  id?: string;
  _id?: string;
  employeeId?: string;
  employeeName?: string;
  designation?: string;
  department?: string;
  baseSalary?: number;
  allowances?: number;
  deductions?: number;
  leavesDeduction?: number;
  leaveDeduction?: number;
  netSalary?: number;
  status?: "paid" | "pending" | "processed";
  paymentDate?: string;
  leaves?: number;
  leaveDays?: number;
  month?: string;
  year?: number;
  defaultWorkingDays?: number;
  paymentMethod?: string;
  paidOn?: string;
}

interface PaymentEdits {
  allowances?: number;
  deductions?: number;
  netSalary?: number;
  actualWorkingDays?: number;
  paymentReference?: string;
  paymentMethod?: string;
  paidOn?: string;
}

interface SingleSalaryPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: SalaryPayment | null;
  onProcess: (paymentId: string, updates: Partial<SalaryPayment>) => void;
}

export const SingleSalaryPaymentDialog: React.FC<SingleSalaryPaymentDialogProps> = ({
  open,
  onOpenChange,
  payment,
  onProcess
}) => {
  const [edits, setEdits] = useState<PaymentEdits>({});
  const [processing, setProcessing] = useState(false);
  
  const baseUrl = import.meta.env.VITE_API_URL;

  // Format paidOn date from BE (ISO string) to YYYY-MM-DD for input field
  const formatPaidOnDate = (isoDateString?: string) => {
    if (!isoDateString) {
      // Fallback: today's date
      return new Date().toISOString().split('T')[0];
    }
    return isoDateString.split('T')[0];
  };

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setEdits({});
    } else if (payment) {
      // Set default values when opening
      setEdits({
        paymentMethod: payment.paymentMethod || 'bank_transfer',
        paidOn: formatPaidOnDate(payment.paidOn || payment.paymentDate)
      });
    }
  }, [open, payment]);

  const updateEdit = (field: keyof PaymentEdits, value: number | string | undefined) => {
    setEdits(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getEditValue = (field: keyof PaymentEdits, defaultValue: number | string) => {
    return edits[field] ?? defaultValue;
  };

  const processSalary = async () => {
    if (!payment) return;

    const paymentId = payment.id || payment._id;
    if (!paymentId) return;

    setProcessing(true);

    // Build payload
    const payload: any = {
      salaryId: paymentId,
      paymentMethod: edits.paymentMethod || payment.paymentMethod || 'bank_transfer',
      paidOn: edits.paidOn || formatPaidOnDate(payment.paidOn || payment.paymentDate)
    };

    // Only include other fields if they were edited
    if (edits.deductions !== undefined) payload.deductions = edits.deductions;
    if (edits.allowances !== undefined) payload.allowances = edits.allowances;
    if (edits.netSalary !== undefined) payload.netSalary = edits.netSalary;
    if (edits.actualWorkingDays !== undefined) payload.actualWorkingDays = edits.actualWorkingDays;
    if (edits.paymentReference) payload.paymentReference = edits.paymentReference;

    try {
      const response = await fetch(`${baseUrl}/salaries/bulk/mark-paid`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ salaries: [payload] })
      });

      if (!response.ok) {
        throw new Error('Failed to process salary');
      }

      const result = await response.json();
      
      // Call the onProcess callback to update local state
      onProcess(paymentId, {
        status: "paid",
        paymentDate: edits.paidOn || formatPaidOnDate(payment.paidOn || payment.paymentDate),
        allowances: edits.allowances ?? payment.allowances,
        deductions: edits.deductions ?? payment.deductions,
        netSalary: edits.netSalary ?? payment.netSalary
      });
      
      toast.success(`Salary marked as paid for ${payment.employeeName}`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing salary:', error);
      toast.error('Failed to process salary');
    } finally {
      setProcessing(false);
    }
  };

  if (!payment) return null;

  const netSalaryValue = edits.netSalary ?? payment.netSalary ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Mark Salary as Paid
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Employee Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">{payment.employeeName}</p>
                  <p className="text-sm text-gray-500">{payment.designation}</p>
                  <p className="text-sm text-gray-500">{payment.department}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Net Salary</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{netSalaryValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Base Salary</p>
                    <p className="text-lg font-medium text-gray-700">
                      ₹{(payment.baseSalary ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Row 1: Payment Method & Paid On Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600">Payment Method</Label>
                  <Select 
                    value={(getEditValue('paymentMethod', payment.paymentMethod || 'bank_transfer') as string)}
                    onValueChange={(value) => updateEdit('paymentMethod', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Paid On Date</Label>
                  <Input
                    type="date"
                    value={(getEditValue('paidOn', formatPaidOnDate(payment.paidOn || payment.paymentDate)) as string)}
                    onChange={(e) => updateEdit('paidOn', e.target.value || undefined)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Row 2: Payment Reference & Working Days */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600">Payment Reference</Label>
                  <Input
                    type="text"
                    placeholder="TXN_001"
                    value={getEditValue('paymentReference', '') as string}
                    onChange={(e) => updateEdit('paymentReference', e.target.value || undefined)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Working Days</Label>
                  <Input
                    type="number"
                    min="0"
                    max="31"
                    placeholder={String(payment.defaultWorkingDays || 22)}
                    value={getEditValue('actualWorkingDays', '') as string}
                    onChange={(e) => updateEdit('actualWorkingDays', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">Default: {payment.defaultWorkingDays || 22}</p>
                </div>
              </div>

              {/* Row 3: Salary Adjustments */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-600">Reimbursement</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder={String(payment.allowances || 0)}
                    value={getEditValue('allowances', '') as string}
                    onChange={(e) => updateEdit('allowances', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">Current: ₹{payment.allowances || 0}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Deductions</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder={String(payment.deductions || 0)}
                    value={getEditValue('deductions', '') as string}
                    onChange={(e) => updateEdit('deductions', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">Current: ₹{payment.deductions || 0}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Net Salary</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder={String(payment.netSalary || 0)}
                    value={getEditValue('netSalary', '') as string}
                    onChange={(e) => updateEdit('netSalary', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">Current: ₹{payment.netSalary || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Amount to be Paid</p>
                  <p className="text-2xl font-bold text-green-900">₹{netSalaryValue.toLocaleString()}</p>
                </div>
                <div className="text-right text-sm text-green-700">
                  <p>Payment Method: {(getEditValue('paymentMethod', 'bank_transfer') as string).replace('_', ' ').toUpperCase()}</p>
                  <p>Date: {getEditValue('paidOn', formatPaidOnDate(payment.paidOn || payment.paymentDate)) as string}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={processSalary}
            disabled={processing}
            className="bg-green-600 hover:bg-green-700"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Mark as Paid</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

