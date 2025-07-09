
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calculator, Users } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  baseSalary: number;
}

interface BulkSalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  month: string;
  year: number;
  onProcess: (processedSalaries: any[]) => void;
}

export const BulkSalaryDialog: React.FC<BulkSalaryDialogProps> = ({
  open,
  onOpenChange,
  employees,
  month,
  year,
  onProcess
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState(22);
  const [allowancePercent, setAllowancePercent] = useState(15);
  const [deductionPercent, setDeductionPercent] = useState(10);

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(employees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const calculateSalaries = () => {
    const processedSalaries = selectedEmployees.map(empId => {
      const employee = employees.find(emp => emp.id === empId)!;
      const allowances = Math.round((employee.baseSalary * allowancePercent) / 100);
      const deductions = Math.round((employee.baseSalary * deductionPercent) / 100);
      const netSalary = employee.baseSalary + allowances - deductions;

      return {
        id: `${empId}-${month}-${year}`,
        employeeId: empId,
        employeeName: employee.name,
        designation: employee.position,
        department: employee.department,
        baseSalary: employee.baseSalary,
        allowances,
        deductions,
        leavesDeduction: 0,
        netSalary,
        status: "pending" as const,
        paymentDate: "",
        leaves: 0,
        month,
        year: year.toString()
      };
    });

    onProcess(processedSalaries);
    toast.success(`Processed salaries for ${selectedEmployees.length} employees`);
    onOpenChange(false);
    setSelectedEmployees([]);
  };

  const totalAmount = selectedEmployees.reduce((sum, empId) => {
    const employee = employees.find(emp => emp.id === empId)!;
    const allowances = Math.round((employee.baseSalary * allowancePercent) / 100);
    const deductions = Math.round((employee.baseSalary * deductionPercent) / 100);
    return sum + (employee.baseSalary + allowances - deductions);
  }, 0);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Bulk Salary Processing - {months[parseInt(month)]} {year}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Salary Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Working Days</Label>
                  <Input
                    type="number"
                    value={workingDays}
                    onChange={(e) => setWorkingDays(parseInt(e.target.value) || 22)}
                    min="1"
                    max="31"
                  />
                </div>
                <div>
                  <Label>Allowance (%)</Label>
                  <Input
                    type="number"
                    value={allowancePercent}
                    onChange={(e) => setAllowancePercent(parseInt(e.target.value) || 15)}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Deduction (%)</Label>
                  <Input
                    type="number"
                    value={deductionPercent}
                    onChange={(e) => setDeductionPercent(parseInt(e.target.value) || 10)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employee Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Employees ({selectedEmployees.length}/{employees.length})
                </span>
                <Checkbox
                  checked={selectedEmployees.length === employees.length}
                  onCheckedChange={handleSelectAll}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => handleEmployeeToggle(employee.id, !!checked)}
                      />
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.position} - {employee.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{employee.baseSalary.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Base Salary</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {selectedEmployees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Processing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Selected Employees</p>
                    <p className="text-2xl font-bold">{selectedEmployees.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={calculateSalaries}
            disabled={selectedEmployees.length === 0}
          >
            Process {selectedEmployees.length} Salaries
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
