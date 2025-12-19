
import React, { useState, useEffect, useMemo } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Receipt, Calculator, ArrowRight, CalendarDays } from "lucide-react";
import { SalaryPaymentTable } from "@/components/salaries/SalaryPaymentTable";
import { BulkSalaryDialog } from "@/components/salaries/BulkSalaryDialog";
import { useEmployees } from "@/hooks/useEmployees";
import { Link } from "react-router-dom";
import { Toast } from "@radix-ui/react-toast";
import { toast } from "sonner";

interface Department {
  _id: string;
  tenantId: string;
  name: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Salaries: React.FC = () => {
  const { allEmployees } = useEmployees();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [salaryPayments, setSalaryPayments] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSum, setTotalSum] = useState<number>(0);
  const [paidSum, setPaidSum] = useState<number>(0);

  const baseUrl = import.meta.env.VITE_API_URL;

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${baseUrl}/departments`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        
        const data = await response.json();
        setDepartments(data);
      } catch (err: any) {
        console.error('Failed to fetch departments:', err);
        toast.error('Failed to load departments');
      }
    };

    fetchDepartments();
  }, [baseUrl]);

  // Create department map for quick lookup
  const departmentMap = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach(dept => map.set(dept._id, dept.name));
    return map;
  }, [departments]);


  useEffect(() => {
    const fetchSalaries = async () => {
      setLoading(true);
      try {
        // Convert month from 0-based (0-11) to 1-based (1-12) and zero-pad
        const monthNumber = (parseInt(selectedMonth) + 1).toString().padStart(2, '0');
        const endpoint = `${baseUrl}/salaries/${monthNumber}${selectedYear}`;
        
        const response = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
  
        const data = await response.json();
        console.log('Fetched salaries raw response:', data);
        
        // Extract salaries array and sum values from response
        const salariesArray = data.salaries || [];
        console.log('Salaries array:', salariesArray);
        console.log('Department map at fetch time:', departmentMap);
        console.log('Department map size:', departmentMap.size);
        console.log('Raw department values:', salariesArray.map((p: any) => p.department));
        
        setTotalSum(data.sum || 0);
        setPaidSum(data.paidSum || 0);
        
        // Transform salary payments to include department names
        const transformedData = Array.isArray(salariesArray) ? salariesArray.map((payment: any) => ({
          ...payment,
          department: payment.department 
            ? (departmentMap.get(payment.department) || payment.department)
            : payment.department
        })) : [];
        
        console.log('Transformed data with departments:', transformedData.map((p: any) => ({ name: p.employeeName, department: p.department })));
        
        setSalaryPayments(transformedData);
      } catch (err: any) {
        console.error('Failed to fetch salaries:', err);
        toast.error(err.message || 'Failed to fetch salaries');
        setSalaryPayments([]);
        setTotalSum(0);
        setPaidSum(0);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSalaries();
  }, [selectedMonth, selectedYear, baseUrl, departmentMap]);

  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // Filter payments for selected month/year
  // const currentPayments = salaryPayments.filter(payment => 
  //   payment.month === selectedMonth && payment.year === selectedYear.toString()
  // );

  const handleUpdatePayment = (id: string, updates: any) => {
    setSalaryPayments(prev => prev.map(payment => 
      payment.id === id ? { ...payment, ...updates } : payment
    ));
  };

  const handleBulkProcess = async () => {
    // Refetch salaries after bulk processing
    setLoading(true);
    try {
      const monthNumber = (parseInt(selectedMonth) + 1).toString().padStart(2, '0');
      const endpoint = `${baseUrl}/salaries/${monthNumber}${selectedYear}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to refetch salaries');
      }

      const data = await response.json();
      
      // Extract salaries array and sum values from response
      const salariesArray = data.salaries || [];
      setTotalSum(data.sum || 0);
      setPaidSum(data.paidSum || 0);
      
      const transformedData = Array.isArray(salariesArray) ? salariesArray.map((payment: any) => ({
        ...payment,
        department: payment.department 
          ? (departmentMap.get(payment.department) || payment.department)
          : payment.department
      })) : [];
      
      setSalaryPayments(transformedData);
    } catch (err: any) {
      console.error('Failed to refetch salaries:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentMonthName = months.find(m => m.value === selectedMonth)?.label;

  return (
    <PageLayout title="Salary Management">
      <div className="space-y-6">
        {/* Header with Team Management Link */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Salary Management</h1>
            <p className="text-gray-600">Manage team salaries and payments</p>
          </div>
          <Link to="/team-members">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Users className="mr-2 h-4 w-4" />
              Manage Team Members
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Month/Year Selection */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Select Pay Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40 bg-white">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800">Year</label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-32 bg-white">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 text-right">
                <p className="text-sm text-blue-600">Viewing salaries for</p>
                <p className="text-lg font-semibold text-blue-900">{currentMonthName} {selectedYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{allEmployees.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Paid Salaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                ₹{paidSum.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Total Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                ₹{totalSum.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Salary Payments</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Processing</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Salary Payments - {currentMonthName} {selectedYear}</CardTitle>
                <p className="text-sm text-gray-600">
                  View and manage individual salary payments for the selected period
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calculator className="mx-auto h-12 w-12 mb-4 animate-pulse" />
                    <p>Loading salaries for {currentMonthName} {selectedYear}...</p>
                  </div>
                ) : salaryPayments.length > 0 ? (
                  <>
                    {console.log('SalaryPayments data sent to table:', salaryPayments)}
                    {console.log('Department map:', departmentMap)}
                    {console.log('Sample payment department field:', salaryPayments[0]?.department)}
                    <SalaryPaymentTable 
                      payments={salaryPayments}
                      onUpdatePayment={handleUpdatePayment}
                    />
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calculator className="mx-auto h-12 w-12 mb-4" />
                    <p>No salary payments found for {currentMonthName} {selectedYear}</p>
                    <p className="text-sm mt-2">Use bulk processing to generate salary payments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Salary Processing - {currentMonthName} {selectedYear}</CardTitle>
                <p className="text-sm text-gray-600">
                  Process salaries for multiple employees at once for the selected period
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calculator className="mx-auto h-12 w-12 mb-4 text-blue-600" />
                  <p className="text-lg font-medium mb-2">Process Salaries for {currentMonthName} {selectedYear}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate salary payments for your team members with customizable allowances and deductions
                  </p>
                  <Button 
                    onClick={() => setBulkDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={salaryPayments.filter(s => s.status !== 'paid').length === 0}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Start Bulk Processing
                  </Button>
                  {salaryPayments.filter(s => s.status !== 'paid').length === 0 && (
                    <p className="text-sm text-orange-600 mt-2">
                      No pending salaries to process for this month
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <BulkSalaryDialog
          open={bulkDialogOpen}
          onOpenChange={setBulkDialogOpen}
          salaryRecords={salaryPayments}
          month={selectedMonth}
          year={selectedYear}
          onProcess={handleBulkProcess}
        />
      </div>
    </PageLayout>
  );
};

export default Salaries;
