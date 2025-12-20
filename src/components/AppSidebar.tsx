
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Home,
  Receipt,
  Settings,
  Users,
  Menu,
  Calculator,
  Mail,
  Banknote,
  Receipt as ReceiptIcon,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/auth/AuthContext';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  href,
  isActive = false,
}) => {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 font-normal text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
          isActive && "bg-sidebar-accent text-sidebar-foreground"
        )}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Button>
    </Link>
  );
};

interface AppSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Receipt, label: "Invoices", href: "/invoices" },
    { icon: FileText, label: "Vendor Bills", href: "/vendor-bills" },
    { icon: Calculator, label: "Taxes", href: "/taxes" },
    { icon: Banknote, label: "Salaries", href: "/salaries" },
    // { icon: Banknote, label: "Team members", href: "/team-members" },
    { icon: ReceiptIcon, label: "Expenses", href: "/expenses" },
    // { icon: BarChart3, label: "Reports", href: "/reports" },
    { icon: Users, label: "Contacts", href: "/contacts" },
    // { icon: Mail, label: "Email Templates", href: "/email-templates" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];
  const { user } = useAuth();

  return (
    <div
      className={cn(
        "h-screen bg-sidebar transition-all duration-300 overflow-hidden flex flex-col border-r border-sidebar-border",
        isCollapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="font-bold text-xl text-white">CloudScribe</div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-sidebar-accent"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </Button>
      </div>
      <Separator className="bg-sidebar-border/50" />
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <div key={item.href}>
              {isCollapsed ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-full h-10 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                    currentPath === item.href &&
                      "bg-sidebar-accent text-sidebar-foreground"
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon size={18} />
                  </Link>
                </Button>
              ) : (
                <NavItem
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isActive={currentPath === item.href}
                />
              )}
            </div>
          ))}
        </nav>
      </div>
      
      {/* User Profile Section */}
      <div className="p-4">
        <Separator className="bg-sidebar-border/50 mb-4" />
        {isCollapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-10 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            asChild
          >
            <Link to="/profile">
              <User size={18} />
            </Link>
          </Button>
        ) : (
          <Link to="/profile">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 font-normal text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <User size={18} />
              <div className="flex flex-col items-start">
                <span className="text-sm">{user?.name || 'Loading...'}</span>
                <span className="text-xs text-sidebar-foreground/50">{user?.role?.toUpperCase()}</span>
              </div>
            </Button>
          </Link>
        )}
        {!isCollapsed && (
          <div className="text-xs text-white/50 text-center mt-2">
            CloudScribe Finance v1.0
          </div>
        )}
      </div>
    </div>
  );
};

export default AppSidebar;
