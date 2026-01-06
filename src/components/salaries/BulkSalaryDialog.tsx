
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calculator, Users, Loader2 } from "lucide-react";

interface SalaryRecord {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    salaryPaymentDate?: number;
  };
  employeeName: string;
  baseSalary: number;
  netSalary: number;
  allowances: number;
  deductions: number;
  leaveDays: number;
  defaultWorkingDays: number;
  status: string;
  month: string;
  year: number;
  paidOn?: string;
  paymentMethod?: string;
  paymentMethodName?: string;
}

interface PaymentMethod {
  id: string;
  code: string;
  name: string;
}

interface EmployeeEdits {
  allowances?: number;
  deductions?: number;
  netSalary?: number;
  actualWorkingDays?: number;
  paymentReference?: string;
  paymentMethod?: string;
  paidOn?: string;
}

interface BulkSalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salaryRecords: SalaryRecord[];
  month: string;
  year: number;
  onProcess: (processedSalaries: any[]) => void;
}

export const BulkSalaryDialog: React.FC<BulkSalaryDialogProps> = ({
  open,
  onOpenChange,
  salaryRecords,
  month,
  year,
  onProcess
}) => {
  const [selectedSalaries, setSelectedSalaries] = useState<string[]>([]);
  const [employeeEdits, setEmployeeEdits] = useState<Record<string, EmployeeEdits>>({});
  const [processing, setProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  const baseUrl = import.meta.env.VITE_API_URL;

  // Fetch payment methods from API
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`${baseUrl}/paymentMethods`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setPaymentMethods(data);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };
    fetchPaymentMethods();
  }, [baseUrl]);

  // Format paidOn date from BE (ISO string) to YYYY-MM-DD for input field
  const formatPaidOnDate = (isoDateString?: string) => {
    if (!isoDateString) {
      // Fallback: 1st of the selected month
      const monthIndex = parseInt(month);
      const firstOfMonth = new Date(year, monthIndex, 1);
      return firstOfMonth.toISOString().split('T')[0];
    }
    // Convert ISO string to YYYY-MM-DD
    return isoDateString.split('T')[0];
  };

  // Filter only pending/processed salaries (not already paid)
  const pendingSalaries = salaryRecords.filter(s => s.status !== 'paid');

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedSalaries([]);
      setEmployeeEdits({});
    }
  }, [open]);

  const handleSalaryToggle = (salaryId: string, checked: boolean) => {
    if (checked) {
      setSelectedSalaries([...selectedSalaries, salaryId]);
    } else {
      setSelectedSalaries(selectedSalaries.filter(id => id !== salaryId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSalaries(pendingSalaries.map(s => s._id));
    } else {
      setSelectedSalaries([]);
    }
  };

  const updateEmployeeEdit = (salaryId: string, field: keyof EmployeeEdits, value: number | string | undefined) => {
    setEmployeeEdits(prev => ({
      ...prev,
      [salaryId]: {
        ...prev[salaryId],
        [field]: value
      }
    }));
  };

  const getEditValue = (salaryId: string, field: keyof EmployeeEdits, defaultValue: number | string) => {
    return employeeEdits[salaryId]?.[field] ?? defaultValue;
  };

  const processSalaries = async () => {
    if (selectedSalaries.length === 0) return;

    setProcessing(true);

    // Build payload - only include edited fields, always include paymentMethod and paidOn
    const salariesPayload = selectedSalaries.map(salaryId => {
      const salary = pendingSalaries.find(s => s._id === salaryId);
      const edits = employeeEdits[salaryId] || {};
      
      // Get the payment method ID and name
      const paymentMethodId = edits.paymentMethod || salary?.paymentMethod || (paymentMethods.length > 0 ? paymentMethods[0].id : '');
      const selectedMethod = paymentMethods.find(m => m.id === paymentMethodId);
      const paymentMethodName = selectedMethod?.name || '';
      
      const payload: any = {
        salaryId,
        // Always send paymentMethod (ID) and paymentMethodName
        paymentMethod: paymentMethodId,
        paymentMethodName: paymentMethodName,
        paidOn: edits.paidOn || formatPaidOnDate(salary?.paidOn)
      };

      // Only include other fields if they were edited
      if (edits.deductions !== undefined) payload.deductions = edits.deductions;
      if (edits.allowances !== undefined) payload.allowances = edits.allowances;
      if (edits.netSalary !== undefined) payload.netSalary = edits.netSalary;
      if (edits.actualWorkingDays !== undefined) payload.actualWorkingDays = edits.actualWorkingDays;
      if (edits.paymentReference) payload.paymentReference = edits.paymentReference;

      return payload;
    });

    const requestBody = {
      salaries: salariesPayload
    };

    try {
      const response = await fetch(`${baseUrl}/salaries/bulk/mark-paid`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to process salaries');
      }

      const result = await response.json();
      
      onProcess(result);
      toast.success(`Processed salaries for ${selectedSalaries.length} employees`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing salaries:', error);
      toast.error('Failed to process salaries');
    } finally {
      setProcessing(false);
    }
  };

  // Calculate total net salary for selected employees
  const totalAmount = selectedSalaries.reduce((sum, salaryId) => {
    const salary = pendingSalaries.find(s => s._id === salaryId);
    if (!salary) return sum;
    const editedNetSalary = employeeEdits[salaryId]?.netSalary;
    return sum + (editedNetSalary ?? salary.netSalary ?? 0);
  }, 0);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Bulk Salary Processing - {months[parseInt(month)]} {year}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Employees ({selectedSalaries.length}/{pendingSalaries.length})
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Select All</span>
                  <Checkbox
                    checked={pendingSalaries.length > 0 && selectedSalaries.length === pendingSalaries.length}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingSalaries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending salaries to process</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {pendingSalaries.map((salary) => {
                    const isSelected = selectedSalaries.includes(salary._id);
                    
                    return (
                      <div 
                        key={salary._id} 
                        className={`p-4 border rounded-lg transition-colors ${
                          isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        {/* First Row: Checkbox, Name, Net Salary, Base Salary */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSalaryToggle(salary._id, !!checked)}
                            />
                            <div>
                              <p className="font-semibold text-lg">{salary.employeeName}</p>
                              <p className="text-sm text-gray-500">
                                {salary.employeeId?.email || ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Net Salary</p>
                              <p className="text-xl font-bold text-green-600">
                                ₹{(employeeEdits[salary._id]?.netSalary ?? salary.netSalary ?? 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Base Salary</p>
                              <p className="text-lg font-medium text-gray-700">
                                ₹{(salary.baseSalary ?? 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Second Row: Editable Fields (only show when selected) */}
                        {isSelected && (
                          <div className="pt-4 border-t border-gray-200 space-y-4">
                            {/* Row 1: Payment Method & Paid On Date */}
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <Label className="text-xs text-gray-600">Payment Method</Label>
                                <Select 
                                  value={(getEditValue(salary._id, 'paymentMethod', salary.paymentMethod || (paymentMethods.length > 0 ? paymentMethods[0].id : '')) as string)}
                                  onValueChange={(value) => updateEmployeeEdit(salary._id, 'paymentMethod', value)}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select method" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {paymentMethods.map((method) => (
                                      <SelectItem key={method.id} value={method.id}>
                                        {method.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Paid On Date</Label>
                                <Input
                                  type="date"
                                  value={(getEditValue(salary._id, 'paidOn', formatPaidOnDate(salary.paidOn)) as string)}
                                  onChange={(e) => updateEmployeeEdit(
                                    salary._id, 
                                    'paidOn', 
                                    e.target.value || undefined
                                  )}
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-400 mt-1">From BE: {formatPaidOnDate(salary.paidOn)}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Payment Ref</Label>
                                <Input
                                  type="text"
                                  placeholder="TXN_001"
                                  value={getEditValue(salary._id, 'paymentReference', '') as string}
                                  onChange={(e) => updateEmployeeEdit(
                                    salary._id, 
                                    'paymentReference', 
                                    e.target.value || undefined
                                  )}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Working Days</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="31"
                                  placeholder={String(salary.defaultWorkingDays || 22)}
                                  value={getEditValue(salary._id, 'actualWorkingDays', '') as string}
                                  onChange={(e) => updateEmployeeEdit(
                                    salary._id, 
                                    'actualWorkingDays', 
                                    e.target.value ? parseInt(e.target.value) : undefined
                                  )}
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-400 mt-1">Default: {salary.defaultWorkingDays || 22}</p>
                              </div>
                            </div>
                            {/* Row 2: Salary adjustments */}
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <Label className="text-xs text-gray-600">Reimbursement</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder={String(salary.allowances || 0)}
                                  value={getEditValue(salary._id, 'allowances', '') as string}
                                  onChange={(e) => updateEmployeeEdit(
                                    salary._id, 
                                    'allowances', 
                                    e.target.value ? parseInt(e.target.value) : undefined
                                  )}
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-400 mt-1">Current: ₹{salary.allowances || 0}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Deductions</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder={String(salary.deductions || 0)}
                                  value={getEditValue(salary._id, 'deductions', '') as string}
                                  onChange={(e) => updateEmployeeEdit(
                                    salary._id, 
                                    'deductions', 
                                    e.target.value ? parseInt(e.target.value) : undefined
                                  )}
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-400 mt-1">Current: ₹{salary.deductions || 0}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Net Salary</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder={String(salary.netSalary || 0)}
                                  value={getEditValue(salary._id, 'netSalary', '') as string}
                                  onChange={(e) => updateEmployeeEdit(
                                    salary._id, 
                                    'netSalary', 
                                    e.target.value ? parseInt(e.target.value) : undefined
                                  )}
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-400 mt-1">Current: ₹{salary.netSalary || 0}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {selectedSalaries.length > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Processing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700">Selected Employees</p>
                    <p className="text-2xl font-bold text-green-900">{selectedSalaries.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Total Amount</p>
                    <p className="text-2xl font-bold text-green-900">₹{totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={processSalaries}
            disabled={selectedSalaries.length === 0 || processing}
            className="bg-green-600 hover:bg-green-700"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Mark {selectedSalaries.length} as Paid</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
