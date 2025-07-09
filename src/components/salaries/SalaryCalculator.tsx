
import React, { useState } from "react";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployees } from "@/hooks/useEmployees";
import { useSettings } from "@/pages/Settings";
import { format } from "date-fns";
import { getDaysInMonth, getWorkingDaysInMonth } from "@/utils/calculations";
import { Employee } from "@/types";

interface SalaryCalculatorProps {
  selectedMonth: string;
  selectedYear: number;
  employee?: Employee;
  onCalculated?: (result: {
    employeeId: string;
    netSalary: number;
    workingDays: number;
    leaveDays: number;
    allowances: number;
    deductions: number;
  }) => void;
}

export const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({
  selectedMonth,
  selectedYear,
  employee,
  onCalculated
}) => {
  const { allEmployees, calculateSalary } = useEmployees();
  const { companySettings } = useSettings();
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employee?.id || "");
  const [workingDays, setWorkingDays] = useState<number>(
    getWorkingDaysInMonth(parseInt(selectedMonth), selectedYear)
  );
  const [leaveDays, setLeaveDays] = useState<number>(0);
  const [additionalAllowance, setAdditionalAllowance] = useState<number>(0);
  const [additionalDeduction, setAdditionalDeduction] = useState<number>(0);
  const [calculatedSalary, setCalculatedSalary] = useState<number | null>(null);
  
  const totalDays = getDaysInMonth(parseInt(selectedMonth), selectedYear);
  const daysInMonth = getDaysInMonth(parseInt(selectedMonth), selectedYear);
  
  const handleCalculate = () => {
    if (!selectedEmployeeId) return;
    
    const selectedEmployee = allEmployees.find(emp => emp.id === selectedEmployeeId);
    if (!selectedEmployee) return;
    
    // Calculate basic salary
    const perDaySalary = selectedEmployee.baseSalary / daysInMonth;
    const salaryForWorkingDays = perDaySalary * (workingDays - leaveDays);
    
    // Calculate allowances and deductions from employee profile
    const totalAllowances = selectedEmployee.allowances.reduce((sum, allowance) => {
      return sum + (allowance.type === 'fixed' 
        ? allowance.amount 
        : (selectedEmployee.baseSalary * allowance.amount / 100));
    }, 0) + additionalAllowance;
    
    const totalDeductions = selectedEmployee.deductions.reduce((sum, deduction) => {
      return sum + (deduction.type === 'fixed' 
        ? deduction.amount 
        : (selectedEmployee.baseSalary * deduction.amount / 100));
    }, 0) + additionalDeduction;
    
    const netSalary = salaryForWorkingDays + totalAllowances - totalDeductions;
    setCalculatedSalary(netSalary);
    
    if (onCalculated) {
      onCalculated({
        employeeId: selectedEmployeeId,
        netSalary,
        workingDays,
        leaveDays,
        allowances: totalAllowances,
        deductions: totalDeductions
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Salary Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!employee && (
            <div className="space-y-2">
              <Label htmlFor="employee">Select Employee</Label>
              <Select 
                value={selectedEmployeeId} 
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workingDays">Working Days</Label>
              <Input 
                id="workingDays"
                type="number"
                min="0"
                max={daysInMonth}
                value={workingDays}
                onChange={(e) => setWorkingDays(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Max days in month: {daysInMonth}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="leaveDays">Leave Days</Label>
              <Input 
                id="leaveDays"
                type="number"
                min="0"
                max={workingDays}
                value={leaveDays}
                onChange={(e) => setLeaveDays(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Max: {workingDays} days
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalAllowance">Additional Allowance</Label>
              <Input 
                id="additionalAllowance"
                type="number"
                min="0"
                value={additionalAllowance}
                onChange={(e) => setAdditionalAllowance(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalDeduction">Additional Deduction</Label>
              <Input 
                id="additionalDeduction"
                type="number"
                min="0"
                value={additionalDeduction}
                onChange={(e) => setAdditionalDeduction(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleCalculate} 
            className="w-full bg-accounting-blue hover:bg-accounting-blue/90"
            disabled={!selectedEmployeeId && !employee}
          >
            Calculate Salary
          </Button>
          
          {calculatedSalary !== null && (
            <div className="mt-4 p-4 border rounded-md bg-muted/20">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">Month:</div>
                <div className="text-sm font-medium">
                  {format(new Date(selectedYear, parseInt(selectedMonth) - 1), "MMMM yyyy")}
                </div>
                
                <div className="text-sm">Working Days:</div>
                <div className="text-sm font-medium">{workingDays}</div>
                
                <div className="text-sm">Leave Days:</div>
                <div className="text-sm font-medium">{leaveDays}</div>
                
                <div className="text-sm">Net Salary:</div>
                <div className="text-sm font-medium text-green-600">
                  {companySettings.currency} {calculatedSalary.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
