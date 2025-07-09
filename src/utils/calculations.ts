import { LineItem, Employee, SalaryRecord } from '@/types';

export const calculateInvoiceTotal = (lineItems: LineItem[], taxRate: number = 18) => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  return {
    subtotal,
    taxAmount,
    total: subtotal + taxAmount
  };
};

export const calculateEmployeeSalary = (
  employee: Employee,
  workingDays: number,
  totalDays: number,
  leaveDays: number = 0
) => {
  const perDaySalary = employee.baseSalary / totalDays;
  const salaryForWorkingDays = perDaySalary * workingDays;
  
  const totalAllowances = employee.allowances.reduce((sum, allowance) => {
    return sum + (allowance.type === 'fixed' 
      ? allowance.amount 
      : (employee.baseSalary * allowance.amount / 100)
    );
  }, 0);
  
  const totalDeductions = employee.deductions.reduce((sum, deduction) => {
    return sum + (deduction.type === 'fixed' 
      ? deduction.amount 
      : (employee.baseSalary * deduction.amount / 100)
    );
  }, 0);

  const netSalary = salaryForWorkingDays + totalAllowances - totalDeductions;
  
  return {
    baseSalary: salaryForWorkingDays,
    allowances: totalAllowances,
    deductions: totalDeductions,
    netSalary,
    perDaySalary
  };
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  const symbols: Record<string, string> = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£'
  };
  
  return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
};

export const calculateTax = (amount: number, taxRate: number) => {
  return (amount * taxRate) / 100;
};

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

export const getWorkingDaysInMonth = (month: number, year: number) => {
  const daysInMonth = getDaysInMonth(month, year);
  let workingDays = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    // Exclude weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  
  return workingDays;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
