
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  department: string;
  designation: string;
  baseSalary: number;
}

interface SalaryPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers: TeamMember[];
  selectedMonth: string;
  selectedYear: number;
  onSave: (paymentData: any) => void;
}

export const SalaryPaymentDialog: React.FC<SalaryPaymentDialogProps> = ({
  open,
  onOpenChange,
  teamMembers,
  selectedMonth,
  selectedYear,
  onSave
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [paymentData, setPaymentData] = useState({
    baseSalary: "",
    allowances: "",
    deductions: "",
    leaves: "0",
    workingDays: "22"
  });

  const selectedEmployee = teamMembers.find(member => member.id === selectedEmployeeId);

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    const employee = teamMembers.find(member => member.id === employeeId);
    if (employee) {
      setPaymentData({
        baseSalary: employee.baseSalary.toString(),
        allowances: Math.round(employee.baseSalary * 0.15).toString(), // 15% default
        deductions: Math.round(employee.baseSalary * 0.1).toString(), // 10% default
        leaves: "0",
        workingDays: "22"
      });
    }
  };

  const calculateNetSalary = () => {
    const baseSalary = parseFloat(paymentData.baseSalary) || 0;
    const allowances = parseFloat(paymentData.allowances) || 0;
    const deductions = parseFloat(paymentData.deductions) || 0;
    const leaves = parseInt(paymentData.leaves) || 0;
    const workingDays = parseInt(paymentData.workingDays) || 22;
    
    const dailyRate = baseSalary / workingDays;
    const leaveDeduction = leaves * dailyRate;
    
    return baseSalary + allowances - deductions - leaveDeduction;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) return;

    const baseSalary = parseFloat(paymentData.baseSalary) || 0;
    const allowances = parseFloat(paymentData.allowances) || 0;
    const deductions = parseFloat(paymentData.deductions) || 0;
    const leaves = parseInt(paymentData.leaves) || 0;
    const workingDays = parseInt(paymentData.workingDays) || 22;
    
    const dailyRate = baseSalary / workingDays;
    const leaveDeduction = leaves * dailyRate;
    const netSalary = calculateNetSalary();

    onSave({
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      designation: selectedEmployee.designation,
      department: selectedEmployee.department,
      baseSalary,
      allowances,
      deductions,
      leavesDeduction: leaveDeduction,
      leaves,
      netSalary,
      month: selectedMonth,
      year: selectedYear
    });

    // Reset form
    setSelectedEmployeeId("");
    setPaymentData({
      baseSalary: "",
      allowances: "",
      deductions: "",
      leaves: "0",
      workingDays: "22"
    });
    onOpenChange(false);
  };

  const netSalary = calculateNetSalary();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Record Salary Payment
            </DialogTitle>
            <DialogDescription>
              Record salary payment for an employee for the selected month.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label>Select Employee *</Label>
              <Select value={selectedEmployeeId} onValueChange={handleEmployeeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex justify-between w-full">
                        <span>{member.name} - {member.designation}</span>
                        <span className="text-gray-500">₹{member.baseSalary.toLocaleString()}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEmployee && (
              <>
                {/* Employee Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-800">{selectedEmployee.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <div className="font-medium">{selectedEmployee.department}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Designation:</span>
                      <div className="font-medium">{selectedEmployee.designation}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseSalary">Base Salary (₹) *</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      min="0"
                      value={paymentData.baseSalary}
                      onChange={(e) => setPaymentData({ ...paymentData, baseSalary: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowances">Allowances (₹)</Label>
                    <Input
                      id="allowances"
                      type="number"
                      min="0"
                      value={paymentData.allowances}
                      onChange={(e) => setPaymentData({ ...paymentData, allowances: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deductions">Deductions (₹)</Label>
                    <Input
                      id="deductions"
                      type="number"
                      min="0"
                      value={paymentData.deductions}
                      onChange={(e) => setPaymentData({ ...paymentData, deductions: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaves">Leave Days</Label>
                    <Input
                      id="leaves"
                      type="number"
                      min="0"
                      value={paymentData.leaves}
                      onChange={(e) => setPaymentData({ ...paymentData, leaves: e.target.value })}
                    />
                  </div>
                </div>

                {/* Net Salary Preview */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-green-800">Net Salary:</span>
                      <span className="text-2xl font-bold text-green-900">₹{netSalary.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedEmployee}>
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
