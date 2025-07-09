
import React, { useState, useEffect } from "react";
import { PopupForm } from "@/components/ui/popup-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencySelect } from "@/components/ui/currency-select";
import { useSettings } from "@/pages/Settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDaysInMonth, getWorkingDaysInMonth } from "@/utils/calculations";

interface TeamMember {
  id: string;
  name: string;
  department: string;
  designation: string;
  baseSalary: number;
}

interface SalaryBulkAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers: TeamMember[];
  selectedMonth?: string; // Month in format MM
  selectedYear?: number;
  onSave: (salaries: any[]) => void;
}

export const SalaryBulkAddDialog: React.FC<SalaryBulkAddDialogProps> = ({
  open,
  onOpenChange,
  teamMembers,
  selectedMonth,
  selectedYear = new Date().getFullYear(),
  onSave,
}) => {
  const { companySettings } = useSettings();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [salaryData, setSalaryData] = useState<Record<string, any>>({});
  const [currency, setCurrency] = useState(companySettings.currency);
  const [activeTab, setActiveTab] = useState("individual");
  const [globalSettings, setGlobalSettings] = useState({
    workingDays: selectedMonth ? getWorkingDaysInMonth(parseInt(selectedMonth), selectedYear) : 22,
    leaveAllowed: 0,
    additionalAllowancePercent: 0,
    additionalDeductionPercent: 0
  });
  
  // Initialize default working days when month changes
  useEffect(() => {
    if (selectedMonth) {
      const workingDays = getWorkingDaysInMonth(parseInt(selectedMonth), selectedYear);
      setGlobalSettings(prev => ({ ...prev, workingDays }));
      
      // Update all selected members with the new working days
      if (selectedMembers.length > 0) {
        const updatedData = { ...salaryData };
        selectedMembers.forEach(memberId => {
          if (updatedData[memberId]) {
            updatedData[memberId] = {
              ...updatedData[memberId],
              workingDays
            };
          }
        });
        setSalaryData(updatedData);
      }
    }
  }, [selectedMonth, selectedYear]);

  const handleMemberToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, memberId]);
      const member = teamMembers.find(m => m.id === memberId);
      if (member) {
        setSalaryData({
          ...salaryData,
          [memberId]: {
            baseSalary: member.baseSalary,
            allowances: Math.round(member.baseSalary * 0.15),
            deductions: Math.round(member.baseSalary * 0.1),
            leaves: globalSettings.leaveAllowed,
            workingDays: globalSettings.workingDays,
            currency: currency
          }
        });
      }
    } else {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
      const newData = { ...salaryData };
      delete newData[memberId];
      setSalaryData(newData);
    }
  };

  const updateSalaryField = (memberId: string, field: string, value: any) => {
    setSalaryData({
      ...salaryData,
      [memberId]: {
        ...salaryData[memberId],
        [field]: value
      }
    });
  };
  
  const applyGlobalChanges = () => {
    const updatedData = { ...salaryData };
    
    selectedMembers.forEach(memberId => {
      const member = teamMembers.find(m => m.id === memberId);
      if (member && updatedData[memberId]) {
        const additionalAllowance = Math.round(member.baseSalary * globalSettings.additionalAllowancePercent / 100);
        const additionalDeduction = Math.round(member.baseSalary * globalSettings.additionalDeductionPercent / 100);
        
        updatedData[memberId] = {
          ...updatedData[memberId],
          workingDays: globalSettings.workingDays,
          leaves: globalSettings.leaveAllowed,
          allowances: Math.round(member.baseSalary * 0.15) + additionalAllowance,
          deductions: Math.round(member.baseSalary * 0.1) + additionalDeduction
        };
      }
    });
    
    setSalaryData(updatedData);
    toast.success("Global settings applied to all selected employees");
  };
  
  const filterMembersByDepartment = (department: string) => {
    return teamMembers.filter(member => member.department === department);
  };
  
  const departments = Array.from(new Set(teamMembers.map(member => member.department)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one team member");
      return;
    }

    const salaries = selectedMembers.map(memberId => {
      const member = teamMembers.find(m => m.id === memberId);
      const data = salaryData[memberId];
      const dailyRate = data.baseSalary / data.workingDays;
      const leaveDeduction = data.leaves * dailyRate;
      const netSalary = data.baseSalary + data.allowances - data.deductions - leaveDeduction;

      return {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: memberId,
        employeeName: member?.name,
        designation: member?.designation,
        department: member?.department,
        baseSalary: data.baseSalary,
        allowances: data.allowances,
        deductions: data.deductions,
        leaves: data.leaves,
        workingDays: data.workingDays,
        leavesDeduction: leaveDeduction,
        netSalary,
        currency: data.currency,
        status: "pending",
        paymentDate: "",
        month: selectedMonth || new Date().getMonth() + 1,
        year: selectedYear || new Date().getFullYear()
      };
    });

    onSave(salaries);
    onOpenChange(false);
    toast.success(`Added ${selectedMembers.length} employee salaries`);
  };
  
  return (
    <PopupForm
      title="Bulk Add Team Salaries"
      description="Select team members and configure their salary details"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      className="max-w-4xl"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Default Currency</Label>
          <CurrencySelect
            value={currency}
            onValueChange={setCurrency}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual Settings</TabsTrigger>
            <TabsTrigger value="global">Global Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="global" className="space-y-4">
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-medium text-base">Apply settings to all selected employees</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="globalWorkingDays">Working Days</Label>
                  <Input
                    id="globalWorkingDays"
                    type="number"
                    min="1"
                    max="31"
                    value={globalSettings.workingDays}
                    onChange={(e) => setGlobalSettings({...globalSettings, workingDays: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="globalLeaveAllowed">Leave Days</Label>
                  <Input
                    id="globalLeaveAllowed"
                    type="number"
                    min="0"
                    max={globalSettings.workingDays}
                    value={globalSettings.leaveAllowed}
                    onChange={(e) => setGlobalSettings({...globalSettings, leaveAllowed: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="globalAllowance">Additional Allowance (%)</Label>
                  <Input
                    id="globalAllowance"
                    type="number"
                    min="0"
                    max="100"
                    value={globalSettings.additionalAllowancePercent}
                    onChange={(e) => setGlobalSettings({...globalSettings, additionalAllowancePercent: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="globalDeduction">Additional Deduction (%)</Label>
                  <Input
                    id="globalDeduction"
                    type="number"
                    min="0"
                    max="100"
                    value={globalSettings.additionalDeductionPercent}
                    onChange={(e) => setGlobalSettings({...globalSettings, additionalDeductionPercent: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <Button 
                type="button" 
                onClick={applyGlobalChanges}
                disabled={selectedMembers.length === 0}
                className="w-full"
              >
                Apply To All Selected Employees
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="individual">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Select Team Members</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedMembers.length === teamMembers.length) {
                      setSelectedMembers([]);
                      setSalaryData({});
                    } else {
                      setSelectedMembers(teamMembers.map(m => m.id));
                      const newData: Record<string, any> = {};
                      teamMembers.forEach(member => {
                        newData[member.id] = {
                          baseSalary: member.baseSalary,
                          allowances: Math.round(member.baseSalary * 0.15),
                          deductions: Math.round(member.baseSalary * 0.1),
                          leaves: globalSettings.leaveAllowed,
                          workingDays: globalSettings.workingDays,
                          currency: currency
                        };
                      });
                      setSalaryData(newData);
                    }
                  }}
                >
                  {selectedMembers.length === teamMembers.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Filter by Department</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-4 border rounded-lg p-4">
                  {departments.map(department => (
                    <div key={department} className="mb-4">
                      <h3 className="font-medium text-base mb-2">{department}</h3>
                      <div className="space-y-3">
                        {filterMembersByDepartment(department).map((member) => (
                          <div key={member.id} className="space-y-3 p-4 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`member-${member.id}`}
                                checked={selectedMembers.includes(member.id)}
                                onCheckedChange={(checked) => handleMemberToggle(member.id, !!checked)}
                              />
                              <Label htmlFor={`member-${member.id}`} className="font-medium">
                                {member.name} - {member.designation}
                              </Label>
                            </div>

                            {selectedMembers.includes(member.id) && (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ml-6">
                                <div>
                                  <Label className="text-sm">Base Salary</Label>
                                  <Input
                                    type="number"
                                    value={salaryData[member.id]?.baseSalary || 0}
                                    onChange={(e) => updateSalaryField(member.id, 'baseSalary', parseInt(e.target.value) || 0)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Allowances</Label>
                                  <Input
                                    type="number"
                                    value={salaryData[member.id]?.allowances || 0}
                                    onChange={(e) => updateSalaryField(member.id, 'allowances', parseInt(e.target.value) || 0)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Deductions</Label>
                                  <Input
                                    type="number"
                                    value={salaryData[member.id]?.deductions || 0}
                                    onChange={(e) => updateSalaryField(member.id, 'deductions', parseInt(e.target.value) || 0)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Leave Days</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={salaryData[member.id]?.workingDays || globalSettings.workingDays}
                                    value={salaryData[member.id]?.leaves || 0}
                                    onChange={(e) => updateSalaryField(member.id, 'leaves', parseInt(e.target.value) || 0)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Working Days</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={salaryData[member.id]?.workingDays || globalSettings.workingDays}
                                    onChange={(e) => updateSalaryField(member.id, 'workingDays', parseInt(e.target.value) || 0)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="bg-muted/20 p-3 rounded border">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Selected: {selectedMembers.length} employees</p>
            <p className="text-sm text-muted-foreground">
              {selectedMembers.length > 0 && `${selectedMembers.length} of ${teamMembers.length} selected`}
            </p>
          </div>
        </div>
      </div>
    </PopupForm>
  );
};
