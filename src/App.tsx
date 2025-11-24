import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import VendorBills from "./pages/VendorBills";
import Taxes from "./pages/Taxes";
import Reports from "./pages/Reports";
import Contacts from "./pages/Contacts";
import EmailTemplates from "./pages/EmailTemplates";
import Settings, { SettingsContext } from "./pages/Settings";
import Salaries from "./pages/Salaries";
import TeamMembers from "./pages/TeamMembers";
import Expenses from "./pages/Expenses";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import { useAuth } from "./auth/AuthContext"; // make sure this exists
import ProtectedRoute from "./auth/ProtectedRoute";



// Define default settings
const defaultSettings = {
  companySettings: {
    name: "CloudScribe Finance",
    email: "admin@cloudscribe.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Plaza, Suite 101, San Francisco, CA 94107",
    taxId: "TAX87654321",
    logo: "",
    currency: "INR",
    departments: ["Sales", "Digital", "Technical"]
  },
  emailSettings: {
    smtpServer: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "notifications@cloudscribe.com",
    smtpPassword: "************",
    enableEmailNotifications: true,
    sendInvoiceReminders: true,
    sendPaymentReceipts: true
  },
  taxSettings: {
    gstRate: "18",
    tdsRate: "10",
    enableAutoCalculation: true,
    taxes: [
      { id: "1", name: "CGST", percentage: 9 },
      { id: "2", name: "SGST", percentage: 9 },
      { id: "3", name: "IGST", percentage: 18 },
    ]
  },
  currencies: [
    { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
    { value: "USD", label: "US Dollar ($)", symbol: "$" },
    { value: "EUR", label: "Euro (€)", symbol: "€" },
    { value: "GBP", label: "British Pound (£)", symbol: "£" },
  ],
};

const App = () => {

const auth = useAuth(); // always call the hook!
const user = auth?.user;
const loading = auth?.loading;
  // Create Query Client inside the component
  const [queryClient] = useState(() => new QueryClient());
  const [appSettings, setAppSettings] = useState(defaultSettings);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      const savedCompanySettings = localStorage.getItem("companySettings");
      const savedEmailSettings = localStorage.getItem("emailSettings");
      const savedTaxSettings = localStorage.getItem("taxSettings");
      
      const settings = { ...defaultSettings };
      
      if (savedCompanySettings) {
        settings.companySettings = JSON.parse(savedCompanySettings);
      }
      if (savedEmailSettings) {
        settings.emailSettings = JSON.parse(savedEmailSettings);
      }
      if (savedTaxSettings) {
        settings.taxSettings = JSON.parse(savedTaxSettings);
      }
      
      setAppSettings(settings);
    };
    
    loadSettings();
    
    // Listen for storage events to update settings when changed in another tab
    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsContext.Provider value={appSettings}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />}/>
              {user ? (
                <>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/vendor-bills" element={<VendorBills />} />
              <Route path="/taxes" element={<Taxes />} />
              {/* <Route path="/reports" element={<Reports />} /> */}
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/email-templates" element={<EmailTemplates />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/salaries" element={<Salaries />} />
              <Route path="/team-members" element={<TeamMembers />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
                </>
              ) : (
                <Route path="*" element={<Navigate to="/login" />} />
              )}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SettingsContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
