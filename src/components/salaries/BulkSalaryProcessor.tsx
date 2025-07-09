
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmployees } from "@/hooks/useEmployees";
import { SalaryBulkAddDialog } from "./SalaryBulkAddDialog";
import { StatusFilter } from "@/components/common/StatusFilter";
import { format } from "date-fns";
import { toast } from "sonner";
import { SearchInput } from "@/components/common/SearchInput";
import { ExportButton } from "@/components/common/ExportButton";
import { Users, CalendarIcon, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BulkSalaryProcessorProps {
  teamMembers: any[];
  monthOptions: { value: string; label: string }[];
  onSalariesProcessed: (salaries: any[]) => void;
}

export const BulkSalaryProcessor: React.FC<BulkSalaryProcessorProps> = ({ 
  teamMembers,
  monthOptions,
  onSalariesProcessed
}) => {
  const { processBulkSalaries } = useEmployees();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };
  
  const [month, year] = selectedMonth.split('-');
  
  const handleSalariesSaved = (salaries: any[]) => {
    // This would normally use processBulkSalaries from useEmployees
    // but here we'll just pass the data up to the parent component
    onSalariesProcessed(salaries);
    toast.success(`Processed salaries for ${salaries.length} employees`);
  };
  
  // Get unique departments from team members
  const departments = Array.from(new Set(teamMembers.map(member => member.department)));
  
  // Filter team members by department and search query
  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesDepartment = selectedDepartment === "all" || member.department === selectedDepartment;
    const matchesSearch = !searchQuery || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle>Salary Processing</CardTitle>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setIsAddTeamDialogOpen(true)}
                variant="outline"
                className="bg-accounting-blue text-white hover:bg-accounting-blue/90"
              >
                <Users className="mr-2 h-4 w-4" />
                Process Team Salaries
              </Button>
              
              <ExportButton 
                onExportCSV={() => toast.success("Exporting as CSV...")}
                onExportPDF={() => toast.success("Exporting as PDF...")}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-wrap justify-between">
            <div className="flex flex-wrap gap-2 items-start">
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="bg-white w-48">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <SelectValue placeholder="Select month" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="bg-white w-48">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Department" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <SearchInput 
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery("")}
              placeholder="Search employees..."
              className="w-full sm:w-auto"
            />
          </div>
          
          <div className="border rounded-lg p-4 bg-muted/10">
            <div className="space-y-2">
              <h3 className="font-medium">Month: {format(new Date(parseInt(year), parseInt(month) - 1), "MMMM yyyy")}</h3>
              <p>Team members available for processing: {filteredTeamMembers.length}</p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {departments.map(dept => (
                  <Button
                    key={dept}
                    variant="outline"
                    size="sm"
                    className={selectedDepartment === dept ? "bg-muted" : ""}
                    onClick={() => setSelectedDepartment(dept === selectedDepartment ? "all" : dept)}
                  >
                    {dept}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <SalaryBulkAddDialog
        open={isAddTeamDialogOpen}
        onOpenChange={setIsAddTeamDialogOpen}
        teamMembers={filteredTeamMembers}
        selectedMonth={month}
        selectedYear={parseInt(year)}
        onSave={handleSalariesSaved}
      />
    </div>
  );
};
