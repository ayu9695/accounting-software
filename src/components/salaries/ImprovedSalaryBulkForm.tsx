
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, Users, Calculator } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  department: string;
  designation: string;
  baseSalary: number;
}

interface SalaryPayment {
  employeeId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  leaves: number;
  workingDays: number;
  netSalary: number;
}

interface ImprovedSalaryBulkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers: TeamMember[];
  selectedMonth: string;
  onSave: (payments: SalaryPayment[]) => void;
}

export const ImprovedSalaryBulkForm: React.FC<ImprovedSalaryBulkFormProps> = ({
  open,
  onOpenChange,
  teamMembers,
  selectedMonth,
  onSave
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [globalSettings, setGlobalSettings] = useState({
    workingDays: 22,
    allowancePercent: 15,
    deductionPercent: 10,
    defaultLeaves: 0
  });
  const [individualSettings, setIndividualSettings] = useState<Record<string, SalaryPayment>>({});

  const handleEmployeeToggle = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
      const member = teamMembers.find(m => m.id === employeeId);
      if (member) {
        const allowances = Math.round((member.baseSalary * globalSettings.allowancePercent) / 100);
        const deductions = Math.round((member.baseSalary * globalSettings.deductionPercent) / 100);
        const dailyRate = member.baseSalary / globalSettings.workingDays;
        const leaveDeduction = globalSettings.defaultLeaves * dailyRate;
        const netSalary = member.baseSalary + allowances - deductions - leaveDeduction;

        setIndividualSettings({
          ...individualSettings,
          [employeeId]: {
            employeeId,
            baseSalary: member.baseSalary,
            allowances,
            deductions,
            leaves: globalSettings.defaultLeaves,
            workingDays: globalSettings.workingDays,
            netSalary
          }
        });
      }
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
      const newSettings = { ...individualSettings };
      delete newSettings[employeeId];
      setIndividualSettings(newSettings);
    }
  };

  const updateIndividualSetting = (employeeId: string, field: string, value: number) => {
    const current = individualSettings[employeeId];
    if (!current) return;

    const updated = { ...current, [field]: value };
    
    // Recalculate net salary
    const member = teamMembers.find(m => m.id === employeeId);
    if (member) {
      const dailyRate = updated.baseSalary / updated.workingDays;
      const leaveDeduction = updated.leaves * dailyRate;
      updated.netSalary = updated.baseSalary + updated.allowances - updated.deductions - leaveDeduction;
    }

    setIndividualSettings({
      ...individualSettings,
      [employeeId]: updated
    });
  };

  const applyGlobalSettings = () => {
    const updatedSettings = { ...individualSettings };
    
    selectedEmployees.forEach(employeeId => {
      const member = teamMembers.find(m => m.id === employeeId);
      if (member) {
        const allowances = Math.round((member.baseSalary * globalSettings.allowancePercent) / 100);
        const deductions = Math.round((member.baseSalary * globalSettings.deductionPercent) / 100);
        const dailyRate = member.baseSalary / globalSettings.workingDays;
        const leaveDeduction = globalSettings.defaultLeaves * dailyRate;
        const netSalary = member.baseSalary + allowances - deductions - leaveDeduction;

        updatedSettings[employeeId] = {
          employeeId,
          baseSalary: member.baseSalary,
          allowances,
          deductions,
          leaves: globalSettings.defaultLeaves,
          workingDays: globalSettings.workingDays,
          netSalary
        };
      }
    });

    setIndividualSettings(updatedSettings);
    toast.success("Global settings applied to all selected employees");
  };

  const handleSubmit = () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    const payments = selectedEmployees.map(employeeId => individualSettings[employeeId]);
    onSave(payments);
    onOpenChange(false);
    
    // Reset form
    setSelectedEmployees([]);
    setIndividualSettings({});
  };

  const departments = Array.from(new Set(teamMembers.map(m => m.department)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Salary Payment - {selectedMonth}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Global Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Working Days</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={globalSettings.workingDays}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      workingDays: parseInt(e.target.value) || 22
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Allowance (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={globalSettings.allowancePercent}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      allowancePercent: parseInt(e.target.value) || 15
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Deduction (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={globalSettings.deductionPercent}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      deductionPercent: parseInt(e.target.value) || 10
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Default Leaves</Label>
                  <Input
                    type="number"
                    min="0"
                    value={globalSettings.defaultLeaves}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      defaultLeaves: parseInt(e.target.value) || 0
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button 
                onClick={applyGlobalSettings}
                disabled={selectedEmployees.length === 0}
                className="mt-4"
                variant="outline"
              >
                Apply to Selected Employees ({selectedEmployees.length})
              </Button>
            </CardContent>
          </Card>

          {/* Employee Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Select Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map(department => (
                  <div key={department} className="space-y-3">
                    <h3 className="font-medium text-gray-700 border-b pb-1">{department}</h3>
                    <div className="space-y-3">
                      {teamMembers.filter(m => m.department === department).map(member => (
                        <div key={member.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center space-x-3 mb-3">
                            <Checkbox
                              checked={selectedEmployees.includes(member.id)}
                              onCheckedChange={(checked) => handleEmployeeToggle(member.id, !!checked)}
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-gray-600">{member.designation}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{member.baseSalary.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">Base Salary</p>
                            </div>
                          </div>

                          {selectedEmployees.includes(member.id) && individualSettings[member.id] && (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t">
                              <div>
                                <Label className="text-xs">Base Salary</Label>
                                <Input
                                  type="number"
                                  value={individualSettings[member.id].baseSalary}
                                  onChange={(e) => updateIndividualSetting(member.id, 'baseSalary', parseInt(e.target.value) || 0)}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Allowances</Label>
                                <Input
                                  type="number"
                                  value={individualSettings[member.id].allowances}
                                  onChange={(e) => updateIndividualSetting(member.id, 'allowances', parseInt(e.target.value) || 0)}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Deductions</Label>
                                <Input
                                  type="number"
                                  value={individualSettings[member.id].deductions}
                                  onChange={(e) => updateIndividualSetting(member.id, 'deductions', parseInt(e.target.value) || 0)}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Leaves</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={individualSettings[member.id].leaves}
                                  onChange={(e) => updateIndividualSetting(member.id, 'leaves', parseInt(e.target.value) || 0)}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Net Salary</Label>
                                <div className="text-sm font-medium bg-blue-50 p-2 rounded border">
                                  ₹{individualSettings[member.id].netSalary.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
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
                <CardTitle className="text-lg text-green-700">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">Employees</p>
                    <p className="text-xl font-bold">{selectedEmployees.length}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <p className="text-sm text-gray-600">Total Salary</p>
                    <p className="text-xl font-bold">
                      ₹{Object.values(individualSettings).reduce((sum, emp) => sum + emp.baseSalary, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded">
                    <p className="text-sm text-gray-600">Total Allowances</p>
                    <p className="text-xl font-bold">
                      ₹{Object.values(individualSettings).reduce((sum, emp) => sum + emp.allowances, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <p className="text-sm text-gray-600">Net Payable</p>
                    <p className="text-xl font-bold">
                      ₹{Object.values(individualSettings).reduce((sum, emp) => sum + emp.netSalary, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={selectedEmployees.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Process {selectedEmployees.length} Payment{selectedEmployees.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
