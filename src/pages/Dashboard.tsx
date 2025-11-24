
import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  TrendingUpIcon,
  BanknoteIcon,
  ReceiptCentIcon,
  ShoppingBagIcon,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import InvoiceStatusChart from "@/components/dashboard/InvoiceStatusChart";
import RecentInvoices from "@/components/dashboard/RecentInvoices";
import UpcomingPayments from "@/components/dashboard/UpcomingPayments";
import { toast } from "sonner";

export interface Invoice {
  _id: string;
  tenantId: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  status: 'paid' | 'unpaid' | 'partial' | 'overdue';
}

const Dashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
      const baseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`${baseUrl}/invoices`, {
          credentials: 'include'
        });
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const totalAmount = invoices.reduce((sum, i) => sum + i.total, 0);
  const amount = '₹ '+ totalAmount.toFixed(2);
  console.log("total amount is: ", totalAmount);  

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar 
          isCollapsed={sidebarCollapsed} 
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <div className="flex-1">
          <DashboardHeader />
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Total Revenue"
                value={amount}
                icon={<BanknoteIcon size={24} />}
                // trend={{ value: 12.5, isPositive: true }}
              />
              <StatCard
                title="Total Expenses"
                value="Coming Soon"
                icon={<ShoppingBagIcon size={24} />}
                // trend={{ value: 3.2, isPositive: false }}
              />
              <StatCard
                title="Net Profit"
                value="Coming Soon"
                icon={<TrendingUpIcon size={24} />}
                trend={{ value: 8.7, isPositive: true }}
              />
              <StatCard
                title="Tax Liability"
                value="Coming Soon"
                icon={<ReceiptCentIcon size={24} />}
                trend={{ value: 5.3, isPositive: false }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <RevenueChart />
              <InvoiceStatusChart invoices={invoices} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentInvoices invoices={invoices}/>
              <UpcomingPayments />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
