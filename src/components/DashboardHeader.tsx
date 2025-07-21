
import React from "react";
import { BellIcon, CalendarIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext"; // Update the path to your context

interface DashboardHeaderProps {
  title: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
    const navigate = useNavigate();
    const { logout } = useAuth(); // from your AuthContext

    const handleLogout = async () => {
    try {
      const res = await fetch("https://accounting-app-production.up.railway.app/api/logout", {
        method: "POST",
        credentials: "include", // includes HttpOnly cookie
      });

      if (res.ok) {
        logout(); // clears user from context
        navigate("/login"); // redirects to login page
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b">
      <div>
        <h1 className="text-2xl font-bold text-accounting-dark-blue">{title}</h1>
        <div className="flex items-center text-muted-foreground text-sm">
          <CalendarIcon size={14} className="mr-1" />
          <span>{currentDate}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="rounded-full">
          <BellIcon size={18} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-accounting-blue text-white">
                  <UserIcon size={18} />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Organization</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DashboardHeader
