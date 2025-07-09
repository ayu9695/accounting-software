
import { useState, useEffect } from 'react';
import { Employee, SalaryRecord, SearchFilters, PaginationData } from '@/types';
import { mockEmployees, mockSalaryRecords } from '@/data/mockData';
import { getDaysInMonth, getWorkingDaysInMonth } from '@/utils/calculations';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(mockSalaryRecords);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  const filteredEmployees = employees.filter(employee => {
    if (filters.query) {
      const query = filters.query.toLowerCase();
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query) ||
        employee.position.toLowerCase().includes(query)
      );
    }
    return true;
  });

  useEffect(() => {
    const total = filteredEmployees.length;
    const totalPages = Math.ceil(total / pagination.pageSize);
    setPagination(prev => ({ ...prev, total, totalPages }));
  }, [filteredEmployees, pagination.pageSize]);

  const paginatedEmployees = filteredEmployees.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString()
    };
    setEmployees(prev => [...prev, newEmployee]);
    return newEmployee;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, ...updates } : emp
    ));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const calculateSalary = (employeeId: string, workingDays: number, leaveDays: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return 0;

    const totalDays = workingDays + leaveDays;
    const perDaySalary = employee.baseSalary / totalDays;
    const salaryForWorkingDays = perDaySalary * workingDays;
    
    const totalAllowances = employee.allowances.reduce((sum, allowance) => {
      return sum + (allowance.type === 'fixed' ? allowance.amount : (employee.baseSalary * allowance.amount / 100));
    }, 0);
    
    const totalDeductions = employee.deductions.reduce((sum, deduction) => {
      return sum + (deduction.type === 'fixed' ? deduction.amount : (employee.baseSalary * deduction.amount / 100));
    }, 0);

    return salaryForWorkingDays + totalAllowances - totalDeductions;
  };

  const processSalary = (employeeId: string, month: string, year: number, workingDays: number, leaveDays: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const netSalary = calculateSalary(employeeId, workingDays, leaveDays);
    const totalAllowances = employee.allowances.reduce((sum, allowance) => {
      return sum + (allowance.type === 'fixed' ? allowance.amount : (employee.baseSalary * allowance.amount / 100));
    }, 0);
    const totalDeductions = employee.deductions.reduce((sum, deduction) => {
      return sum + (deduction.type === 'fixed' ? deduction.amount : (employee.baseSalary * deduction.amount / 100));
    }, 0);

    const salaryRecord: SalaryRecord = {
      id: Date.now().toString(),
      employeeId,
      month,
      year,
      baseSalary: employee.baseSalary,
      allowances: totalAllowances,
      deductions: totalDeductions,
      leaveDays,
      workingDays,
      netSalary,
      status: 'processed'
    };

    setSalaryRecords(prev => [...prev, salaryRecord]);
    return salaryRecord;
  };

  // New function to process salaries for multiple employees at once
  const processBulkSalaries = (
    employeeIds: string[], 
    month: string, 
    year: number, 
    salaryData: Record<string, { workingDays: number; leaveDays: number; additionalAllowances?: number; additionalDeductions?: number; }>
  ) => {
    const newSalaryRecords: SalaryRecord[] = [];

    employeeIds.forEach(employeeId => {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return;

      const { workingDays, leaveDays, additionalAllowances = 0, additionalDeductions = 0 } = salaryData[employeeId] || {};
      
      // Use the working days provided or calculate from month/year
      const finalWorkingDays = workingDays || getWorkingDaysInMonth(parseInt(month), year);
      // Calculate total days in month
      const totalDays = getDaysInMonth(parseInt(month), year);
      
      const perDaySalary = employee.baseSalary / totalDays;
      const salaryForWorkingDays = perDaySalary * (finalWorkingDays - leaveDays);
      
      const totalAllowances = employee.allowances.reduce((sum, allowance) => {
        return sum + (allowance.type === 'fixed' ? allowance.amount : (employee.baseSalary * allowance.amount / 100));
      }, 0) + additionalAllowances;
      
      const totalDeductions = employee.deductions.reduce((sum, deduction) => {
        return sum + (deduction.type === 'fixed' ? deduction.amount : (employee.baseSalary * deduction.amount / 100));
      }, 0) + additionalDeductions;

      const netSalary = salaryForWorkingDays + totalAllowances - totalDeductions;

      const salaryRecord: SalaryRecord = {
        id: Date.now().toString() + employeeId,
        employeeId,
        month,
        year,
        baseSalary: employee.baseSalary,
        allowances: totalAllowances,
        deductions: totalDeductions,
        leaveDays,
        workingDays: finalWorkingDays,
        netSalary,
        status: 'processed'
      };

      newSalaryRecords.push(salaryRecord);
    });

    setSalaryRecords(prev => [...prev, ...newSalaryRecords]);
    return newSalaryRecords;
  };

  const getSalariesByMonth = (month: string, year: number) => {
    return salaryRecords.filter(record => record.month === month && record.year === year);
  };

  return {
    employees: paginatedEmployees,
    allEmployees: employees,
    salaryRecords,
    loading,
    filters,
    setFilters,
    pagination,
    setPagination,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    calculateSalary,
    processSalary,
    processBulkSalaries,
    getSalariesByMonth
  };
};
