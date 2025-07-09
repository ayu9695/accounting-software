
import React, { useState } from "react";
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

const Dashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
                value="hi"
                icon={<BanknoteIcon size={24} />}
                trend={{ value: 12.5, isPositive: true }}
              />
              <StatCard
                title="Total Expenses"
                value="$18,230.00"
                icon={<ShoppingBagIcon size={24} />}
                trend={{ value: 3.2, isPositive: false }}
              />
              <StatCard
                title="Net Profit"
                value="$6,550.00"
                icon={<TrendingUpIcon size={24} />}
                trend={{ value: 8.7, isPositive: true }}
              />
              <StatCard
                title="Tax Liability"
                value="$2,980.00"
                icon={<ReceiptCentIcon size={24} />}
                trend={{ value: 5.3, isPositive: false }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <RevenueChart />
              <InvoiceStatusChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentInvoices />
              <UpcomingPayments />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
